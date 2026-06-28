from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.client import Client
from app.models.module_registry import ModuleRegistry
from app.models.operator import Operator
from app.services.audit_service import log_audit
from app.services.module_service import (
    client_modules_state,
    compute_module_stats,
    disable_module,
    enable_module,
    module_to_dict,
    seed_module_registry,
    set_client_modules,
)

router = APIRouter(prefix="/modules", tags=["modules"])


class ClientModulesUpdate(BaseModel):
    enabled_modules: list[str]


@router.get("/stats")
def module_stats(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    return compute_module_stats(db)


@router.get("")
def list_modules(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    modules = db.query(ModuleRegistry).order_by(ModuleRegistry.tier, ModuleRegistry.label).all()
    return [module_to_dict(m) for m in modules]


@router.get("/clients/{client_id}")
def get_client_modules(
    client_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client_modules_state(db, client_id)


@router.put("/clients/{client_id}")
def update_client_modules(
    client_id: str,
    body: ClientModulesUpdate,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    try:
        enabled = set_client_modules(db, client_id, body.enabled_modules)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="modules.update",
        operator=op,
        resource="module",
        resource_id=client_id,
        detail=f"enabled={','.join(enabled)}",
    )
    return {"client_id": client_id, "enabled_modules": enabled}


@router.post("/clients/{client_id}/{module_code}/enable")
def enable_client_module(
    client_id: str,
    module_code: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    try:
        enable_module(db, client_id, module_code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="module.enable",
        operator=op,
        resource="module",
        resource_id=f"{client_id}:{module_code}",
    )
    return {"client_id": client_id, "module_code": module_code, "status": "enabled"}


@router.post("/clients/{client_id}/{module_code}/disable")
def disable_client_module(
    client_id: str,
    module_code: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    try:
        disable_module(db, client_id, module_code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="module.disable",
        operator=op,
        resource="module",
        resource_id=f"{client_id}:{module_code}",
    )
    return {"client_id": client_id, "module_code": module_code, "status": "disabled"}


@router.get("/catalog/{module_code}")
def get_module(
    module_code: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    mod = db.query(ModuleRegistry).filter(ModuleRegistry.code == module_code).first()
    if not mod:
        raise HTTPException(status_code=404, detail="Module not found")
    stats = compute_module_stats(db)
    out = module_to_dict(mod)
    out["client_count"] = stats["client_counts"].get(module_code, 0)
    return out


@router.post("/seed", status_code=201)
def seed_modules(
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    if op.role not in ("super_admin", "platform_admin"):
        raise HTTPException(status_code=403, detail="Admin required")
    count = seed_module_registry(db)
    return {"created": count}

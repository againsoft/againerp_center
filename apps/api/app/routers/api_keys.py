from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator, require_step_up
from app.models.operator import Operator
from app.services.api_key_service import create_api_key, list_api_keys, revoke_api_key
from app.services.audit_service import log_audit

router = APIRouter(prefix="/api-keys", tags=["api-keys"])


class ApiKeyCreate(BaseModel):
    name: str
    owner_type: str = "integration"
    owner_label: str
    owner_id: Optional[str] = None
    scopes: Optional[list[str]] = None
    expires_days: Optional[int] = None


@router.get("")
def list_keys(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return list_api_keys(db)


@router.post("", status_code=201)
def create_key(
    body: ApiKeyCreate,
    db: Session = Depends(get_db),
    op: Operator = Depends(require_step_up),
) -> dict:
    try:
        out, raw_key = create_api_key(
            db,
            name=body.name,
            owner_type=body.owner_type,
            owner_label=body.owner_label,
            owner_id=body.owner_id,
            scopes=body.scopes,
            expires_days=body.expires_days,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="api_key.create",
        operator=op,
        resource="security",
        resource_id=out["id"],
        detail=f"name={body.name}, owner={body.owner_type}",
    )
    return {"key": out, "secret": raw_key}


@router.post("/{key_id}/revoke")
def revoke_key(
    key_id: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(require_step_up),
) -> dict:
    try:
        out = revoke_api_key(db, key_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

    log_audit(
        db,
        action="api_key.revoke",
        operator=op,
        resource="security",
        resource_id=key_id,
    )
    return out

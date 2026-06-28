from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.client import Client
from app.models.operator import Operator
from app.services.audit_service import log_audit
from app.services.backup_service import (
    compute_backup_stats,
    compute_fleet_statuses,
    complete_backup_simulation,
    list_backup_runs,
    record_to_dict,
    seed_sample_backups,
    trigger_backup,
    verify_backup,
)

router = APIRouter(prefix="/backups", tags=["backups"])


class TriggerBackupBody(BaseModel):
    backup_type: str = "full"


@router.get("/stats")
def backup_stats(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    return compute_backup_stats(db)


@router.get("/fleet")
def fleet_backup_status(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return compute_fleet_statuses(db)


@router.get("/runs")
def backup_runs(
    client_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return list_backup_runs(db, client_id=client_id, limit=min(limit, 100))


@router.get("/clients/{client_id}/runs")
def client_backup_runs(
    client_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return list_backup_runs(db, client_id=client_id)


@router.post("/clients/{client_id}/trigger", status_code=201)
def trigger_client_backup(
    client_id: str,
    body: TriggerBackupBody,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    try:
        rec = trigger_backup(db, client_id, body.backup_type)
        # Dev: simulate agent completion so UI updates immediately
        rec = complete_backup_simulation(db, rec.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="backup.trigger",
        operator=op,
        resource="backup",
        resource_id=rec.id,
        detail=f"type={rec.backup_type}",
    )
    return record_to_dict(rec, client.name)


@router.post("/runs/{record_id}/verify")
def verify_backup_run(
    record_id: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        rec = verify_backup(db, record_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    client = db.query(Client).filter(Client.id == rec.client_id).first()
    log_audit(
        db,
        action="backup.verify",
        operator=op,
        resource="backup",
        resource_id=rec.id,
    )
    return record_to_dict(rec, client.name if client else None)


@router.post("/seed", status_code=201)
def seed_backups(
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    if op.role not in ("super_admin", "platform_admin"):
        raise HTTPException(status_code=403, detail="Admin required")
    count = seed_sample_backups(db)
    return {"created": count}

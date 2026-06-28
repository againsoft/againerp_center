from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.audit_log import AuditLog
from app.models.operator import Operator

router = APIRouter(prefix="/audit", tags=["audit"])


def _audit_out(entry: AuditLog) -> dict:
    return {
        "id": entry.id,
        "operator_id": entry.operator_id,
        "operator_email": entry.operator_email,
        "action": entry.action,
        "resource": entry.resource,
        "resource_id": entry.resource_id,
        "detail": entry.detail,
        "ip_address": entry.ip_address,
        "created_at": entry.created_at.isoformat() if entry.created_at else None,
    }


@router.get("")
def list_audit_logs(
    resource: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    q = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    if resource:
        q = q.filter(AuditLog.resource == resource)
    return [_audit_out(e) for e in q.limit(min(limit, 500)).all()]

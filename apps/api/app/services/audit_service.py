from typing import Optional

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.operator import Operator


def log_audit(
    db: Session,
    *,
    action: str,
    operator: Optional[Operator] = None,
    resource: Optional[str] = None,
    resource_id: Optional[str] = None,
    detail: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> AuditLog:
    entry = AuditLog(
        operator_id=operator.id if operator else None,
        operator_email=operator.email if operator else None,
        action=action,
        resource=resource,
        resource_id=resource_id,
        detail=detail,
        ip_address=ip_address,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

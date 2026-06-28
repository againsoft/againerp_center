from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator, require_super_admin
from app.models.operator import Operator

router = APIRouter(prefix="/operators", tags=["operators"])


def _operator_list_item(op: Operator) -> dict:
    return {
        "id": op.id,
        "name": op.full_name or op.username,
        "email": op.email,
        "username": op.username,
        "role": op.role,
        "status": "active" if op.is_active else "disabled",
        "mfa_enabled": op.mfa_enabled,
        "mfa_type": op.mfa_type,
        "last_login": op.last_login.isoformat() if op.last_login else None,
        "created_at": op.created_at.isoformat() if op.created_at else None,
    }


@router.get("")
def list_operators(
    db: Session = Depends(get_db),
    _: Operator = Depends(require_super_admin),
) -> list:
    ops = db.query(Operator).order_by(Operator.created_at).all()
    return [_operator_list_item(op) for op in ops]


@router.get("/me")
def get_me(op: Operator = Depends(get_current_operator)) -> dict:
    return _operator_list_item(op)

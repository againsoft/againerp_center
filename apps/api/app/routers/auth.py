from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.deps.auth import create_access_token, get_current_operator, get_current_token_payload, verify_password
from app.models.operator import Operator
from app.services.audit_service import log_audit
from app.services.mfa_service import (
    begin_mfa_setup,
    confirm_mfa_setup,
    create_mfa_pending_token,
    decode_mfa_pending_token,
    disable_mfa,
    issue_session_token,
    operator_mfa_status,
    verify_login_mfa,
    verify_step_up,
)

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


class LoginRequest(BaseModel):
    email: str
    password: str


class MfaVerifyRequest(BaseModel):
    mfa_token: str
    code: str


class MfaCodeRequest(BaseModel):
    code: str


class LoginResponse(BaseModel):
    token: Optional[str] = None
    mfa_required: bool = False
    mfa_token: Optional[str] = None
    operator: Optional[dict] = None


def _operator_out(op: Operator) -> dict:
    return {
        "id": op.id,
        "email": op.email,
        "username": op.username,
        "role": op.role,
        "full_name": op.full_name,
        "mfa_enabled": op.mfa_enabled,
        "mfa_type": op.mfa_type,
    }


@router.post("/login")
def login(body: LoginRequest, db: Session = Depends(get_db)) -> dict:
    op = db.query(Operator).filter(Operator.email == body.email, Operator.is_active == True).first()
    if not op or not verify_password(body.password, op.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if op.mfa_enabled and op.mfa_secret:
        return {
            "mfa_required": True,
            "mfa_token": create_mfa_pending_token(op.id),
            "operator": {"email": op.email, "full_name": op.full_name},
        }

    op.last_login = datetime.utcnow()
    db.commit()

    token = issue_session_token(op)
    log_audit(db, action="login.success", resource="auth", resource_id=op.id, detail="password")
    return {
        "mfa_required": False,
        "token": token,
        "operator": _operator_out(op),
    }


@router.post("/mfa/verify")
def verify_mfa(body: MfaVerifyRequest, db: Session = Depends(get_db)) -> dict:
    operator_id = decode_mfa_pending_token(body.mfa_token)
    if not operator_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired MFA session")

    try:
        op = verify_login_mfa(db, operator_id, body.code)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e)) from e

    token = issue_session_token(op)
    log_audit(db, action="login.success", resource="auth", resource_id=op.id, detail="mfa")
    return {"token": token, "operator": _operator_out(op)}


@router.get("/me")
def me(op: Operator = Depends(get_current_operator)) -> dict:
    return _operator_out(op)


@router.get("/mfa/status")
def mfa_status(op: Operator = Depends(get_current_operator)) -> dict:
    return operator_mfa_status(op)


@router.post("/mfa/setup")
def mfa_setup(
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    if op.mfa_enabled:
        raise HTTPException(status_code=400, detail="MFA already enabled")
    return begin_mfa_setup(db, op)


@router.post("/mfa/confirm")
def mfa_confirm(
    body: MfaCodeRequest,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        confirm_mfa_setup(db, op, body.code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    db.refresh(op)
    log_audit(db, action="mfa.enable", operator=op, resource="auth", resource_id=op.id)
    return {"ok": True, "mfa": operator_mfa_status(op)}


@router.post("/mfa/disable")
def mfa_disable(
    body: MfaCodeRequest,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        disable_mfa(db, op, body.code)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    db.refresh(op)
    log_audit(db, action="mfa.disable", operator=op, resource="auth", resource_id=op.id)
    return {"ok": True, "mfa": operator_mfa_status(op)}


@router.post("/step-up")
def step_up(
    body: MfaCodeRequest,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        verify_step_up(op, body.code)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e

    token = issue_session_token(op, step_up=True)
    log_audit(db, action="mfa.step_up", operator=op, resource="auth", resource_id=op.id)
    return {"token": token, "step_up_valid_minutes": 5}


@router.post("/logout")
def logout() -> dict:
    return {"ok": True}

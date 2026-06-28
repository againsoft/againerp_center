import pyotp
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.operator import Operator

settings = get_settings()
MFA_ISSUER = "AgainERP Control Center"
STEP_UP_WINDOW_MINUTES = 5


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def provisioning_uri(email: str, secret: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=MFA_ISSUER)


def verify_totp(secret: str, code: str) -> bool:
    if not secret or not code:
        return False
    totp = pyotp.TOTP(secret)
    return totp.verify(code.strip(), valid_window=1)


def create_mfa_pending_token(operator_id: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=5)
    payload = {"sub": operator_id, "type": "mfa_pending", "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_mfa_pending_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("type") != "mfa_pending":
            return None
        return payload.get("sub")
    except JWTError:
        return None


def issue_session_token(op: Operator, *, step_up: bool = False) -> str:
    from app.deps.auth import create_access_token

    data = {
        "sub": op.id,
        "role": op.role,
        "mfa_verified": bool(op.mfa_enabled),
    }
    if step_up:
        data["step_up_at"] = datetime.utcnow().isoformat()
    return create_access_token(data)


def operator_mfa_status(op: Operator) -> dict:
    return {
        "enabled": op.mfa_enabled,
        "type": op.mfa_type,
        "pending_setup": bool(op.mfa_pending_secret and not op.mfa_enabled),
    }


def begin_mfa_setup(db: Session, op: Operator) -> dict:
    secret = generate_totp_secret()
    op.mfa_pending_secret = secret
    db.commit()
    return {
        "secret": secret,
        "provisioning_uri": provisioning_uri(op.email, secret),
        "issuer": MFA_ISSUER,
    }


def confirm_mfa_setup(db: Session, op: Operator, code: str) -> None:
    secret = op.mfa_pending_secret
    if not secret:
        raise ValueError("MFA setup not started")
    if not verify_totp(secret, code):
        raise ValueError("Invalid verification code")

    op.mfa_secret = secret
    op.mfa_pending_secret = None
    op.mfa_enabled = True
    op.mfa_type = "totp"
    db.commit()


def disable_mfa(db: Session, op: Operator, code: str) -> None:
    if not op.mfa_enabled or not op.mfa_secret:
        raise ValueError("MFA is not enabled")
    if not verify_totp(op.mfa_secret, code):
        raise ValueError("Invalid verification code")

    op.mfa_enabled = False
    op.mfa_secret = None
    op.mfa_pending_secret = None
    op.mfa_type = None
    db.commit()


def verify_login_mfa(db: Session, operator_id: str, code: str) -> Operator:
    op = db.query(Operator).filter(Operator.id == operator_id, Operator.is_active == True).first()
    if not op or not op.mfa_enabled or not op.mfa_secret:
        raise ValueError("Invalid MFA challenge")
    if not verify_totp(op.mfa_secret, code):
        raise ValueError("Invalid verification code")
    op.last_login = datetime.utcnow()
    db.commit()
    return op


def verify_step_up(op: Operator, code: str) -> None:
    if not op.mfa_enabled or not op.mfa_secret:
        raise ValueError("MFA must be enabled for step-up")
    if not verify_totp(op.mfa_secret, code):
        raise ValueError("Invalid verification code")

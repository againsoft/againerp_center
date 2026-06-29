from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.operator import Operator
from app.services.mfa_service import STEP_UP_WINDOW_MINUTES

settings = get_settings()
bearer = HTTPBearer(auto_error=False)


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def hash_password(plain: str) -> str:
    if len(plain.encode("utf-8")) > 72:
        raise ValueError("Password must be 72 bytes or fewer")
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def decode_token(credentials: HTTPAuthorizationCredentials) -> dict:
    try:
        return jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from e


def get_current_operator(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: Session = Depends(get_db),
) -> Operator:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = decode_token(credentials)
    operator_id: str = payload.get("sub", "")

    op = db.query(Operator).filter(Operator.id == operator_id, Operator.is_active == True).first()
    if not op:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Operator not found")
    return op


def get_current_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
) -> dict:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return decode_token(credentials)


def require_step_up(
    payload: dict = Depends(get_current_token_payload),
    op: Operator = Depends(get_current_operator),
) -> Operator:
    if not op.mfa_enabled:
        return op

    step_up_at = payload.get("step_up_at")
    if not step_up_at:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Step-up MFA required — POST /api/v1/auth/step-up with TOTP code",
        )
    try:
        verified_at = datetime.fromisoformat(step_up_at)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid step-up token") from None

    if datetime.utcnow() - verified_at > timedelta(minutes=STEP_UP_WINDOW_MINUTES):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Step-up MFA expired — re-verify within 5 minutes",
        )
    return op


def require_super_admin(op: Operator = Depends(get_current_operator)) -> Operator:
    if op.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin required")
    return op

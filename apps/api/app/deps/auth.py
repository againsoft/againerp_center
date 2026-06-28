from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.operator import Operator

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.access_token_expire_minutes))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def get_current_operator(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer),
    db: Session = Depends(get_db),
) -> Operator:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(credentials.credentials, settings.secret_key, algorithms=[settings.algorithm])
        operator_id: str = payload.get("sub", "")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    op = db.query(Operator).filter(Operator.id == operator_id, Operator.is_active == True).first()
    if not op:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Operator not found")
    return op


def require_super_admin(op: Operator = Depends(get_current_operator)) -> Operator:
    if op.role != "super_admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin required")
    return op

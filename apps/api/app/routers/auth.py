from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import create_access_token, get_current_operator, verify_password
from app.models.operator import Operator

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    operator: dict


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    op = db.query(Operator).filter(Operator.email == body.email, Operator.is_active == True).first()
    if not op or not verify_password(body.password, op.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    op.last_login = datetime.utcnow()
    db.commit()

    token = create_access_token({"sub": op.id, "role": op.role})
    return LoginResponse(
        token=token,
        operator={"id": op.id, "email": op.email, "username": op.username, "role": op.role, "full_name": op.full_name},
    )


@router.get("/me")
def me(op: Operator = Depends(get_current_operator)) -> dict:
    return {"id": op.id, "email": op.email, "username": op.username, "role": op.role, "full_name": op.full_name}


@router.post("/logout")
def logout() -> dict:
    return {"ok": True}

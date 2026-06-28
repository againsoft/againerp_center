from typing import Optional

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.agent_token import AgentToken
from app.services.license_service import verify_agent_token


def get_current_agent(
    authorization: Optional[str] = Header(None),
    x_agent_token: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> AgentToken:
    raw = None
    if authorization and authorization.startswith("Bearer "):
        raw = authorization[7:]
    elif x_agent_token:
        raw = x_agent_token

    if not raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Agent token required")

    token = verify_agent_token(db, raw)
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid agent token")
    return token

from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.agent import get_current_agent
from app.deps.auth import get_current_operator
from app.models.agent_token import AgentToken
from app.models.client import Client
from app.models.operator import Operator
from app.services.pagespeed_service import run_client_pagespeed_audit, run_pagespeed_audit

router = APIRouter(prefix="/pagespeed", tags=["pagespeed"])


class PageSpeedAuditRequest(BaseModel):
    url: str = Field(..., min_length=1, description="Public URL to analyze (http or https)")
    strategy: Literal["mobile", "desktop"] = "mobile"


class ClientPageSpeedAuditRequest(BaseModel):
    url: Optional[str] = Field(
        None,
        description="URL to analyze — defaults to the client store domain when omitted",
    )
    strategy: Literal["mobile", "desktop"] = "mobile"


@router.post("/audit")
def operator_pagespeed_audit(
    body: PageSpeedAuditRequest,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    """Run PageSpeed audit for any URL (operator). Uses the platform PageSpeed API key."""
    return run_pagespeed_audit(db, body.url, strategy=body.strategy)


@router.post("/clients/{client_id}/audit")
def operator_client_pagespeed_audit(
    client_id: str,
    body: ClientPageSpeedAuditRequest,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    """Run PageSpeed audit for a registered client store (operator)."""
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return run_client_pagespeed_audit(db, client, url=body.url, strategy=body.strategy)

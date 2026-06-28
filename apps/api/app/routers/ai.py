from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator, require_step_up
from app.models.operator import Operator
from app.services.ai_service import (
    PLATFORM_AGENTS,
    compute_ai_stats,
    compute_fleet_access,
    generate_chief_briefing,
    generate_recommendations,
    get_client_access,
)
from app.services.audit_service import log_audit

router = APIRouter(prefix="/ai", tags=["ai"])


class AiAccessPatch(BaseModel):
    ai_enabled: Optional[bool] = None


@router.get("/stats")
def ai_stats(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    return compute_ai_stats(db)


@router.get("/fleet")
def ai_fleet(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return compute_fleet_access(db)


@router.get("/recommendations")
def ai_recommendations(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    fleet = compute_fleet_access(db)
    return generate_recommendations(fleet)


@router.get("/agents")
def platform_ai_agents(
    _: Operator = Depends(get_current_operator),
) -> list:
    return PLATFORM_AGENTS


@router.get("/briefing")
def chief_ai_briefing(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    return generate_chief_briefing(db)


@router.get("/clients/{client_id}")
def client_ai_access(
    client_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    row = get_client_access(db, client_id)
    if not row:
        raise HTTPException(status_code=404, detail="Client not found")
    return row


@router.patch("/clients/{client_id}")
def update_client_ai_access(
    client_id: str,
    body: AiAccessPatch,
    db: Session = Depends(get_db),
    op: Operator = Depends(require_step_up),
) -> dict:
    from app.models.client_ai_access import ClientAiAccess

    row = get_client_access(db, client_id)
    if not row:
        raise HTTPException(status_code=404, detail="Client not found")

    access = db.query(ClientAiAccess).filter(ClientAiAccess.client_id == client_id).first()
    if body.ai_enabled is not None:
        access.ai_enabled = body.ai_enabled
        access.access_status = "active" if body.ai_enabled else "disabled"
        if body.ai_enabled and access.agents_active == 0:
            access.agents_active = max(1, access.agents_limit // 2)
        if not body.ai_enabled:
            access.agents_active = 0
        db.commit()

    log_audit(
        db,
        action="ai.access.update",
        operator=op,
        resource="ai",
        resource_id=client_id,
        detail=f"ai_enabled={access.ai_enabled}",
    )
    return get_client_access(db, client_id)

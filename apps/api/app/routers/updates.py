from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.client_update_state import ClientUpdateState
from app.models.erp_version import ErpVersion
from app.models.operator import Operator
from app.models.update_rollout import UpdateRollout
from app.services.audit_service import log_audit
from app.services.update_service import (
    advance_rollout_stage,
    client_update_to_dict,
    compute_update_stats,
    create_rollout,
    enrich_client_updates,
    ensure_client_update_states,
    pause_rollout,
    push_client_update,
    resume_rollout,
    rollback_client_update,
    rollout_to_dict,
    schedule_client_update,
    seed_erp_versions,
    seed_sample_rollout,
    sync_current_versions_from_servers,
    version_to_dict,
)

router = APIRouter(prefix="/updates", tags=["updates"])


class RolloutCreate(BaseModel):
    name: str
    erp_version_id: str
    stage: str = "canary"


class ScheduleUpdateBody(BaseModel):
    scheduled_at: datetime


@router.get("/stats")
def update_stats(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    return compute_update_stats(db)


@router.get("/versions")
def list_versions(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    versions = db.query(ErpVersion).order_by(ErpVersion.released_at.desc()).all()
    return [version_to_dict(v) for v in versions]


@router.get("/rollouts")
def list_rollouts(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    q = db.query(UpdateRollout).order_by(UpdateRollout.created_at.desc())
    if status:
        q = q.filter(UpdateRollout.status == status)
    return [rollout_to_dict(r) for r in q.all()]


@router.post("/rollouts", status_code=201)
def create_rollout_route(
    body: RolloutCreate,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        rollout = create_rollout(db, name=body.name, erp_version_id=body.erp_version_id, stage=body.stage)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

    log_audit(
        db,
        action="rollout.create",
        operator=op,
        resource="update",
        resource_id=rollout.id,
        detail=f"version={rollout.target_version} stage={rollout.stage}",
    )
    return rollout_to_dict(rollout)


@router.post("/rollouts/{rollout_id}/advance")
def advance_rollout(
    rollout_id: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        rollout = advance_rollout_stage(db, rollout_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="rollout.advance",
        operator=op,
        resource="update",
        resource_id=rollout.id,
        detail=f"stage={rollout.stage}",
    )
    return rollout_to_dict(rollout)


@router.post("/rollouts/{rollout_id}/pause")
def pause_rollout_route(
    rollout_id: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        rollout = pause_rollout(db, rollout_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

    log_audit(db, action="rollout.pause", operator=op, resource="update", resource_id=rollout.id)
    return rollout_to_dict(rollout)


@router.post("/rollouts/{rollout_id}/resume")
def resume_rollout_route(
    rollout_id: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        rollout = resume_rollout(db, rollout_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

    log_audit(db, action="rollout.resume", operator=op, resource="update", resource_id=rollout.id)
    return rollout_to_dict(rollout)


@router.get("/fleet")
def list_fleet_updates(
    client_id: Optional[str] = None,
    status: Optional[str] = None,
    channel: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    sync_current_versions_from_servers(db)
    q = db.query(ClientUpdateState).order_by(ClientUpdateState.updated_at.desc())
    if client_id:
        q = q.filter(ClientUpdateState.client_id == client_id)
    if status and status != "all":
        q = q.filter(ClientUpdateState.status == status)
    if channel and channel != "all":
        q = q.filter(ClientUpdateState.channel == channel)
    return enrich_client_updates(db, q.all())


@router.get("/fleet/{client_id}")
def get_client_update(
    client_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    sync_current_versions_from_servers(db)
    state = db.query(ClientUpdateState).filter(ClientUpdateState.client_id == client_id).first()
    if not state:
        raise HTTPException(status_code=404, detail="Client update state not found")
    from app.models.client import Client
    client = db.query(Client).filter(Client.id == client_id).first()
    return client_update_to_dict(state, client.name if client else None)


@router.post("/fleet/{client_id}/push")
def push_update(
    client_id: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        state = push_client_update(db, client_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(db, action="update.push", operator=op, resource="update", resource_id=state.id)
    from app.models.client import Client
    client = db.query(Client).filter(Client.id == client_id).first()
    return client_update_to_dict(state, client.name if client else None)


@router.post("/fleet/{client_id}/schedule")
def schedule_update(
    client_id: str,
    body: ScheduleUpdateBody,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        state = schedule_client_update(db, client_id, body.scheduled_at)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(db, action="update.schedule", operator=op, resource="update", resource_id=state.id)
    from app.models.client import Client
    client = db.query(Client).filter(Client.id == client_id).first()
    return client_update_to_dict(state, client.name if client else None)


@router.post("/fleet/{client_id}/rollback")
def rollback_update(
    client_id: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        state = rollback_client_update(db, client_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(db, action="update.rollback", operator=op, resource="update", resource_id=state.id)
    from app.models.client import Client
    client = db.query(Client).filter(Client.id == client_id).first()
    return client_update_to_dict(state, client.name if client else None)


@router.post("/seed", status_code=201)
def seed_updates(
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    if op.role not in ("super_admin", "platform_admin"):
        raise HTTPException(status_code=403, detail="Admin required")
    versions = seed_erp_versions(db)
    ensure_client_update_states(db)
    rollouts = seed_sample_rollout(db)
    return {"versions": versions, "rollouts": rollouts}

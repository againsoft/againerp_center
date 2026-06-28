from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator, require_step_up
from app.models.operator import Operator
from app.services.agent_console_service import (
    compute_console_stats,
    compute_sync_queues,
    create_activation_bundle,
    enqueue_command,
    get_command,
    list_activation_bundles,
    list_commands,
    list_diagnostics,
    request_diagnostics,
)
from app.services.audit_service import log_audit

router = APIRouter(prefix="/agents", tags=["agents"])


class CommandCreate(BaseModel):
    client_id: str
    command_type: str
    payload_summary: str
    expires_hours: int = 2


class ActivationCreate(BaseModel):
    client_id: str
    expires_hours: int = 24


class DiagnosticRequest(BaseModel):
    client_id: str


@router.get("/stats")
def agent_console_stats(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    return compute_console_stats(db)


@router.get("/commands")
def agent_commands(
    client_id: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return list_commands(db, client_id=client_id, limit=limit)


@router.get("/commands/{command_id}")
def agent_command_detail(
    command_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    row = get_command(db, command_id)
    if not row:
        raise HTTPException(status_code=404, detail="Command not found")
    return row


@router.post("/commands", status_code=201)
def issue_command(
    body: CommandCreate,
    db: Session = Depends(get_db),
    op: Operator = Depends(require_step_up),
) -> dict:
    try:
        cmd = enqueue_command(
            db,
            body.client_id,
            body.command_type,
            body.payload_summary,
            op.email,
            expires_hours=body.expires_hours,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="agent.command.issue",
        operator=op,
        resource="agent",
        resource_id=cmd.id,
        detail=f"type={body.command_type}, client={body.client_id}",
    )
    return get_command(db, cmd.id)


@router.get("/activations")
def activation_bundles(
    client_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return list_activation_bundles(db, client_id=client_id)


@router.post("/activations", status_code=201)
def create_activation(
    body: ActivationCreate,
    db: Session = Depends(get_db),
    op: Operator = Depends(require_step_up),
) -> dict:
    try:
        bundle, secret = create_activation_bundle(
            db,
            body.client_id,
            op.email,
            expires_hours=body.expires_hours,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="agent.activation.create",
        operator=op,
        resource="agent",
        resource_id=bundle["id"],
        detail=f"client={body.client_id}",
    )
    return {"bundle": bundle, "bootstrap_token": secret}


@router.get("/sync-queues")
def sync_queues(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return compute_sync_queues(db)


@router.get("/diagnostics")
def agent_diagnostics(
    client_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    return list_diagnostics(db, client_id=client_id)


@router.post("/diagnostics", status_code=201)
def create_diagnostic_request(
    body: DiagnosticRequest,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        diag, _cmd = request_diagnostics(db, body.client_id, op.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    log_audit(
        db,
        action="agent.diagnostics.request",
        operator=op,
        resource="agent",
        resource_id=diag["id"],
        detail=f"client={body.client_id}",
    )
    return diag

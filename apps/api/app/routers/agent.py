import json
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.agent import get_current_agent
from app.models.agent_token import AgentToken
from app.models.client import Client
from app.models.health_snapshot import HealthSnapshot
from app.models.server import Server
from app.services.pagespeed_service import run_client_pagespeed_audit

router = APIRouter(prefix="/agent/v1", tags=["agent"])


class HeartbeatPayload(BaseModel):
    instance_id: str
    agent_version: Optional[str] = None
    erp_version: Optional[str] = None
    hostname: Optional[str] = None
    os_info: Optional[str] = None
    cpu_percent: Optional[float] = None
    memory_percent: Optional[float] = None
    disk_percent: Optional[float] = None
    uptime_seconds: Optional[int] = None
    status: str = "healthy"


class PageSpeedAuditPayload(BaseModel):
    url: Optional[str] = None
    strategy: str = "mobile"


def _health_status(payload: HeartbeatPayload) -> str:
    if payload.cpu_percent and payload.cpu_percent > 90:
        return "degraded"
    if payload.memory_percent and payload.memory_percent > 90:
        return "degraded"
    if payload.disk_percent and payload.disk_percent > 95:
        return "critical"
    return payload.status


@router.post("/heartbeat")
def agent_heartbeat(
    body: HeartbeatPayload,
    db: Session = Depends(get_db),
    agent: AgentToken = Depends(get_current_agent),
) -> dict:
    client_id = agent.client_id
    now = datetime.utcnow()
    health = _health_status(body)

    server = db.query(Server).filter(Server.instance_id == body.instance_id).first()
    if not server:
        server = Server(
            id=f"srv_{uuid.uuid4().hex[:12]}",
            client_id=client_id,
            instance_id=body.instance_id,
        )
        db.add(server)

    server.hostname = body.hostname
    server.agent_version = body.agent_version
    server.erp_version = body.erp_version
    server.os_info = body.os_info
    server.last_heartbeat_at = now
    server.health_status = health
    db.flush()

    snapshot = HealthSnapshot(
        client_id=client_id,
        server_id=server.id,
        cpu_percent=body.cpu_percent,
        memory_percent=body.memory_percent,
        disk_percent=body.disk_percent,
        uptime_seconds=body.uptime_seconds,
        status=health,
        payload=json.dumps(body.model_dump()),
    )
    db.add(snapshot)
    db.commit()

    return {
        "ok": True,
        "client_id": client_id,
        "server_id": server.id,
        "health_status": health,
        "received_at": now.isoformat(),
    }


@router.post("/pagespeed/audit")
def agent_pagespeed_audit(
    body: PageSpeedAuditPayload,
    db: Session = Depends(get_db),
    agent: AgentToken = Depends(get_current_agent),
) -> dict:
    """Run PageSpeed audit for the client store. Uses the shared platform API key."""
    client = db.query(Client).filter(Client.id == agent.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    strategy = body.strategy if body.strategy in ("mobile", "desktop") else "mobile"
    return run_client_pagespeed_audit(db, client, url=body.url, strategy=strategy)

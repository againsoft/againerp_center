from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.client import Client
from app.models.operator import Operator
from app.models.server import Server

router = APIRouter(prefix="/servers", tags=["servers"])

ONLINE_THRESHOLD = timedelta(minutes=5)


def _server_out(server: Server, client_name: Optional[str] = None) -> dict:
    now = datetime.utcnow()
    is_online = (
        server.last_heartbeat_at is not None
        and (now - server.last_heartbeat_at) < ONLINE_THRESHOLD
    )
    return {
        "id": server.id,
        "client_id": server.client_id,
        "client_name": client_name,
        "instance_id": server.instance_id,
        "hostname": server.hostname,
        "agent_version": server.agent_version,
        "erp_version": server.erp_version,
        "os_info": server.os_info,
        "health_status": server.health_status,
        "is_online": is_online,
        "last_heartbeat_at": server.last_heartbeat_at.isoformat() if server.last_heartbeat_at else None,
        "created_at": server.created_at.isoformat() if server.created_at else None,
    }


@router.get("")
def list_servers(
    client_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    q = db.query(Server).order_by(desc(Server.last_heartbeat_at))
    if client_id:
        q = q.filter(Server.client_id == client_id)

    servers = q.all()
    client_ids = {s.client_id for s in servers}
    clients = db.query(Client).filter(Client.id.in_(client_ids)).all() if client_ids else []
    name_map = {c.id: c.name for c in clients}

    return [_server_out(s, name_map.get(s.client_id)) for s in servers]


@router.get("/{server_id}")
def get_server(
    server_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    server = db.query(Server).filter(Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    client = db.query(Client).filter(Client.id == server.client_id).first()
    return _server_out(server, client.name if client else None)

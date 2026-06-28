from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.client import Client
from app.models.health_snapshot import HealthSnapshot
from app.models.operator import Operator
from app.models.server import Server

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

ONLINE_THRESHOLD = timedelta(minutes=5)


def _is_online(server: Server | None) -> bool:
    if not server or not server.last_heartbeat_at:
        return False
    return (datetime.utcnow() - server.last_heartbeat_at) < ONLINE_THRESHOLD


def _agent_status(server: Server | None) -> str:
    if not server:
        return "pending"
    if not _is_online(server):
        return "offline"
    if server.health_status in ("critical", "degraded"):
        return "degraded"
    return "connected"


def _latest_snapshots(db: Session, client_ids: list[str]) -> dict[str, HealthSnapshot]:
    out: dict[str, HealthSnapshot] = {}
    for cid in client_ids:
        snap = (
            db.query(HealthSnapshot)
            .filter(HealthSnapshot.client_id == cid)
            .order_by(desc(HealthSnapshot.recorded_at))
            .first()
        )
        if snap:
            out[cid] = snap
    return out


def _primary_servers(db: Session) -> dict[str, Server]:
    servers = db.query(Server).order_by(desc(Server.last_heartbeat_at)).all()
    out: dict[str, Server] = {}
    for s in servers:
        if s.client_id not in out:
            out[s.client_id] = s
    return out


def _format_ts(dt: datetime | None) -> str | None:
    return dt.isoformat() if dt else None


def _agent_row(client: Client, server: Server | None, snap: HealthSnapshot | None) -> dict:
    status = _agent_status(server)
    return {
        "client_id": client.id,
        "business_name": client.name,
        "instance_id": server.instance_id if server else client.id,
        "deployment_mode": "saas",
        "server_host": server.hostname if server else (client.domain or client.db_host),
        "agent_status": status,
        "last_heartbeat_at": _format_ts(server.last_heartbeat_at if server else None),
        "agent_version": server.agent_version if server else None,
        "erp_version": server.erp_version if server else None,
        "cpu_percent": snap.cpu_percent if snap else None,
        "memory_percent": snap.memory_percent if snap else None,
        "disk_percent": snap.disk_percent if snap else None,
        "uptime_seconds": snap.uptime_seconds if snap else None,
        "health_status": server.health_status if server else "unknown",
        "is_online": _is_online(server),
    }


@router.get("/agents")
def list_monitoring_agents(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    clients = db.query(Client).order_by(Client.created_at.desc()).all()
    client_ids = [c.id for c in clients]
    servers = _primary_servers(db)
    snapshots = _latest_snapshots(db, client_ids)
    return [_agent_row(c, servers.get(c.id), snapshots.get(c.id)) for c in clients]


@router.get("/snapshots")
def list_snapshots(
    client_id: Optional[str] = None,
    limit: int = 48,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    q = db.query(HealthSnapshot).order_by(desc(HealthSnapshot.recorded_at))
    if client_id:
        q = q.filter(HealthSnapshot.client_id == client_id)
    rows = q.limit(min(limit, 200)).all()
    rows.reverse()
    return [
        {
            "id": s.id,
            "client_id": s.client_id,
            "cpu_percent": s.cpu_percent,
            "memory_percent": s.memory_percent,
            "disk_percent": s.disk_percent,
            "status": s.status,
            "recorded_at": _format_ts(s.recorded_at),
        }
        for s in rows
    ]


@router.get("/fleet-series")
def fleet_metric_series(
    limit: int = 24,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    """Average CPU/RAM/disk across fleet from recent snapshots, bucketed by sample order."""
    snapshots = (
        db.query(HealthSnapshot)
        .order_by(desc(HealthSnapshot.recorded_at))
        .limit(min(limit * 10, 500))
        .all()
    )
    if not snapshots:
        return []

    snapshots.reverse()
    bucket_size = max(1, len(snapshots) // limit)
    series = []
    for i in range(0, len(snapshots), bucket_size):
        chunk = snapshots[i : i + bucket_size]
        if not chunk:
            continue
        avg_cpu = sum(s.cpu_percent or 0 for s in chunk) / len(chunk)
        avg_mem = sum(s.memory_percent or 0 for s in chunk) / len(chunk)
        avg_disk = sum(s.disk_percent or 0 for s in chunk) / len(chunk)
        ts = chunk[-1].recorded_at
        label = ts.strftime("%H:%M") if ts else f"{len(series):02d}"
        series.append({
            "label": label,
            "cpu": round(avg_cpu, 1),
            "ram": round(avg_mem, 1),
            "disk": round(avg_disk, 1),
            "apiP95": 0,
        })
    return series[-limit:]

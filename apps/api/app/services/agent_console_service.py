import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.deps.auth import hash_password
from app.models.activation_bundle import ActivationBundle
from app.models.agent_command import AgentCommand
from app.models.agent_diagnostic import AgentDiagnostic
from app.models.client import Client
from app.models.client_ai_access import ClientAiAccess
from app.models.server import Server

ONLINE_THRESHOLD = timedelta(minutes=5)
COMMAND_RISK = {
    "config.reload": "low",
    "diagnostics.collect": "low",
    "module.enable": "medium",
    "backup.run": "medium",
    "agent.restart": "medium",
    "update.apply": "high",
    "container.restart": "high",
}


def _iso(dt: Optional[datetime]) -> Optional[str]:
    return dt.isoformat() if dt else None


def _format_relative(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    delta = datetime.utcnow() - dt
    minutes = int(delta.total_seconds() // 60)
    if minutes < 60:
        return f"{minutes} min ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    if days == 1:
        return "Yesterday"
    return f"{days}d ago"


def _client_names(db: Session, client_ids: set[str]) -> dict[str, str]:
    if not client_ids:
        return {}
    clients = db.query(Client).filter(Client.id.in_(client_ids)).all()
    return {c.id: c.name for c in clients}


def _connectivity(db: Session, client_id: str) -> str:
    server = (
        db.query(Server)
        .filter(Server.client_id == client_id)
        .order_by(desc(Server.last_heartbeat_at))
        .first()
    )
    if not server or not server.last_heartbeat_at:
        return "offline"
    age = datetime.utcnow() - server.last_heartbeat_at
    if age > ONLINE_THRESHOLD:
        return "offline"
    if server.health_status in ("degraded", "critical"):
        return "degraded"
    return "online"


def _effective_status(cmd: AgentCommand) -> str:
    if cmd.status in ("queued", "delivered", "running") and cmd.expires_at < datetime.utcnow():
        return "expired"
    return cmd.status


def command_to_dict(cmd: AgentCommand, business_name: Optional[str] = None) -> dict:
    status = _effective_status(cmd)
    return {
        "id": cmd.id,
        "client_id": cmd.client_id,
        "business_name": business_name or cmd.client_id,
        "type": cmd.command_type,
        "risk": cmd.risk,
        "status": status,
        "issued_at": _iso(cmd.issued_at),
        "expires_at": _iso(cmd.expires_at),
        "delivered_at": _iso(cmd.delivered_at),
        "completed_at": _iso(cmd.completed_at),
        "issued_by": cmd.issued_by,
        "payload_summary": cmd.payload_summary,
        "result_summary": cmd.result_summary,
        "signature_valid": cmd.signature_valid,
        "correlation_id": cmd.correlation_id,
    }


def list_commands(db: Session, client_id: Optional[str] = None, limit: int = 100) -> list[dict]:
    q = db.query(AgentCommand).order_by(desc(AgentCommand.issued_at))
    if client_id:
        q = q.filter(AgentCommand.client_id == client_id)
    rows = q.limit(min(limit, 200)).all()
    names = _client_names(db, {r.client_id for r in rows})
    return [command_to_dict(r, names.get(r.client_id)) for r in rows]


def get_command(db: Session, command_id: str) -> Optional[dict]:
    cmd = db.query(AgentCommand).filter(AgentCommand.id == command_id).first()
    if not cmd:
        return None
    client = db.query(Client).filter(Client.id == cmd.client_id).first()
    return command_to_dict(cmd, client.name if client else None)


def enqueue_command(
    db: Session,
    client_id: str,
    command_type: str,
    payload_summary: str,
    issued_by: str,
    *,
    risk: Optional[str] = None,
    expires_hours: int = 2,
    correlation_id: Optional[str] = None,
) -> AgentCommand:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise ValueError("Client not found")

    now = datetime.utcnow()
    cmd = AgentCommand(
        id=f"cmd_{uuid.uuid4().hex[:12]}",
        client_id=client_id,
        command_type=command_type,
        risk=risk or COMMAND_RISK.get(command_type, "medium"),
        status="queued",
        payload_summary=payload_summary,
        issued_by=issued_by,
        correlation_id=correlation_id or f"corr-{uuid.uuid4().hex[:10]}",
        issued_at=now,
        expires_at=now + timedelta(hours=expires_hours),
    )
    db.add(cmd)
    db.commit()
    db.refresh(cmd)
    return cmd


def bundle_to_dict(bundle: ActivationBundle, business_name: Optional[str] = None) -> dict:
    status = bundle.status
    if status == "pending" and bundle.expires_at < datetime.utcnow():
        status = "expired"
    return {
        "id": bundle.id,
        "client_id": bundle.client_id,
        "business_name": business_name or bundle.client_id,
        "status": status,
        "created_at": _iso(bundle.created_at),
        "expires_at": _iso(bundle.expires_at),
        "activated_at": _iso(bundle.activated_at),
        "bootstrap_token_prefix": bundle.bootstrap_token_prefix,
        "created_by": bundle.created_by,
    }


def list_activation_bundles(db: Session, client_id: Optional[str] = None) -> list[dict]:
    q = db.query(ActivationBundle).order_by(desc(ActivationBundle.created_at))
    if client_id:
        q = q.filter(ActivationBundle.client_id == client_id)
    rows = q.all()
    names = _client_names(db, {r.client_id for r in rows})
    return [bundle_to_dict(r, names.get(r.client_id)) for r in rows]


def create_activation_bundle(
    db: Session,
    client_id: str,
    created_by: str,
    *,
    expires_hours: int = 24,
) -> tuple[dict, str]:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise ValueError("Client not found")

    raw = f"bst_{secrets.token_hex(12)}"
    prefix = f"{raw[:12]}…"
    now = datetime.utcnow()

    bundle = ActivationBundle(
        id=f"act_{uuid.uuid4().hex[:12]}",
        client_id=client_id,
        status="pending",
        bootstrap_token_prefix=prefix,
        bootstrap_token_hash=hash_password(raw),
        created_by=created_by,
        expires_at=now + timedelta(hours=expires_hours),
    )
    db.add(bundle)
    db.commit()
    db.refresh(bundle)
    return bundle_to_dict(bundle, client.name), raw


def diagnostic_to_dict(diag: AgentDiagnostic, business_name: Optional[str] = None) -> dict:
    status = diag.status
    if status not in ("ready", "failed", "expired") and diag.expires_at < datetime.utcnow():
        status = "expired"
    return {
        "id": diag.id,
        "client_id": diag.client_id,
        "business_name": business_name or diag.client_id,
        "command_id": diag.command_id,
        "status": status,
        "requested_at": _iso(diag.requested_at),
        "requested_by": diag.requested_by,
        "bundle_size_mb": diag.bundle_size_mb,
        "uploaded_at": _iso(diag.uploaded_at),
        "expires_at": _iso(diag.expires_at),
        "bundle_prefix": diag.bundle_prefix,
    }


def list_diagnostics(db: Session, client_id: Optional[str] = None) -> list[dict]:
    q = db.query(AgentDiagnostic).order_by(desc(AgentDiagnostic.requested_at))
    if client_id:
        q = q.filter(AgentDiagnostic.client_id == client_id)
    rows = q.all()
    names = _client_names(db, {r.client_id for r in rows})
    return [diagnostic_to_dict(r, names.get(r.client_id)) for r in rows]


def request_diagnostics(db: Session, client_id: str, requested_by: str) -> tuple[dict, AgentCommand]:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise ValueError("Client not found")

    cmd = enqueue_command(
        db,
        client_id,
        "diagnostics.collect",
        "bundle: docker logs + agent config redacted",
        requested_by,
        expires_hours=24,
    )

    now = datetime.utcnow()
    prefix = f"diag_{client.slug[:8]}_{now.strftime('%Y%m%d')}…"
    diag = AgentDiagnostic(
        id=f"diag_{uuid.uuid4().hex[:12]}",
        client_id=client_id,
        command_id=cmd.id,
        status="collecting",
        requested_by=requested_by,
        bundle_prefix=prefix,
        requested_at=now,
        expires_at=now + timedelta(days=7),
    )
    db.add(diag)
    db.commit()
    db.refresh(diag)
    return diagnostic_to_dict(diag, client.name), cmd


def compute_sync_queues(db: Session) -> list[dict]:
    clients = db.query(Client).filter(Client.is_active == True).all()
    queues: list[dict] = []

    for client in clients:
        connectivity = _connectivity(db, client.id)
        pending_cmds = (
            db.query(AgentCommand)
            .filter(
                AgentCommand.client_id == client.id,
                AgentCommand.status.in_(("queued", "delivered", "running")),
            )
            .order_by(AgentCommand.issued_at)
            .all()
        )

        if pending_cmds:
            by_type: dict[str, list[AgentCommand]] = {}
            for cmd in pending_cmds:
                if cmd.command_type == "update.apply":
                    key = "update"
                elif cmd.command_type == "config.reload":
                    key = "config"
                else:
                    key = "command"
                by_type.setdefault(key, []).append(cmd)

            for queue_type, cmds in by_type.items():
                oldest = cmds[0].issued_at
                server = (
                    db.query(Server)
                    .filter(Server.client_id == client.id)
                    .order_by(desc(Server.last_heartbeat_at))
                    .first()
                )
                queues.append({
                    "id": f"sync_{client.id}_{queue_type}",
                    "client_id": client.id,
                    "business_name": client.name,
                    "connectivity": connectivity,
                    "queue_type": queue_type,
                    "pending_count": len(cmds),
                    "oldest_queued_at": _iso(oldest),
                    "grace_active": connectivity != "online",
                    "grace_expires_at": _iso(datetime.utcnow() + timedelta(days=7)) if connectivity != "online" else None,
                    "last_flush_at": _format_relative(server.last_heartbeat_at) if server and connectivity == "online" else None,
                    "summary": _sync_summary(queue_type, len(cmds), connectivity),
                })

        ai_row = db.query(ClientAiAccess).filter(ClientAiAccess.client_id == client.id).first()
        if ai_row and ai_row.ai_enabled and connectivity == "online":
            pending_ai = max(0, min(12, ai_row.credits_used // 10000))
            if pending_ai > 0:
                queues.append({
                    "id": f"sync_{client.id}_ai_request",
                    "client_id": client.id,
                    "business_name": client.name,
                    "connectivity": connectivity,
                    "queue_type": "ai_request",
                    "pending_count": pending_ai,
                    "oldest_queued_at": _iso(datetime.utcnow() - timedelta(minutes=pending_ai * 3)),
                    "grace_active": False,
                    "grace_expires_at": None,
                    "last_flush_at": _format_relative(datetime.utcnow() - timedelta(minutes=2)),
                    "summary": f"{pending_ai} AI proxy requests flushing — cloud proxy reachable",
                })

    return queues


def _sync_summary(queue_type: str, count: int, connectivity: str) -> str:
    if queue_type == "update":
        return f"{count} update command(s) queued — apply on next stable heartbeat window"
    if queue_type == "config":
        return f"{count} config delta(s) cached locally until sync completes"
    if connectivity == "offline":
        return f"Agent offline — {count} signed command(s) buffered until reconnect"
    return f"{count} command(s) pending delivery via heartbeat"


def compute_console_stats(db: Session) -> dict:
    commands = db.query(AgentCommand).all()
    bundles = db.query(ActivationBundle).all()
    diagnostics = db.query(AgentDiagnostic).all()
    sync_queues = compute_sync_queues(db)

    pending = sum(
        1 for c in commands if _effective_status(c) in ("queued", "delivered", "running")
    )
    succeeded = sum(1 for c in commands if c.status == "succeeded")
    failed_or_expired = sum(
        1 for c in commands if _effective_status(c) in ("failed", "expired")
    )

    now = datetime.utcnow()
    pending_bundles = sum(
        1 for b in bundles if b.status == "pending" and b.expires_at > now
    )

    return {
        "pending_commands": pending,
        "succeeded_commands": succeeded,
        "failed_or_expired": failed_or_expired,
        "pending_activations": pending_bundles,
        "offline_agents": sum(1 for q in sync_queues if q["connectivity"] == "offline"),
        "queued_items": sum(q["pending_count"] for q in sync_queues),
        "diagnostics_ready": sum(1 for d in diagnostics if d.status == "ready"),
        "diagnostics_pending": sum(
            1 for d in diagnostics if d.status in ("requested", "collecting", "uploading")
        ),
    }


def seed_agent_console(db: Session) -> int:
    if db.query(AgentCommand).count() > 0:
        return 0

    clients = db.query(Client).order_by(Client.created_at).all()
    if not clients:
        return 0

    created = 0
    now = datetime.utcnow()

    samples = [
        ("backup.run", "medium", "succeeded", "Backup Service", "scheduled nightly · encrypt · verify checksum", "verification passed"),
        ("diagnostics.collect", "low", "delivered", "support@againerp.com", "docker logs + agent config redacted", None),
        ("module.enable", "medium", "queued", "Module Service", "module inventory · entitlement verified", None),
        ("update.apply", "high", "running", "Update Service", "version 2026.6.1 · channel stable", None),
        ("agent.restart", "medium", "failed", "support@againerp.com", "graceful restart · preserve queue", "Agent offline — not delivered"),
    ]

    for i, client in enumerate(clients[:5]):
        spec = samples[i % len(samples)]
        cmd_type, risk, status, issued_by, payload, result = spec
        cmd = AgentCommand(
            id=f"cmd_{uuid.uuid4().hex[:12]}",
            client_id=client.id,
            command_type=cmd_type,
            risk=risk,
            status=status,
            payload_summary=payload,
            result_summary=result,
            issued_by=issued_by,
            correlation_id=f"corr-seed-{uuid.uuid4().hex[:8]}",
            issued_at=now - timedelta(hours=i * 6 + 2),
            expires_at=now + timedelta(hours=2),
            delivered_at=now - timedelta(hours=i * 6 + 1) if status != "queued" else None,
            completed_at=now - timedelta(hours=i * 6) if status == "succeeded" else None,
        )
        db.add(cmd)
        created += 1

        if cmd_type == "diagnostics.collect":
            db.add(AgentDiagnostic(
                id=f"diag_{uuid.uuid4().hex[:12]}",
                client_id=client.id,
                command_id=cmd.id,
                status="collecting" if status == "delivered" else "ready",
                requested_by=issued_by,
                bundle_prefix=f"diag_{client.slug[:8]}_{now.strftime('%Y%m%d')}…",
                requested_at=cmd.issued_at,
                expires_at=now + timedelta(days=7),
                uploaded_at=now - timedelta(hours=1) if status == "succeeded" else None,
                bundle_size_mb=48.0 if status == "succeeded" else None,
            ))

        if i < 2:
            raw = f"bst_{secrets.token_hex(8)}"
            db.add(ActivationBundle(
                id=f"act_{uuid.uuid4().hex[:12]}",
                client_id=client.id,
                status="pending" if i == 0 else "activated",
                bootstrap_token_prefix=f"{raw[:12]}…",
                bootstrap_token_hash=hash_password(raw),
                created_by="platform@againerp.com",
                created_at=now - timedelta(days=i + 1),
                expires_at=now + timedelta(hours=24),
                activated_at=now - timedelta(days=i) if i == 1 else None,
            ))

    db.commit()
    return created

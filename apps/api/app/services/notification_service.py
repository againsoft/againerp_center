from __future__ import annotations

from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.models.agent_command import AgentCommand
from app.models.api_key import ApiKey
from app.models.billing_invoice import BillingInvoice
from app.models.client import Client
from app.models.registration import Registration
from app.models.server import Server
from app.models.update_rollout import UpdateRollout

ONLINE_THRESHOLD = timedelta(minutes=5)


def _format_relative(dt: Optional[datetime]) -> str:
    if not dt:
        return "Now"
    delta = datetime.utcnow() - dt
    minutes = int(delta.total_seconds() // 60)
    if minutes < 1:
        return "Just now"
    if minutes < 60:
        return f"{minutes}m ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    if days == 1:
        return "1d ago"
    return f"{days}d ago"


def _is_online(server: Server | None) -> bool:
    if not server or not server.last_heartbeat_at:
        return False
    return (datetime.utcnow() - server.last_heartbeat_at) < ONLINE_THRESHOLD


def _primary_servers(db: Session) -> dict[str, Server]:
    servers = db.query(Server).order_by(desc(Server.last_heartbeat_at)).all()
    out: dict[str, Server] = {}
    for s in servers:
        if s.client_id not in out:
            out[s.client_id] = s
    return out


def _pending_commands(db: Session, client_id: str) -> int:
    return (
        db.query(AgentCommand)
        .filter(
            AgentCommand.client_id == client_id,
            AgentCommand.status.in_(("queued", "delivered", "running")),
        )
        .count()
    )


def generate_platform_notifications(db: Session) -> list[dict]:
    """Derive operator notifications from live fleet metadata — no client business data."""
    notifications: list[dict] = []
    clients = db.query(Client).order_by(Client.name).all()
    client_map = {c.id: c for c in clients}
    servers = _primary_servers(db)

    for client in clients:
        if not client.is_active or client.status.lower() == "suspended":
            notifications.append({
                "id": f"ntf-billing-suspended-{client.id}",
                "category": "billing",
                "severity": "critical",
                "title": f"{client.name} suspended",
                "body": "Account inactive or payment overdue — client may be in read-only mode.",
                "href": f"/center/clients/{client.id}",
                "time": _format_relative(client.updated_at),
                "created_at": client.updated_at.isoformat() if client.updated_at else None,
            })

    for client_id, server in servers.items():
        name = client_map.get(client_id, Client(name=client_id)).name
        if server.health_status == "critical":
            notifications.append({
                "id": f"ntf-agent-critical-{server.id}",
                "category": "agent",
                "severity": "critical",
                "title": f"{name} agent critical",
                "body": "Health thresholds exceeded — investigate infrastructure immediately.",
                "href": f"/center/monitoring?client={client_id}",
                "time": _format_relative(server.last_heartbeat_at),
                "created_at": server.last_heartbeat_at.isoformat() if server.last_heartbeat_at else None,
            })
        elif not _is_online(server) and server.last_heartbeat_at:
            pending = _pending_commands(db, client_id)
            body = f"No heartbeat in 5+ minutes — last seen {_format_relative(server.last_heartbeat_at)}."
            if pending:
                body += f" {pending} command{'s' if pending > 1 else ''} buffered in sync queue."
            notifications.append({
                "id": f"ntf-agent-offline-{server.id}",
                "category": "agent",
                "severity": "critical" if pending else "warning",
                "title": f"{name} agent offline",
                "body": body,
                "href": f"/center/agents?tab=sync&client={client_id}",
                "time": _format_relative(server.last_heartbeat_at),
                "created_at": server.last_heartbeat_at.isoformat() if server.last_heartbeat_at else None,
            })
        elif server.health_status == "degraded":
            notifications.append({
                "id": f"ntf-agent-degraded-{server.id}",
                "category": "agent",
                "severity": "warning",
                "title": f"{name} agent degraded",
                "body": "Resource usage elevated — review monitoring before next update window.",
                "href": f"/center/monitoring?client={client_id}",
                "time": _format_relative(server.last_heartbeat_at),
                "created_at": server.last_heartbeat_at.isoformat() if server.last_heartbeat_at else None,
            })

    pending_regs = (
        db.query(Registration)
        .filter(Registration.status == "pending_review")
        .order_by(Registration.created_at.desc())
        .all()
    )
    if pending_regs:
        names = ", ".join(r.business_name for r in pending_regs[:3])
        if len(pending_regs) > 3:
            names += f" +{len(pending_regs) - 3} more"
        notifications.append({
            "id": "ntf-pending-registrations",
            "category": "registration",
            "severity": "warning",
            "title": f"{len(pending_regs)} registration{'s' if len(pending_regs) > 1 else ''} awaiting review",
            "body": f"{names} — approve or reject before onboarding.",
            "href": "/center/registrations",
            "time": _format_relative(pending_regs[0].created_at),
            "created_at": pending_regs[0].created_at.isoformat() if pending_regs[0].created_at else None,
        })

    rollouts = (
        db.query(UpdateRollout)
        .filter(UpdateRollout.status == "active")
        .order_by(UpdateRollout.started_at.desc())
        .all()
    )
    for rollout in rollouts:
        total = rollout.clients_total or 1
        pct = round((rollout.clients_complete / total) * 100) if total else 0
        failed_note = f" · {rollout.clients_failed} failed" if rollout.clients_failed else ""
        notifications.append({
            "id": f"ntf-rollout-{rollout.id}",
            "category": "update",
            "severity": "warning" if rollout.clients_failed else "info",
            "title": f"{rollout.target_version} rollout at {pct}%",
            "body": f"{rollout.name} — stage {rollout.stage}{failed_note}.",
            "href": "/center/updates",
            "time": _format_relative(rollout.started_at),
            "created_at": rollout.started_at.isoformat() if rollout.started_at else None,
        })

    now = datetime.utcnow()
    expiring_keys = (
        db.query(ApiKey)
        .filter(
            ApiKey.revoked_at.is_(None),
            ApiKey.expires_at.isnot(None),
            ApiKey.expires_at <= now + timedelta(days=14),
            ApiKey.expires_at > now,
        )
        .order_by(ApiKey.expires_at)
        .all()
    )
    for key in expiring_keys:
        days_left = (key.expires_at - now).days if key.expires_at else 0
        notifications.append({
            "id": f"ntf-api-key-{key.id}",
            "category": "security",
            "severity": "warning" if days_left <= 7 else "info",
            "title": f"API key expiring — {key.name}",
            "body": f"Key {key.key_prefix}… expires in {days_left} day{'s' if days_left != 1 else ''} — rotate before cutoff.",
            "href": "/center/settings/api-keys",
            "time": "Today" if days_left <= 1 else f"{days_left}d left",
            "created_at": key.expires_at.isoformat() if key.expires_at else None,
        })

    open_invoices = (
        db.query(BillingInvoice)
        .filter(BillingInvoice.status.in_(("open", "past_due")))
        .order_by(BillingInvoice.due_at)
        .limit(5)
        .all()
    )
    for inv in open_invoices:
        client = client_map.get(inv.client_id)
        name = client.name if client else inv.client_id
        due_note = "due soon"
        severity = "info"
        if inv.status == "past_due":
            due_note = "past due"
            severity = "critical"
        elif inv.due_at and inv.due_at <= now + timedelta(days=3):
            due_note = f"due in {(inv.due_at - now).days + 1} days"
            severity = "warning"
        notifications.append({
            "id": f"ntf-invoice-{inv.id}",
            "category": "billing",
            "severity": severity,
            "title": f"{name} invoice {due_note}",
            "body": f"{inv.invoice_number} — {inv.currency} {float(inv.amount):,.0f}.",
            "href": "/center/billing",
            "time": _format_relative(inv.issued_at or inv.created_at),
            "created_at": (inv.issued_at or inv.created_at).isoformat() if (inv.issued_at or inv.created_at) else None,
        })

    from app.services.backup_service import compute_fleet_statuses

    for status in compute_fleet_statuses(db):
        if status["status"] in ("overdue", "failed"):
            notifications.append({
                "id": f"ntf-backup-{status['client_id']}",
                "category": "system",
                "severity": "warning" if status["status"] == "overdue" else "critical",
                "title": f"{status['business_name']} backup {status['status']}",
                "body": status.get("error_message") or "Backup policy not satisfied — review backup fleet.",
                "href": f"/center/backups?client={status['client_id']}",
                "time": status.get("last_backup_at") or "Now",
                "created_at": None,
            })

    notifications.append({
        "id": "ntf-chief-briefing",
        "category": "system",
        "severity": "info",
        "title": "Chief AI briefing ready",
        "body": "Daily fleet synthesis available on platform dashboard.",
        "href": "/center",
        "time": "Today",
        "created_at": datetime.utcnow().isoformat(),
    })

    notifications.sort(
        key=lambda n: (
            {"critical": 0, "warning": 1, "info": 2}.get(n["severity"], 3),
            n.get("created_at") or "",
        ),
        reverse=False,
    )
    return notifications

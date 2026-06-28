import json
import uuid
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.client import Client
from app.models.client_ai_access import ClientAiAccess
from app.models.client_module import ClientModule
from app.models.server import Server
from app.models.subscription import Subscription

PLAN_AGENTS = {
    "starter": 2,
    "business": 4,
    "professional": 8,
    "enterprise": 12,
    "custom": 20,
}

PLATFORM_AGENTS = [
    {
        "id": "chief",
        "label": "Chief AI",
        "description": "Fleet-wide briefing, cross-domain insights, and operator copilot.",
        "autonomy": "Advisory — never executes without operator confirmation",
        "status": "active",
    },
    {
        "id": "health",
        "label": "Health AI",
        "description": "Agent heartbeat anomalies, DB latency, and degraded fleet detection.",
        "autonomy": "Detect & recommend — auto-ticket optional",
        "status": "active",
    },
    {
        "id": "recommendation",
        "label": "Recommendation AI",
        "description": "Module upsell, AI OS enablement, and plan-fit suggestions.",
        "autonomy": "Suggest only — provisioning requires operator",
        "status": "active",
    },
    {
        "id": "update",
        "label": "Update AI",
        "description": "Rollout risk scoring, version compatibility, and staged deploy advice.",
        "autonomy": "Advisory — rollout execution is operator-driven",
        "status": "active",
    },
    {
        "id": "license",
        "label": "License AI",
        "description": "Expiry forecasting, credit limit warnings, and compliance checks.",
        "autonomy": "Alert & recommend",
        "status": "active",
    },
    {
        "id": "monitoring",
        "label": "Monitoring AI",
        "description": "Fleet SLO summaries and incident correlation across clients.",
        "autonomy": "Read-only analysis",
        "status": "idle",
    },
    {
        "id": "automation",
        "label": "Automation AI",
        "description": "Runbook drafts and batch operations — human-in-the-loop required.",
        "autonomy": "Human-in-the-loop for all destructive actions",
        "status": "active",
    },
]

TOOL_PRESETS = {
    "starter": ["chat"],
    "business": ["chat", "catalog-assist"],
    "professional": ["chat", "automation", "catalog-assist"],
    "enterprise": ["chat", "automation", "developer", "configurator-assist"],
    "custom": ["chat", "automation", "developer", "configurator-assist"],
}


def _credit_status(used: int, limit: int) -> str:
    if limit <= 0:
        return "none"
    pct = used / limit
    if pct >= 1:
        return "exceeded"
    if pct >= 0.85:
        return "warning"
    return "ok"


def _access_status(client: Client, ai_enabled: bool) -> str:
    if client.status == "suspended":
        return "suspended"
    if ai_enabled:
        return "active"
    if client.status in ("trial", "pending"):
        return "pending"
    return "disabled"


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
    return dt.strftime("%d %b %Y")


def _agent_online(db: Session, client_id: str) -> bool:
    server = (
        db.query(Server)
        .filter(Server.client_id == client_id)
        .order_by(Server.last_heartbeat_at.desc())
        .first()
    )
    if not server or not server.last_heartbeat_at:
        return False
    return (datetime.utcnow() - server.last_heartbeat_at).total_seconds() < 300


def _has_ai_module(db: Session, client_id: str) -> bool:
    row = (
        db.query(ClientModule)
        .filter(ClientModule.client_id == client_id, ClientModule.module_code == "ai-os")
        .first()
    )
    return bool(row and row.status == "enabled")


def ensure_client_ai_access(
    db: Session,
    client_id: str,
    *,
    plan: str = "starter",
    wants_ai: bool = False,
    client_status: Optional[str] = None,
) -> ClientAiAccess:
    existing = db.query(ClientAiAccess).filter(ClientAiAccess.client_id == client_id).first()
    if existing:
        return existing

    client = db.query(Client).filter(Client.id == client_id).first()
    plan_key = (plan or (client.plan if client else "starter")).lower()
    agents_limit = PLAN_AGENTS.get(plan_key, 2)
    ai_module = _has_ai_module(db, client_id)
    ai_enabled = wants_ai or ai_module

    if client:
        access_status = _access_status(client, ai_enabled)
        if client.status in ("trial", "pending") and wants_ai and not ai_enabled:
            access_status = "pending"
    elif wants_ai:
        access_status = "pending"
    else:
        access_status = "disabled"

    access = ClientAiAccess(
        client_id=client_id,
        ai_enabled=ai_enabled,
        access_status=access_status,
        agents_limit=agents_limit,
        agents_active=agents_limit // 2 if ai_enabled else 0,
        credits_used=0,
        tools_enabled=json.dumps(TOOL_PRESETS.get(plan_key, ["chat"]) if ai_enabled else []),
        proxy_mode="cloud",
    )
    db.add(access)
    db.commit()
    db.refresh(access)
    return access


def _row_to_dict(db: Session, client: Client, row: ClientAiAccess, sub: Optional[Subscription]) -> dict:
    credits_monthly = sub.ai_credits_monthly if sub else 1000
    credits_status = _credit_status(row.credits_used, credits_monthly)
    online = _agent_online(db, client.id)

    return {
        "client_id": client.id,
        "business_name": client.name,
        "plan": client.plan,
        "client_status": client.status,
        "ai_enabled": row.ai_enabled,
        "access_status": row.access_status,
        "agents_limit": row.agents_limit,
        "agents_active": row.agents_active,
        "credits_monthly": credits_monthly,
        "credits_used": row.credits_used,
        "credits_status": credits_status,
        "tools_enabled": json.loads(row.tools_enabled or "[]"),
        "last_ai_request": _format_relative(row.last_ai_request),
        "proxy_mode": "queued" if not online and row.ai_enabled else row.proxy_mode,
    }


def compute_fleet_access(db: Session) -> list[dict]:
    clients = db.query(Client).order_by(Client.name).all()
    results = []
    for client in clients:
        row = db.query(ClientAiAccess).filter(ClientAiAccess.client_id == client.id).first()
        if not row:
            row = ensure_client_ai_access(db, client.id, plan=client.plan)
        sub = db.query(Subscription).filter(Subscription.client_id == client.id).first()
        results.append(_row_to_dict(db, client, row, sub))
    return results


def compute_ai_stats(db: Session) -> dict:
    fleet = compute_fleet_access(db)
    enabled = sum(1 for f in fleet if f["ai_enabled"])
    agents_active = sum(f["agents_active"] for f in fleet)
    agents_allocated = sum(f["agents_limit"] for f in fleet if f["ai_enabled"])
    total_used = sum(f["credits_used"] for f in fleet)
    total_limit = sum(f["credits_monthly"] for f in fleet if f["ai_enabled"])
    credit_pct = round((total_used / total_limit) * 100) if total_limit else 0
    credit_warnings = sum(1 for f in fleet if f["credits_status"] in ("warning", "exceeded"))
    recommendations = len(generate_recommendations(fleet))

    return {
        "fleet": len(fleet),
        "enabled": enabled,
        "agents_active": agents_active,
        "agents_allocated": agents_allocated,
        "credit_pct": credit_pct,
        "credit_warnings": credit_warnings,
        "recommendations": recommendations,
    }


def generate_recommendations(fleet: list[dict]) -> list[dict]:
    recs = []
    for row in fleet:
        if row["plan"] in ("enterprise", "custom") and not row["ai_enabled"]:
            recs.append({
                "id": f"ai-rec-enable-{row['client_id']}",
                "agent": "recommendation",
                "title": f"Enable AI OS for {row['business_name']}",
                "detail": f"{row['plan'].title()} plan includes AI credits — AI module not provisioned.",
                "client_id": row["client_id"],
                "client_name": row["business_name"],
                "severity": "action",
                "dismissed": False,
            })
        elif row["credits_status"] == "warning":
            recs.append({
                "id": f"ai-rec-credits-{row['client_id']}",
                "agent": "license",
                "title": f"{row['business_name']} approaching credit limit",
                "detail": f"{round(row['credits_used'] / row['credits_monthly'] * 100)}% of monthly AI credits consumed.",
                "client_id": row["client_id"],
                "client_name": row["business_name"],
                "severity": "warning",
                "dismissed": False,
            })
        elif row["access_status"] == "pending" and row["client_status"] in ("trial", "pending"):
            recs.append({
                "id": f"ai-rec-pending-{row['client_id']}",
                "agent": "health",
                "title": f"{row['business_name']} — AI intake pending",
                "detail": "Registration requested AI — enable after plan conversion.",
                "client_id": row["client_id"],
                "client_name": row["business_name"],
                "severity": "info",
                "dismissed": False,
            })
    return recs


def get_client_access(db: Session, client_id: str) -> Optional[dict]:
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        return None
    row = db.query(ClientAiAccess).filter(ClientAiAccess.client_id == client_id).first()
    if not row:
        row = ensure_client_ai_access(db, client_id, plan=client.plan)
    sub = db.query(Subscription).filter(Subscription.client_id == client_id).first()
    return _row_to_dict(db, client, row, sub)


def generate_chief_briefing(db: Session) -> dict:
    """Synthesize a daily operator briefing from fleet metadata — advisory only."""
    from app.models.registration import Registration
    from app.models.server import Server
    from app.models.update_rollout import UpdateRollout
    from sqlalchemy import desc

    fleet = compute_fleet_access(db)
    stats = compute_ai_stats(db)
    recommendations = generate_recommendations(fleet)
    insights: list[dict] = []

    degraded = (
        db.query(Server)
        .filter(Server.health_status.in_(("degraded", "critical")))
        .order_by(desc(Server.last_heartbeat_at))
        .first()
    )
    if degraded:
        client = db.query(Client).filter(Client.id == degraded.client_id).first()
        name = client.name if client else degraded.client_id
        insights.append({
            "id": "brief-monitoring",
            "source": "monitoring",
            "text": f"{name} agent health is {degraded.health_status}. Health AI suggests reviewing resource usage before the next update window.",
            "href": f"/center/monitoring?client={degraded.client_id}",
            "href_label": "View agent",
        })

    suspended = db.query(Client).filter(
        Client.is_active == False,  # noqa: E712
    ).first()
    if not suspended:
        suspended = db.query(Client).filter(Client.status.ilike("suspended")).first()
    if suspended:
        insights.append({
            "id": "brief-license",
            "source": "license",
            "text": f"{suspended.name} is suspended. License AI recommends follow-up before grace expires.",
            "href": f"/center/clients/{suspended.id}",
            "href_label": "Client detail",
        })

    pending_regs = db.query(Registration).filter(Registration.status == "pending_review").count()
    if pending_regs:
        ai_note = ""
        wants_ai = (
            db.query(Registration)
            .filter(Registration.status == "pending_review", Registration.wants_ai == True)  # noqa: E712
            .count()
        )
        if wants_ai:
            ai_note = f" {wants_ai} requested AI module on trial conversion."
        insights.append({
            "id": "brief-registrations",
            "source": "recommendation",
            "text": f"{pending_regs} registration{'s' if pending_regs > 1 else ''} await review — prioritize onboarding queue.{ai_note}",
            "href": "/center/registrations",
            "href_label": "Review queue",
        })

    credit_warning = next((f for f in fleet if f["credits_status"] in ("warning", "exceeded")), None)
    if credit_warning:
        pct = round(credit_warning["credits_used"] / credit_warning["credits_monthly"] * 100) if credit_warning["credits_monthly"] else 0
        insights.append({
            "id": f"brief-credits-{credit_warning['client_id']}",
            "source": "health",
            "text": f"{credit_warning['business_name']} at {pct}% AI credit usage. Consider proactive credit boost or plan upgrade.",
            "href": f"/center/ai-access?client={credit_warning['client_id']}",
            "href_label": "AI access",
        })

    rollout = (
        db.query(UpdateRollout)
        .filter(UpdateRollout.status == "active")
        .order_by(UpdateRollout.started_at.desc())
        .first()
    )
    if rollout:
        total = rollout.clients_total or 1
        pct = round((rollout.clients_complete / total) * 100)
        rollback_note = " with zero rollbacks" if not rollout.clients_failed else f" — {rollout.clients_failed} failed"
        insights.append({
            "id": f"brief-rollout-{rollout.id}",
            "source": "update",
            "text": f"{rollout.target_version} rollout at {pct}% complete{rollback_note}. Update AI recommends monitoring soak window.",
            "href": "/center/updates",
            "href_label": "Update manager",
        })

    for rec in recommendations[:2]:
        if any(i["id"] == f"brief-rec-{rec['id']}" for i in insights):
            continue
        insights.append({
            "id": f"brief-rec-{rec['id']}",
            "source": rec["agent"],
            "text": f"{rec['title']}: {rec['detail']}",
            "href": f"/center/ai-access?client={rec['client_id']}" if rec.get("client_id") else "/center/ai-access",
            "href_label": "AI access" if rec.get("client_id") else "Platform AI",
        })

    attention = sum(1 for f in fleet if f["credits_status"] in ("warning", "exceeded")) + pending_regs
    if suspended:
        attention += 1
    if degraded:
        attention += 1

    stable_note = "Fleet is stable"
    if attention:
        stable_note = f"Fleet is stable with {attention} item{'s' if attention > 1 else ''} needing operator attention"

    now = datetime.utcnow()
    generated_at = f"Today · {now.strftime('%H:%M')} UTC"

    return {
        "generated_at": generated_at,
        "summary": (
            f"{stable_note}. Chief AI synthesized inputs from Health, License, Monitoring, and "
            "Recommendation agents — metadata only, no client business data."
        ),
        "insights": insights[:5],
        "credit_note": (
            f"Platform AI credit budget: {stats['credit_pct']}% consumed fleet-wide this month. "
            "Destructive actions require human approval — Chief AI recommends only."
        ),
    }


def seed_sample_ai_usage(db: Session) -> int:
    updated = 0
    fleet = compute_fleet_access(db)
    for i, row in enumerate(fleet):
        access = db.query(ClientAiAccess).filter(ClientAiAccess.client_id == row["client_id"]).first()
        if not access or not access.ai_enabled:
            continue
        if access.credits_used > 0:
            continue

        limit = row["credits_monthly"]
        if i % 3 == 0:
            access.credits_used = min(int(limit * 0.18), 2500)
        elif i % 3 == 1:
            access.credits_used = min(int(limit * 0.08), 800)
        else:
            access.credits_used = min(int(limit * 0.03), 300)

        access.agents_active = min(access.agents_limit, 2 + (i % 3))
        access.last_ai_request = datetime.utcnow() - timedelta(minutes=12 + i * 7)
        updated += 1

    if updated:
        db.commit()
    return updated

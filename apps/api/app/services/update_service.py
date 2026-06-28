import uuid
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.client import Client
from app.models.client_update_state import ClientUpdateState
from app.models.erp_version import ErpVersion
from app.models.server import Server
from app.models.update_rollout import UpdateRollout

STAGE_ORDER = ["canary", "early", "tier1", "tier2", "ga"]
STAGE_FRACTION = {
    "canary": 0.05,
    "early": 0.10,
    "tier1": 0.25,
    "tier2": 0.50,
    "ga": 1.0,
}

ERP_VERSION_SEEDS = [
    {
        "id": "ver_001",
        "version": "2026.6.1",
        "channel": "stable",
        "type": "patch",
        "released_at": datetime(2026, 6, 18),
        "agent_min_version": "1.2.0",
        "summary": "Inventory sync fixes, catalog PATCH validation, security hardening",
        "rollout_stage": "tier1",
        "is_latest": True,
    },
    {
        "id": "ver_002",
        "version": "2026.6.0",
        "channel": "stable",
        "type": "minor",
        "released_at": datetime(2026, 6, 1),
        "agent_min_version": "1.1.8",
        "summary": "Configurator v2, AI OS approval workflow, module dependency checks",
        "rollout_stage": "ga",
        "is_latest": False,
    },
    {
        "id": "ver_003",
        "version": "2026.5.2",
        "channel": "stable",
        "type": "patch",
        "released_at": datetime(2026, 5, 12),
        "agent_min_version": "1.1.8",
        "summary": "Order export fix, marketing coupon edge cases",
        "rollout_stage": "ga",
        "is_latest": False,
    },
    {
        "id": "ver_004",
        "version": "2026.7.0-beta",
        "channel": "beta",
        "type": "minor",
        "released_at": datetime(2026, 6, 22),
        "agent_min_version": "1.2.0",
        "summary": "Unified analytics dashboard, experimental AI tools API",
        "rollout_stage": "canary",
        "is_latest": False,
    },
    {
        "id": "ver_005",
        "version": "2026.6.1-hotfix",
        "channel": "hotfix",
        "type": "hotfix",
        "released_at": datetime(2026, 6, 25),
        "agent_min_version": "1.2.0",
        "summary": "Critical CVE patch for media upload handler",
        "rollout_stage": "early",
        "is_latest": False,
    },
]


def _format_relative(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    delta = datetime.utcnow() - dt
    hours = int(delta.total_seconds() // 3600)
    if hours < 1:
        return "just now"
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    return f"{days}d ago"


def sync_current_versions_from_servers(db: Session) -> None:
    clients = db.query(Client).all()
    for client in clients:
        state = db.query(ClientUpdateState).filter(ClientUpdateState.client_id == client.id).first()
        server = (
            db.query(Server)
            .filter(Server.client_id == client.id, Server.is_primary == True)
            .first()
        )
        erp_ver = server.erp_version if server and server.erp_version else None
        if not state:
            state = ClientUpdateState(
                id=f"cup_{uuid.uuid4().hex[:12]}",
                client_id=client.id,
                current_version=erp_ver or "2026.5.2",
                channel="stable",
                status="up_to_date",
                auto_update=True,
            )
            db.add(state)
        elif erp_ver:
            state.current_version = erp_ver
            if state.target_version and state.current_version == state.target_version:
                state.target_version = None
                state.status = "up_to_date"
                state.error_message = None
    db.commit()


def seed_erp_versions(db: Session) -> int:
    if db.query(ErpVersion).count() > 0:
        return 0
    for seed in ERP_VERSION_SEEDS:
        db.add(ErpVersion(**seed))
    db.commit()
    return len(ERP_VERSION_SEEDS)


def ensure_client_update_state(db: Session, client_id: str) -> ClientUpdateState:
    state = db.query(ClientUpdateState).filter(ClientUpdateState.client_id == client_id).first()
    if state:
        return state
    state = ClientUpdateState(
        id=f"cup_{uuid.uuid4().hex[:12]}",
        client_id=client_id,
        current_version="2026.5.2",
        channel="stable",
        status="up_to_date",
        auto_update=True,
    )
    db.add(state)
    db.commit()
    db.refresh(state)
    return state


def ensure_client_update_states(db: Session) -> int:
    sync_current_versions_from_servers(db)
    return db.query(ClientUpdateState).count()


def seed_sample_rollout(db: Session) -> int:
    if db.query(UpdateRollout).count() > 0:
        return 0

    latest = db.query(ErpVersion).filter(ErpVersion.is_latest == True).first()
    hotfix = db.query(ErpVersion).filter(ErpVersion.version == "2026.6.1-hotfix").first()
    if not latest:
        return 0

    now = datetime.utcnow()
    roll1 = UpdateRollout(
        id="roll_001",
        name="2026.6.1 stable patch",
        erp_version_id=latest.id,
        target_version=latest.version,
        channel=latest.channel,
        type=latest.type,
        stage="tier1",
        status="active",
        started_at=now - timedelta(days=8),
        soak_until=now + timedelta(days=2),
    )
    db.add(roll1)

    roll2 = None
    if hotfix:
        roll2 = UpdateRollout(
            id="roll_002",
            name="2026.6.1-hotfix security",
            erp_version_id=hotfix.id,
            target_version=hotfix.version,
            channel=hotfix.channel,
            type=hotfix.type,
            stage="early",
            status="active",
            started_at=now - timedelta(days=3),
            soak_until=now + timedelta(days=1),
        )
        db.add(roll2)

    db.commit()

    clients = db.query(Client).order_by(Client.created_at).all()
    states = {s.client_id: s for s in db.query(ClientUpdateState).all()}

    for i, client in enumerate(clients):
        state = states.get(client.id)
        if not state:
            continue

        state.rollout_id = roll1.id
        state.channel = latest.channel

        if state.current_version == latest.version:
            state.status = "up_to_date"
            state.target_version = None
        elif i == 2:
            state.target_version = latest.version
            state.status = "scheduled"
            state.scheduled_at = now + timedelta(days=1)
        elif i == 3:
            state.target_version = latest.version
            state.status = "failed"
            state.error_message = "Agent offline — pre-flight backup check failed"
            state.last_attempt_at = now - timedelta(days=2)
        else:
            state.target_version = latest.version
            state.status = "available" if not state.auto_update else "scheduled"

        if roll2 and i >= 3 and state.current_version in (latest.version, "2026.6.1"):
            state.rollout_id = roll2.id
            state.channel = "hotfix"
            state.target_version = hotfix.version
            state.status = "available"

    db.commit()
    _recount_rollout(db, roll1)
    if roll2:
        _recount_rollout(db, roll2)
    return 2 if roll2 else 1


def _recount_rollout(db: Session, rollout: UpdateRollout) -> None:
    states = db.query(ClientUpdateState).filter(ClientUpdateState.rollout_id == rollout.id).all()
    rollout.clients_total = len(states)
    rollout.clients_complete = sum(1 for s in states if s.status == "up_to_date" and not s.target_version)
    rollout.clients_failed = sum(1 for s in states if s.status in ("failed", "rolling_back"))
    rollout.clients_pending = sum(
        1 for s in states if s.status in ("available", "scheduled", "applying", "validating")
    )
    db.commit()


def _clients_for_stage(db: Session, stage: str) -> list[Client]:
    clients = db.query(Client).filter(Client.is_active == True).order_by(Client.created_at).all()
    fraction = STAGE_FRACTION.get(stage, 1.0)
    count = max(1, int(len(clients) * fraction)) if clients else 0
    return clients[:count]


def create_rollout(
    db: Session,
    *,
    name: str,
    erp_version_id: str,
    stage: str = "canary",
) -> UpdateRollout:
    version = db.query(ErpVersion).filter(ErpVersion.id == erp_version_id).first()
    if not version:
        raise ValueError("ERP version not found")

    now = datetime.utcnow()
    rollout = UpdateRollout(
        id=f"roll_{uuid.uuid4().hex[:12]}",
        name=name,
        erp_version_id=version.id,
        target_version=version.version,
        channel=version.channel,
        type=version.type,
        stage=stage if stage in STAGE_ORDER else "canary",
        status="active",
        started_at=now,
        soak_until=now + timedelta(days=7),
    )
    db.add(rollout)
    db.commit()
    db.refresh(rollout)

    _assign_rollout_clients(db, rollout, stage)
    _recount_rollout(db, rollout)
    return rollout


def _assign_rollout_clients(db: Session, rollout: UpdateRollout, stage: str) -> None:
    target_clients = _clients_for_stage(db, stage)
    target_ids = {c.id for c in target_clients}

    for client in target_clients:
        state = db.query(ClientUpdateState).filter(ClientUpdateState.client_id == client.id).first()
        if not state:
            state = ClientUpdateState(
                id=f"cup_{uuid.uuid4().hex[:12]}",
                client_id=client.id,
                current_version="2026.5.2",
            )
            db.add(state)
            db.flush()

        if state.current_version == rollout.target_version:
            continue

        state.rollout_id = rollout.id
        state.target_version = rollout.target_version
        state.channel = rollout.channel
        state.status = "scheduled" if state.auto_update else "available"

    db.commit()


def advance_rollout_stage(db: Session, rollout_id: str) -> UpdateRollout:
    rollout = db.query(UpdateRollout).filter(UpdateRollout.id == rollout_id).first()
    if not rollout:
        raise ValueError("Rollout not found")
    if rollout.status != "active":
        raise ValueError("Rollout is not active")

    idx = STAGE_ORDER.index(rollout.stage) if rollout.stage in STAGE_ORDER else 0
    if idx >= len(STAGE_ORDER) - 1:
        rollout.status = "completed"
        rollout.stage = "ga"
    else:
        rollout.stage = STAGE_ORDER[idx + 1]
        _assign_rollout_clients(db, rollout, rollout.stage)

    _recount_rollout(db, rollout)
    db.refresh(rollout)
    return rollout


def pause_rollout(db: Session, rollout_id: str) -> UpdateRollout:
    rollout = db.query(UpdateRollout).filter(UpdateRollout.id == rollout_id).first()
    if not rollout:
        raise ValueError("Rollout not found")
    rollout.status = "paused"
    db.commit()
    db.refresh(rollout)
    return rollout


def resume_rollout(db: Session, rollout_id: str) -> UpdateRollout:
    rollout = db.query(UpdateRollout).filter(UpdateRollout.id == rollout_id).first()
    if not rollout:
        raise ValueError("Rollout not found")
    rollout.status = "active"
    db.commit()
    db.refresh(rollout)
    return rollout


def push_client_update(db: Session, client_id: str) -> ClientUpdateState:
    state = db.query(ClientUpdateState).filter(ClientUpdateState.client_id == client_id).first()
    if not state:
        raise ValueError("Client update state not found")
    if not state.target_version:
        raise ValueError("No target version assigned")

    state.status = "applying"
    state.last_attempt_at = datetime.utcnow()
    state.error_message = None
    db.commit()
    db.refresh(state)
    return state


def schedule_client_update(db: Session, client_id: str, scheduled_at: datetime) -> ClientUpdateState:
    state = db.query(ClientUpdateState).filter(ClientUpdateState.client_id == client_id).first()
    if not state:
        raise ValueError("Client update state not found")
    if not state.target_version:
        raise ValueError("No target version assigned")

    state.status = "scheduled"
    state.scheduled_at = scheduled_at
    db.commit()
    db.refresh(state)
    return state


def rollback_client_update(db: Session, client_id: str) -> ClientUpdateState:
    state = db.query(ClientUpdateState).filter(ClientUpdateState.client_id == client_id).first()
    if not state:
        raise ValueError("Client update state not found")

    state.status = "rolling_back"
    state.last_attempt_at = datetime.utcnow()
    state.target_version = None
    state.error_message = None
    db.commit()
    state.status = "up_to_date"
    db.commit()
    db.refresh(state)
    return state


def compute_update_stats(db: Session) -> dict:
    sync_current_versions_from_servers(db)
    states = db.query(ClientUpdateState).all()
    rollouts = db.query(UpdateRollout).filter(UpdateRollout.status == "active").all()
    latest = db.query(ErpVersion).filter(ErpVersion.is_latest == True).first()

    up_to_date = sum(1 for s in states if s.status == "up_to_date")
    pending = sum(
        1 for s in states if s.status in ("available", "scheduled", "applying", "validating")
    )
    failed = sum(1 for s in states if s.status in ("failed", "rolling_back"))

    return {
        "up_to_date": up_to_date,
        "pending": pending,
        "failed": failed,
        "active_rollouts": len(rollouts),
        "latest": latest.version if latest else "—",
    }


def version_to_dict(v: ErpVersion) -> dict:
    return {
        "id": v.id,
        "version": v.version,
        "channel": v.channel,
        "type": v.type,
        "released_at": v.released_at.isoformat() if v.released_at else None,
        "agent_min_version": v.agent_min_version,
        "summary": v.summary,
        "rollout_stage": v.rollout_stage,
        "is_latest": v.is_latest,
    }


def rollout_to_dict(r: UpdateRollout) -> dict:
    return {
        "id": r.id,
        "name": r.name,
        "target_version": r.target_version,
        "channel": r.channel,
        "type": r.type,
        "stage": r.stage,
        "status": r.status,
        "started_at": r.started_at.isoformat() if r.started_at else None,
        "soak_until": r.soak_until.isoformat() if r.soak_until else None,
        "clients_total": r.clients_total,
        "clients_complete": r.clients_complete,
        "clients_failed": r.clients_failed,
        "clients_pending": r.clients_pending,
    }


def client_update_to_dict(state: ClientUpdateState, business_name: Optional[str] = None) -> dict:
    scheduled_label = None
    if state.scheduled_at:
        scheduled_label = state.scheduled_at.strftime("%a %H:%M UTC")

    return {
        "id": state.id,
        "client_id": state.client_id,
        "business_name": business_name,
        "current_version": state.current_version,
        "target_version": state.target_version,
        "channel": state.channel,
        "status": state.status,
        "auto_update": state.auto_update,
        "scheduled_at": state.scheduled_at.isoformat() if state.scheduled_at else None,
        "scheduled_label": scheduled_label,
        "last_attempt": _format_relative(state.last_attempt_at),
        "error_message": state.error_message,
        "rollout_id": state.rollout_id,
    }


def enrich_client_updates(db: Session, states: list[ClientUpdateState]) -> list[dict]:
    client_ids = {s.client_id for s in states}
    clients = db.query(Client).filter(Client.id.in_(client_ids)).all() if client_ids else []
    name_map = {c.id: c.name for c in clients}
    return [client_update_to_dict(s, name_map.get(s.client_id)) for s in states]

import hashlib
import uuid
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.models.backup_policy import BackupPolicy
from app.models.backup_record import BackupRecord
from app.models.client import Client

PLAN_DEFAULTS = {
    "starter": {"retention_days": 7, "storage": "local", "max_age_hours": 26},
    "business": {"retention_days": 30, "storage": "local", "max_age_hours": 26},
    "professional": {"retention_days": 60, "storage": "client_s3", "max_age_hours": 26},
    "enterprise": {"retention_days": 90, "storage": "client_s3", "max_age_hours": 26},
    "custom": {"retention_days": 365, "storage": "client_s3", "max_age_hours": 26},
}


def _mask_checksum(checksum: Optional[str]) -> str:
    if not checksum:
        return "—"
    if len(checksum) <= 16:
        return checksum
    return f"{checksum[:12]}…{checksum[-4:]}"


def _format_relative(dt: Optional[datetime]) -> str:
    if not dt:
        return "—"
    delta = datetime.utcnow() - dt
    hours = int(delta.total_seconds() // 3600)
    if hours < 1:
        return "just now"
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    if days == 1:
        return "Yesterday"
    return f"{days}d ago"


def _format_short(dt: Optional[datetime]) -> str:
    if not dt:
        return "—"
    now = datetime.utcnow()
    if dt.date() == now.date():
        return f"Today {dt.strftime('%H:%M')}"
    if dt.date() == (now - timedelta(days=1)).date():
        return f"Yesterday {dt.strftime('%H:%M')}"
    return dt.strftime("%d %b %Y %H:%M")


def _hours_since(dt: Optional[datetime]) -> int:
    if not dt:
        return 9999
    return int((datetime.utcnow() - dt).total_seconds() // 3600)


def ensure_backup_policy(db: Session, client_id: str, plan: str = "starter") -> BackupPolicy:
    existing = db.query(BackupPolicy).filter(BackupPolicy.client_id == client_id).first()
    if existing:
        return existing

    defaults = PLAN_DEFAULTS.get(plan.lower(), PLAN_DEFAULTS["starter"])
    schedule = "Daily 02:00 + hourly WAL" if plan.lower() in ("enterprise", "custom") else "Daily 02:00 Asia/Dhaka"
    policy = BackupPolicy(
        client_id=client_id,
        schedule_label=schedule,
        retention_days=defaults["retention_days"],
        storage_target=defaults["storage"],
        verification_enabled=True,
        policy_max_age_hours=defaults["max_age_hours"],
        timezone="Asia/Dhaka" if plan.lower() != "starter" else "UTC",
    )
    db.add(policy)
    db.commit()
    db.refresh(policy)
    return policy


def _latest_record(db: Session, client_id: str) -> Optional[BackupRecord]:
    return (
        db.query(BackupRecord)
        .filter(BackupRecord.client_id == client_id)
        .order_by(BackupRecord.started_at.desc().nullslast(), BackupRecord.created_at.desc())
        .first()
    )


def _derive_status(policy: BackupPolicy, latest: Optional[BackupRecord]) -> str:
    if latest and latest.status == "running":
        return "running"
    if latest and latest.status == "failed":
        return "failed"
    if not latest or not latest.completed_at:
        return "overdue"
    hours = _hours_since(latest.completed_at)
    if hours > policy.policy_max_age_hours:
        return "overdue"
    if latest.status == "verified":
        return "verified"
    if latest.status == "completed":
        return "completed"
    return latest.status


def fleet_status_for_client(db: Session, client: Client, policy: BackupPolicy) -> dict:
    latest = _latest_record(db, client.id)
    status = _derive_status(policy, latest)
    completed = latest.completed_at if latest else None
    hours = _hours_since(completed)
    size_mb = round((latest.size_bytes / (1024 * 1024)), 1) if latest and latest.size_bytes else 0

    next_scheduled = "Tomorrow 02:00"
    if status == "overdue":
        next_scheduled = "Overdue"
    elif status == "failed":
        next_scheduled = "Retry pending"

    return {
        "client_id": client.id,
        "business_name": client.name,
        "plan": client.plan,
        "last_backup_at": _format_relative(completed) if completed else "—",
        "last_backup_type": latest.backup_type if latest else "full",
        "status": status,
        "size_mb": size_mb,
        "retention_days": policy.retention_days,
        "schedule_label": policy.schedule_label,
        "storage_target": policy.storage_target,
        "verification_enabled": policy.verification_enabled,
        "next_scheduled": next_scheduled,
        "hours_since_backup": hours if completed else 9999,
        "policy_max_age_hours": policy.policy_max_age_hours,
        "checksum_masked": _mask_checksum(latest.checksum if latest else None),
        "error_message": latest.error_message if latest and latest.status == "failed" else None,
    }


def compute_fleet_statuses(db: Session) -> list[dict]:
    clients = db.query(Client).order_by(Client.created_at).all()
    results = []
    for client in clients:
        policy = db.query(BackupPolicy).filter(BackupPolicy.client_id == client.id).first()
        if not policy:
            policy = ensure_backup_policy(db, client.id, client.plan)
        results.append(fleet_status_for_client(db, client, policy))
    return results


def compute_backup_stats(db: Session) -> dict:
    statuses = compute_fleet_statuses(db)
    verified = sum(1 for s in statuses if s["status"] == "verified")
    overdue = sum(1 for s in statuses if s["status"] in ("overdue", "failed"))
    pending_verify = sum(1 for s in statuses if s["status"] == "completed")
    total_mb = sum(s["size_mb"] for s in statuses)
    return {
        "verified": verified,
        "overdue": overdue,
        "pending_verify": pending_verify,
        "total_metadata_mb": total_mb,
        "fleet": len(statuses),
    }


def record_to_dict(rec: BackupRecord, business_name: Optional[str] = None) -> dict:
    size_mb = round(rec.size_bytes / (1024 * 1024), 1) if rec.size_bytes else 0
    return {
        "id": rec.id,
        "client_id": rec.client_id,
        "business_name": business_name,
        "type": rec.backup_type,
        "status": rec.status,
        "started_at": rec.started_at.isoformat() if rec.started_at else None,
        "started_label": _format_short(rec.started_at),
        "completed_at": rec.completed_at.isoformat() if rec.completed_at else None,
        "completed_label": _format_short(rec.completed_at) if rec.completed_at else None,
        "size_mb": size_mb,
        "size_bytes": rec.size_bytes,
        "checksum_masked": _mask_checksum(rec.checksum),
        "storage_target": rec.storage_target,
        "verified_at": rec.verified_at.isoformat() if rec.verified_at else None,
        "error_message": rec.error_message,
        "duration_seconds": rec.duration_seconds,
    }


def list_backup_runs(db: Session, *, client_id: Optional[str] = None, limit: int = 50) -> list[dict]:
    q = db.query(BackupRecord).order_by(BackupRecord.created_at.desc())
    if client_id:
        q = q.filter(BackupRecord.client_id == client_id)
    records = q.limit(limit).all()
    client_ids = {r.client_id for r in records}
    clients = db.query(Client).filter(Client.id.in_(client_ids)).all() if client_ids else []
    names = {c.id: c.name for c in clients}
    return [record_to_dict(r, names.get(r.client_id)) for r in records]


def trigger_backup(
    db: Session,
    client_id: str,
    backup_type: str = "full",
) -> BackupRecord:
    policy = db.query(BackupPolicy).filter(BackupPolicy.client_id == client_id).first()
    if not policy:
        client = db.query(Client).filter(Client.id == client_id).first()
        if not client:
            raise ValueError("Client not found")
        policy = ensure_backup_policy(db, client_id, client.plan)

    running = db.query(BackupRecord).filter(
        BackupRecord.client_id == client_id,
        BackupRecord.status == "running",
    ).first()
    if running:
        raise ValueError("Backup already running for this client")

    now = datetime.utcnow()
    rec = BackupRecord(
        id=f"bk_{uuid.uuid4().hex[:12]}",
        client_id=client_id,
        backup_type=backup_type if backup_type in ("full", "incremental", "media", "config", "pre_update") else "full",
        status="running",
        storage_target=policy.storage_target,
        started_at=now,
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)

    try:
        from app.services.agent_console_service import enqueue_command
        enqueue_command(
            db,
            client_id,
            "backup.run",
            f"scheduled {rec.backup_type} · encrypt · verify checksum",
            "Backup Service",
            correlation_id=f"corr-bak-{rec.id}",
        )
    except ValueError:
        pass

    return rec


def complete_backup_simulation(db: Session, record_id: str) -> BackupRecord:
    """Mark a running backup complete (simulates agent report for dev)."""
    rec = db.query(BackupRecord).filter(BackupRecord.id == record_id).first()
    if not rec:
        raise ValueError("Backup record not found")
    if rec.status != "running":
        raise ValueError("Backup is not running")

    now = datetime.utcnow()
    rec.status = "completed"
    rec.completed_at = now
    rec.duration_seconds = int((now - (rec.started_at or now)).total_seconds()) or 60
    rec.size_bytes = 512 * 1024 * 1024  # 512 MB placeholder
    rec.checksum = hashlib.sha256(f"{rec.id}-{now.isoformat()}".encode()).hexdigest()
    db.commit()
    db.refresh(rec)
    return rec


def verify_backup(db: Session, record_id: str) -> BackupRecord:
    rec = db.query(BackupRecord).filter(BackupRecord.id == record_id).first()
    if not rec:
        raise ValueError("Backup record not found")
    if rec.status not in ("completed", "verified"):
        raise ValueError("Only completed backups can be verified")

    rec.status = "verified"
    rec.verified_at = datetime.utcnow()
    db.commit()
    db.refresh(rec)
    return rec


def seed_sample_backups(db: Session) -> int:
    if db.query(BackupRecord).count() > 0:
        return 0

    clients = db.query(Client).order_by(Client.created_at).all()
    created = 0
    now = datetime.utcnow()

    templates = [
        ("verified", 6, 2840, None),
        ("verified", 30, 6120, None),
        ("overdue", 78, 890, "Last scheduled run missed — agent reported low disk space"),
        ("failed", 120, 0, "Agent offline — backup job could not start"),
        ("completed", 7, 124, None),
    ]

    for i, client in enumerate(clients):
        policy = ensure_backup_policy(db, client.id, client.plan)
        tpl = templates[i % len(templates)]
        status_key, hours_ago, size_mb, error = tpl

        started = now - timedelta(hours=hours_ago + 1)
        completed = now - timedelta(hours=hours_ago)
        checksum = hashlib.sha256(f"seed-{client.id}".encode()).hexdigest()

        if status_key == "failed":
            rec = BackupRecord(
                id=f"bk_seed_{client.id[-6:]}",
                client_id=client.id,
                backup_type="full",
                status="failed",
                storage_target=policy.storage_target,
                started_at=started,
                error_message=error,
            )
        else:
            rec_status = "verified" if status_key == "verified" else "completed"
            rec = BackupRecord(
                id=f"bk_seed_{client.id[-6:]}",
                client_id=client.id,
                backup_type="incremental" if i == 4 else "full",
                status=rec_status,
                size_bytes=int(size_mb * 1024 * 1024),
                duration_seconds=840,
                checksum=checksum,
                storage_target=policy.storage_target,
                started_at=started,
                completed_at=completed,
                verified_at=completed + timedelta(minutes=4) if rec_status == "verified" else None,
                error_message=error,
            )
        db.add(rec)
        created += 1

    db.commit()
    return created

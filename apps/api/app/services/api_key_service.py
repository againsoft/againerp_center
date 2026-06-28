import json
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.deps.auth import hash_password
from app.models.api_key import ApiKey

VALID_SCOPES = {
    "audit.read",
    "clients.read",
    "clients.write",
    "billing.read",
    "registrations.read",
    "modules.read",
    "backups.read",
}

SCOPE_PRESETS = {
    "integration": ["audit.read", "clients.read"],
    "partner": ["clients.read", "registrations.read"],
    "operator": ["clients.read", "clients.write", "audit.read"],
}


def _status(row: ApiKey) -> str:
    if row.revoked_at:
        return "revoked"
    if row.expires_at and row.expires_at < datetime.utcnow():
        return "expired"
    return "active"


def _format_date(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d %H:%M")


def _format_short(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    now = datetime.utcnow()
    delta = now - dt
    hours = int(delta.total_seconds() // 3600)
    if hours < 1:
        return "just now"
    if hours < 24:
        return f"{hours}h ago"
    days = hours // 24
    if days == 1:
        return "Yesterday"
    return dt.strftime("%Y-%m-%d")


def key_to_dict(row: ApiKey) -> dict:
    scopes = json.loads(row.scopes or "[]")
    return {
        "id": row.id,
        "name": row.name,
        "key_prefix": row.key_prefix,
        "owner_type": row.owner_type,
        "owner_id": row.owner_id,
        "owner_label": row.owner_label,
        "scopes": scopes,
        "status": _status(row),
        "created_at": _format_date(row.created_at),
        "last_used_at": _format_short(row.last_used_at),
        "expires_at": row.expires_at.strftime("%Y-%m-%d") if row.expires_at else None,
    }


def list_api_keys(db: Session) -> list[dict]:
    rows = db.query(ApiKey).order_by(ApiKey.created_at.desc()).all()
    return [key_to_dict(r) for r in rows]


def create_api_key(
    db: Session,
    *,
    name: str,
    owner_type: str,
    owner_label: str,
    owner_id: Optional[str] = None,
    scopes: Optional[list[str]] = None,
    expires_days: Optional[int] = None,
) -> tuple[dict, str]:
    if owner_type not in ("operator", "partner", "integration"):
        raise ValueError("Invalid owner_type")

    scope_list = scopes or SCOPE_PRESETS.get(owner_type, ["clients.read"])
    invalid = [s for s in scope_list if s not in VALID_SCOPES]
    if invalid:
        raise ValueError(f"Invalid scopes: {', '.join(invalid)}")

    raw_suffix = secrets.token_hex(16)
    raw_key = f"cc_live_{raw_suffix}"
    prefix = raw_key[:12]

    expires_at = None
    if expires_days:
        expires_at = datetime.utcnow() + timedelta(days=expires_days)

    row = ApiKey(
        id=f"key_{uuid.uuid4().hex[:12]}",
        name=name.strip(),
        key_prefix=prefix,
        key_hash=hash_password(raw_key),
        owner_type=owner_type,
        owner_id=owner_id,
        owner_label=owner_label.strip(),
        scopes=json.dumps(scope_list),
        expires_at=expires_at,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    out = key_to_dict(row)
    return out, raw_key


def revoke_api_key(db: Session, key_id: str) -> dict:
    row = db.query(ApiKey).filter(ApiKey.id == key_id).first()
    if not row:
        raise ValueError("API key not found")
    if row.revoked_at:
        return key_to_dict(row)

    row.revoked_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return key_to_dict(row)


def seed_sample_api_keys(db: Session) -> int:
    if db.query(ApiKey).count() > 0:
        return 0

    samples = [
        {
            "name": "SIEM export",
            "owner_type": "integration",
            "owner_label": "Security integration",
            "scopes": ["audit.read", "clients.read"],
            "expires_days": 365,
            "last_used_hours": 4,
        },
        {
            "name": "Billing webhook verifier",
            "owner_type": "integration",
            "owner_label": "Stripe bridge",
            "scopes": ["billing.read"],
            "expires_days": None,
            "last_used_hours": 26,
        },
        {
            "name": "Legacy fleet script",
            "owner_type": "operator",
            "owner_label": "Super Admin",
            "scopes": ["clients.read", "clients.write"],
            "expires_days": None,
            "last_used_hours": 2400,
            "revoked": True,
        },
    ]

    count = 0
    for sample in samples:
        _, _ = create_api_key(
            db,
            name=sample["name"],
            owner_type=sample["owner_type"],
            owner_label=sample["owner_label"],
            scopes=sample["scopes"],
            expires_days=sample.get("expires_days"),
        )
        row = db.query(ApiKey).order_by(ApiKey.created_at.desc()).first()
        if row and sample.get("last_used_hours") is not None:
            row.last_used_at = datetime.utcnow() - timedelta(hours=sample["last_used_hours"])
        if row and sample.get("revoked"):
            row.revoked_at = datetime.utcnow() - timedelta(days=90)
        count += 1

    db.commit()
    return count

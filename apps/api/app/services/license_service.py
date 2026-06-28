import hashlib
import secrets
import uuid
from datetime import datetime, timedelta
from typing import Optional

from jose import jwt
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.agent_token import AgentToken
from app.models.license import License
from app.models.subscription import Subscription

settings = get_settings()

PLAN_DEFAULTS = {
    "starter": {"seats": 5, "ai_credits": 1000},
    "business": {"seats": 25, "ai_credits": 10000},
    "professional": {"seats": 100, "ai_credits": 50000},
    "enterprise": {"seats": 9999, "ai_credits": 999999},
}

GRACE_DAYS = 7


def generate_license_key() -> str:
    parts = [secrets.token_hex(2).upper() for _ in range(4)]
    return f"AGP-{'-'.join(parts)}"


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def create_subscription(
    db: Session,
    *,
    client_id: str,
    plan: str = "starter",
    billing_cycle: str = "monthly",
) -> Subscription:
    defaults = PLAN_DEFAULTS.get(plan, PLAN_DEFAULTS["starter"])
    now = datetime.utcnow()
    period_end = now + timedelta(days=365 if billing_cycle == "annual" else 30)

    sub = Subscription(
        id=f"sub_{uuid.uuid4().hex[:12]}",
        client_id=client_id,
        plan=plan,
        status="active",
        billing_cycle=billing_cycle,
        seats_purchased=defaults["seats"],
        ai_credits_monthly=defaults["ai_credits"],
        current_period_start=now,
        current_period_end=period_end,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def create_license(
    db: Session,
    *,
    client_id: str,
    plan: str = "starter",
    subscription_id: Optional[str] = None,
    expires_days: int = 365,
) -> License:
    now = datetime.utcnow()
    expires_at = now + timedelta(days=expires_days)
    grace_ends_at = expires_at + timedelta(days=GRACE_DAYS)

    payload = {
        "client_id": client_id,
        "plan": plan,
        "exp": expires_at.isoformat(),
    }
    signature = jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

    lic = License(
        id=f"lic_{uuid.uuid4().hex[:12]}",
        client_id=client_id,
        subscription_id=subscription_id,
        license_key=generate_license_key(),
        status="active",
        plan=plan,
        issued_at=now,
        expires_at=expires_at,
        grace_ends_at=grace_ends_at,
        signature=signature,
    )
    db.add(lic)
    db.commit()
    db.refresh(lic)
    return lic


def create_agent_token(
    db: Session,
    *,
    client_id: str,
    label: Optional[str] = None,
) -> tuple[AgentToken, str]:
    raw_token = secrets.token_urlsafe(32)
    token = AgentToken(
        id=f"atok_{uuid.uuid4().hex[:12]}",
        client_id=client_id,
        token_hash=_hash_token(raw_token),
        label=label or "default",
        is_active=True,
    )
    db.add(token)
    db.commit()
    db.refresh(token)
    return token, raw_token


def verify_agent_token(db: Session, raw_token: str) -> Optional[AgentToken]:
    token_hash = _hash_token(raw_token)
    token = db.query(AgentToken).filter(
        AgentToken.token_hash == token_hash,
        AgentToken.is_active == True,
    ).first()
    if token:
        token.last_used_at = datetime.utcnow()
        db.commit()
    return token


def validate_license(db: Session, license_key: str) -> dict:
    lic = db.query(License).filter(License.license_key == license_key).first()
    if not lic:
        return {"valid": False, "reason": "not_found"}

    now = datetime.utcnow()
    if lic.status == "revoked":
        return {"valid": False, "reason": "revoked"}

    if lic.expires_at and now > lic.expires_at:
        if lic.grace_ends_at and now <= lic.grace_ends_at:
            return {"valid": True, "status": "grace", "license_id": lic.id, "plan": lic.plan}
        return {"valid": False, "reason": "expired"}

    return {"valid": True, "status": "active", "license_id": lic.id, "plan": lic.plan}

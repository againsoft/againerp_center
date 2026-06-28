from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.operator import Operator
from app.models.subscription import Subscription
from app.services.audit_service import log_audit
from app.services.license_service import create_subscription

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


class SubscriptionCreate(BaseModel):
    client_id: str
    plan: str = "starter"
    billing_cycle: str = "monthly"


def _sub_out(s: Subscription) -> dict:
    return {
        "id": s.id,
        "client_id": s.client_id,
        "plan": s.plan,
        "status": s.status,
        "billing_cycle": s.billing_cycle,
        "seats_purchased": s.seats_purchased,
        "ai_credits_monthly": s.ai_credits_monthly,
        "current_period_start": s.current_period_start.isoformat() if s.current_period_start else None,
        "current_period_end": s.current_period_end.isoformat() if s.current_period_end else None,
        "trial_ends_at": s.trial_ends_at.isoformat() if s.trial_ends_at else None,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


@router.get("")
def list_subscriptions(
    client_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    q = db.query(Subscription).order_by(Subscription.created_at.desc())
    if client_id:
        q = q.filter(Subscription.client_id == client_id)
    return [_sub_out(s) for s in q.all()]


@router.post("", status_code=201)
def create_subscription_route(
    body: SubscriptionCreate,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    sub = create_subscription(
        db,
        client_id=body.client_id,
        plan=body.plan,
        billing_cycle=body.billing_cycle,
    )
    log_audit(
        db,
        action="subscription.create",
        operator=op,
        resource="subscription",
        resource_id=sub.id,
        detail=f"plan={body.plan}",
    )
    return _sub_out(sub)


@router.get("/{subscription_id}")
def get_subscription(
    subscription_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    s = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return _sub_out(s)

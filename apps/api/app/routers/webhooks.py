import hashlib
import hmac
import json
import time
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.services.audit_service import log_audit
from app.services.billing_service import (
    create_invoice_for_subscription,
    find_invoice_by_external_ref,
    mark_invoice_paid,
    mark_invoice_past_due,
)

router = APIRouter(prefix="/webhooks/v1", tags=["webhooks"])
settings = get_settings()


def _verify_stripe_signature(payload: bytes, sig_header: Optional[str], secret: str) -> bool:
    if not sig_header or not secret:
        return False
    parts = {}
    for item in sig_header.split(","):
        k, _, v = item.partition("=")
        parts[k.strip()] = v.strip()
    timestamp = parts.get("t")
    signature = parts.get("v1")
    if not timestamp or not signature:
        return False
    if abs(time.time() - int(timestamp)) > 300:
        return False
    signed = f"{timestamp}.{payload.decode('utf-8')}".encode()
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)) -> dict:
    body = await request.body()
    secret = getattr(settings, "stripe_webhook_secret", "") or ""

    if secret:
        sig = request.headers.get("stripe-signature")
        if not _verify_stripe_signature(body, sig, secret):
            raise HTTPException(status_code=400, detail="Invalid Stripe signature")
    elif settings.app_env == "production":
        raise HTTPException(status_code=400, detail="Stripe webhook secret required in production")

    try:
        event = json.loads(body)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail="Invalid JSON") from e

    event_type = event.get("type", "")
    obj = event.get("data", {}).get("object", {})
    handled = False

    if event_type == "invoice.paid":
        handled = _handle_invoice_paid(db, obj)
    elif event_type == "invoice.payment_failed":
        handled = _handle_payment_failed(db, obj)
    elif event_type == "invoice.finalized":
        handled = _handle_invoice_finalized(db, obj)
    elif event_type == "checkout.session.completed":
        handled = _handle_checkout_completed(db, obj)

    return {"received": True, "type": event_type, "handled": handled}


def _handle_invoice_paid(db: Session, obj: dict) -> bool:
    external_ref = obj.get("id")
    metadata = obj.get("metadata") or {}
    center_id = metadata.get("center_invoice_id")

    inv = None
    if center_id:
        from app.models.billing_invoice import BillingInvoice
        inv = db.query(BillingInvoice).filter(BillingInvoice.id == center_id).first()
    if not inv and external_ref:
        inv = find_invoice_by_external_ref(db, external_ref)
    if not inv:
        return False

    paid_ts = obj.get("status_transitions", {}).get("paid_at")
    paid_at = datetime.utcfromtimestamp(paid_ts) if paid_ts else None
    mark_invoice_paid(db, inv, external_ref=external_ref, paid_at=paid_at)
    log_audit(
        db,
        action="invoice.payment.webhook",
        resource="billing",
        resource_id=inv.id,
        detail=f"stripe={external_ref}",
    )
    return True


def _handle_payment_failed(db: Session, obj: dict) -> bool:
    external_ref = obj.get("id")
    metadata = obj.get("metadata") or {}
    center_id = metadata.get("center_invoice_id")

    from app.models.billing_invoice import BillingInvoice
    inv = None
    if center_id:
        inv = db.query(BillingInvoice).filter(BillingInvoice.id == center_id).first()
    if not inv and external_ref:
        inv = find_invoice_by_external_ref(db, external_ref)
    if not inv:
        return False

    mark_invoice_past_due(db, inv)
    log_audit(
        db,
        action="invoice.payment_failed.webhook",
        resource="billing",
        resource_id=inv.id,
        detail=f"stripe={external_ref}",
    )
    return True


def _handle_invoice_finalized(db: Session, obj: dict) -> bool:
    metadata = obj.get("metadata") or {}
    sub_id = metadata.get("center_subscription_id")
    if not sub_id:
        return False

    external_ref = obj.get("id")
    existing = find_invoice_by_external_ref(db, external_ref) if external_ref else None
    if existing:
        return True

    inv = create_invoice_for_subscription(db, subscription_id=sub_id, status="open", external_ref=external_ref)
    log_audit(
        db,
        action="invoice.finalized.webhook",
        resource="billing",
        resource_id=inv.id,
        detail=f"stripe={external_ref}",
    )
    return True


def _handle_checkout_completed(db: Session, obj: dict) -> bool:
    metadata = obj.get("metadata") or {}
    center_id = metadata.get("center_invoice_id")
    if not center_id:
        return False

    from app.models.billing_invoice import BillingInvoice
    inv = db.query(BillingInvoice).filter(BillingInvoice.id == center_id).first()
    if not inv:
        return False

    session_id = obj.get("id")
    mark_invoice_paid(db, inv, external_ref=session_id)
    log_audit(
        db,
        action="invoice.checkout.webhook",
        resource="billing",
        resource_id=inv.id,
        detail=f"session={session_id}",
    )
    return True

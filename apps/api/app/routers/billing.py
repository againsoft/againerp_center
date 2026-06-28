from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.billing_invoice import BillingInvoice
from app.models.client import Client
from app.models.operator import Operator
from app.models.subscription import Subscription
from app.services.audit_service import log_audit
from app.services.billing_service import (
    compute_billing_stats,
    create_invoice_for_subscription,
    enrich_invoices,
    invoice_to_dict,
    mark_invoice_paid,
    mark_invoice_past_due,
    seed_sample_invoices,
    subscription_mrr,
)

router = APIRouter(prefix="/billing", tags=["billing"])


class InvoiceCreate(BaseModel):
    subscription_id: str
    status: str = "open"
    external_ref: Optional[str] = None


class RecordPaymentBody(BaseModel):
    external_ref: Optional[str] = None


@router.get("/stats")
def billing_stats(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    return compute_billing_stats(db)


@router.get("/mrr")
def fleet_mrr(
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    subs = db.query(Subscription).order_by(Subscription.created_at.desc()).all()
    client_ids = {s.client_id for s in subs}
    clients = db.query(Client).filter(Client.id.in_(client_ids)).all() if client_ids else []
    name_map = {c.id: c.name for c in clients}

    return [
        {
            "subscription_id": s.id,
            "client_id": s.client_id,
            "business_name": name_map.get(s.client_id, s.client_id),
            "plan": s.plan,
            "status": s.status,
            "billing_cycle": s.billing_cycle,
            "mrr": float(subscription_mrr(s)),
            "period_end": s.current_period_end.isoformat() if s.current_period_end else None,
            "auto_renew": True,
        }
        for s in subs
    ]


@router.get("/invoices")
def list_invoices(
    client_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    q = db.query(BillingInvoice).order_by(BillingInvoice.created_at.desc())
    if client_id:
        q = q.filter(BillingInvoice.client_id == client_id)
    if status and status != "all":
        q = q.filter(BillingInvoice.status == status)
    return enrich_invoices(db, q.all())


@router.get("/invoices/{invoice_id}")
def get_invoice(
    invoice_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    inv = db.query(BillingInvoice).filter(BillingInvoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    client = db.query(Client).filter(Client.id == inv.client_id).first()
    return invoice_to_dict(inv, client.name if client else None)


@router.post("/invoices", status_code=201)
def create_invoice(
    body: InvoiceCreate,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    try:
        inv = create_invoice_for_subscription(
            db,
            subscription_id=body.subscription_id,
            status=body.status,
            external_ref=body.external_ref,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e

    client = db.query(Client).filter(Client.id == inv.client_id).first()
    log_audit(
        db,
        action="invoice.create",
        operator=op,
        resource="billing",
        resource_id=inv.id,
        detail=f"amount={inv.amount} status={inv.status}",
    )
    return invoice_to_dict(inv, client.name if client else None)


@router.post("/invoices/{invoice_id}/record-payment")
def record_payment(
    invoice_id: str,
    body: RecordPaymentBody,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    inv = db.query(BillingInvoice).filter(BillingInvoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if inv.status == "paid":
        raise HTTPException(status_code=400, detail="Invoice already paid")

    mark_invoice_paid(db, inv, external_ref=body.external_ref)
    log_audit(
        db,
        action="invoice.payment.recorded",
        operator=op,
        resource="billing",
        resource_id=inv.id,
        detail=f"amount={inv.amount}",
    )
    client = db.query(Client).filter(Client.id == inv.client_id).first()
    return invoice_to_dict(inv, client.name if client else None)


@router.post("/invoices/{invoice_id}/mark-past-due")
def mark_past_due(
    invoice_id: str,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    inv = db.query(BillingInvoice).filter(BillingInvoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")

    mark_invoice_past_due(db, inv)
    log_audit(
        db,
        action="invoice.past_due",
        operator=op,
        resource="billing",
        resource_id=inv.id,
    )
    client = db.query(Client).filter(Client.id == inv.client_id).first()
    return invoice_to_dict(inv, client.name if client else None)


@router.post("/seed", status_code=201)
def seed_billing(
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    if op.role not in ("super_admin", "billing_admin"):
        raise HTTPException(status_code=403, detail="Billing admin required")
    count = seed_sample_invoices(db)
    return {"created": count}

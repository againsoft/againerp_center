import json
import uuid
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional

from sqlalchemy.orm import Session

from app.models.billing_invoice import BillingInvoice
from app.models.client import Client
from app.models.subscription import Subscription

PLAN_MRR_BDT: dict[str, Decimal] = {
    "starter": Decimal("4999"),
    "business": Decimal("12000"),
    "professional": Decimal("20000"),
    "enterprise": Decimal("34999"),
    "custom": Decimal("52000"),
}

INVOICE_STATUSES = {"draft", "open", "paid", "past_due", "void", "uncollectible"}


def plan_mrr(plan: str, billing_cycle: str = "monthly") -> Decimal:
    monthly = PLAN_MRR_BDT.get(plan.lower(), PLAN_MRR_BDT["starter"])
    if billing_cycle == "annual":
        return (monthly * 12).quantize(Decimal("0.01"))
    return monthly


def subscription_mrr(sub: Subscription) -> Decimal:
    monthly = PLAN_MRR_BDT.get(sub.plan.lower(), PLAN_MRR_BDT["starter"])
    if sub.billing_cycle == "annual":
        return (monthly / 12).quantize(Decimal("0.01"))
    return monthly


def _line_items_json(label: str, amount: Decimal) -> str:
    return json.dumps([{"label": label, "amount": float(amount)}])


def _next_invoice_number(db: Session) -> str:
    year = datetime.utcnow().year
    month = datetime.utcnow().month
    prefix = f"INV-{year}-{month:02d}-"
    count = db.query(BillingInvoice).filter(BillingInvoice.invoice_number.like(f"{prefix}%")).count()
    return f"{prefix}{count + 1:04d}"


def create_invoice_for_subscription(
    db: Session,
    *,
    subscription_id: str,
    status: str = "open",
    external_ref: Optional[str] = None,
) -> BillingInvoice:
    sub = db.query(Subscription).filter(Subscription.id == subscription_id).first()
    if not sub:
        raise ValueError("Subscription not found")

    amount = plan_mrr(sub.plan, sub.billing_cycle)
    period_start = sub.current_period_start or datetime.utcnow()
    period_end = sub.current_period_end or (period_start + timedelta(days=30))
    now = datetime.utcnow()
    due_at = now + timedelta(days=14)

    label = f"{sub.plan.capitalize()} plan — {sub.billing_cycle}"
    inv = BillingInvoice(
        id=f"inv_{uuid.uuid4().hex[:12]}",
        client_id=sub.client_id,
        subscription_id=sub.id,
        invoice_number=_next_invoice_number(db),
        amount=amount,
        currency="BDT",
        status=status if status in INVOICE_STATUSES else "open",
        period_start=period_start,
        period_end=period_end,
        issued_at=now if status != "draft" else None,
        due_at=due_at if status != "draft" else None,
        external_ref=external_ref,
        line_items=_line_items_json(label, amount),
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv


def mark_invoice_paid(
    db: Session,
    invoice: BillingInvoice,
    *,
    external_ref: Optional[str] = None,
    paid_at: Optional[datetime] = None,
) -> BillingInvoice:
    invoice.status = "paid"
    invoice.paid_at = paid_at or datetime.utcnow()
    if external_ref:
        invoice.external_ref = external_ref
    db.commit()
    db.refresh(invoice)

    sub = db.query(Subscription).filter(Subscription.id == invoice.subscription_id).first()
    if sub and sub.status == "past_due":
        sub.status = "active"
        db.commit()

    return invoice


def mark_invoice_past_due(db: Session, invoice: BillingInvoice) -> BillingInvoice:
    invoice.status = "past_due"
    db.commit()
    db.refresh(invoice)

    sub = db.query(Subscription).filter(Subscription.id == invoice.subscription_id).first()
    if sub and sub.status == "active":
        sub.status = "past_due"
        db.commit()

    return invoice


def find_invoice_by_external_ref(db: Session, external_ref: str) -> Optional[BillingInvoice]:
    return db.query(BillingInvoice).filter(BillingInvoice.external_ref == external_ref).first()


def compute_fleet_mrr(db: Session) -> Decimal:
    subs = db.query(Subscription).filter(Subscription.status.in_(["active", "past_due", "trial"])).all()
    return sum((subscription_mrr(s) for s in subs), Decimal("0"))


def compute_billing_stats(db: Session) -> dict:
    invoices = db.query(BillingInvoice).all()
    now = datetime.utcnow()
    month_prefix = now.strftime("%Y-%m")

    open_invoices = [i for i in invoices if i.status in ("open", "past_due")]
    past_due = [i for i in invoices if i.status == "past_due"]
    paid_this_month = [
        i for i in invoices
        if i.status == "paid" and i.paid_at and i.paid_at.strftime("%Y-%m") == month_prefix
    ]

    return {
        "total_mrr": float(compute_fleet_mrr(db)),
        "open_invoices": len(open_invoices),
        "past_due_amount": float(sum((i.amount for i in past_due), Decimal("0"))),
        "paid_this_month": float(sum((i.amount for i in paid_this_month), Decimal("0"))),
        "invoice_count": len(invoices),
    }


def seed_sample_invoices(db: Session) -> int:
    """Create one open invoice per active subscription when table is empty."""
    if db.query(BillingInvoice).count() > 0:
        return 0

    subs = db.query(Subscription).all()
    created = 0
    for i, sub in enumerate(subs):
        status = "open" if i % 3 != 1 else "paid"
        inv = create_invoice_for_subscription(db, subscription_id=sub.id, status=status)
        if status == "paid":
            mark_invoice_paid(db, inv, external_ref=f"pi_seed_{sub.id[-6:]}")
        elif i % 3 == 2:
            mark_invoice_past_due(db, inv)
        created += 1
    return created


def invoice_to_dict(inv: BillingInvoice, client_name: Optional[str] = None) -> dict:
    line_items = []
    if inv.line_items:
        try:
            line_items = json.loads(inv.line_items)
        except json.JSONDecodeError:
            line_items = []

    return {
        "id": inv.id,
        "client_id": inv.client_id,
        "business_name": client_name,
        "subscription_id": inv.subscription_id,
        "invoice_number": inv.invoice_number,
        "amount": float(inv.amount),
        "currency": inv.currency,
        "status": inv.status,
        "period_start": inv.period_start.isoformat() if inv.period_start else None,
        "period_end": inv.period_end.isoformat() if inv.period_end else None,
        "issued_at": inv.issued_at.isoformat() if inv.issued_at else None,
        "due_at": inv.due_at.isoformat() if inv.due_at else None,
        "paid_at": inv.paid_at.isoformat() if inv.paid_at else None,
        "external_ref": inv.external_ref,
        "line_items": line_items,
    }


def enrich_invoices(db: Session, invoices: list[BillingInvoice]) -> list[dict]:
    client_ids = {i.client_id for i in invoices}
    clients = db.query(Client).filter(Client.id.in_(client_ids)).all() if client_ids else []
    name_map = {c.id: c.name for c in clients}
    return [invoice_to_dict(i, name_map.get(i.client_id)) for i in invoices]

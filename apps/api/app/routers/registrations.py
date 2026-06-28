from __future__ import annotations

import json
import re
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator, require_step_up
from app.models.client import Client
from app.models.operator import Operator
from app.models.registration import Registration
from app.services.audit_service import log_audit
from app.services.ai_service import ensure_client_ai_access
from app.services.backup_service import ensure_backup_policy
from app.services.license_service import create_agent_token, create_license, create_subscription
from app.services.module_service import provision_client_modules
from app.services.update_service import ensure_client_update_state

router = APIRouter(prefix="/registrations", tags=["registrations"])

DEFAULT_MODULES = ["catalog", "orders", "customers", "inventory"]


class RegistrationCreate(BaseModel):
    business_name: str
    contact_name: str
    contact_email: EmailStr
    phone: Optional[str] = None
    requested_plan: str = "starter"
    requested_modules: list[str] = DEFAULT_MODULES
    wants_ai: bool = False
    industry: Optional[str] = None
    deployment_mode: str = "saas"
    region: Optional[str] = "Asia/Dhaka"
    website: Optional[str] = None
    employee_count: Optional[str] = None
    referral_source: Optional[str] = None
    operator_notes: Optional[str] = None


class RegistrationApprove(BaseModel):
    operator_notes: Optional[str] = None
    db_host: str = "localhost"
    db_port: int = 5432
    db_user: str = "postgres"
    db_password: str = "changeme"


class RegistrationReject(BaseModel):
    reason: str


def _slugify(name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")[:80]
    return slug or f"client-{uuid.uuid4().hex[:8]}"


def _unique_slug(db: Session, base: str) -> str:
    slug = base
    n = 1
    while db.query(Client).filter(Client.slug == slug).first():
        slug = f"{base}-{n}"
        n += 1
    return slug


def _reg_out(r: Registration) -> dict:
    return {
        "id": r.id,
        "business_name": r.business_name,
        "contact_name": r.contact_name,
        "contact_email": r.contact_email,
        "phone": r.phone,
        "requested_plan": r.requested_plan,
        "requested_modules": r.modules_list,
        "wants_ai": r.wants_ai,
        "industry": r.industry,
        "deployment_mode": r.deployment_mode,
        "region": r.region,
        "website": r.website,
        "employee_count": r.employee_count,
        "referral_source": r.referral_source,
        "status": r.status,
        "operator_notes": r.operator_notes,
        "rejection_reason": r.rejection_reason,
        "reviewed_by": r.reviewed_by_email,
        "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
        "client_id": r.client_id,
        "submitted_at": r.created_at.isoformat() if r.created_at else None,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


@router.get("")
def list_registrations(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    q = db.query(Registration).order_by(Registration.created_at.desc())
    if status:
        q = q.filter(Registration.status == status)
    return [_reg_out(r) for r in q.all()]


@router.post("", status_code=201)
def create_registration(
    body: RegistrationCreate,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    reg = Registration(
        id=f"reg_{uuid.uuid4().hex[:12]}",
        business_name=body.business_name,
        contact_name=body.contact_name,
        contact_email=body.contact_email,
        phone=body.phone,
        requested_plan=body.requested_plan,
        requested_modules=json.dumps(body.requested_modules),
        wants_ai=body.wants_ai,
        industry=body.industry,
        deployment_mode=body.deployment_mode,
        region=body.region,
        website=body.website,
        employee_count=body.employee_count,
        referral_source=body.referral_source,
        operator_notes=body.operator_notes,
        status="pending_review",
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    log_audit(
        db,
        action="registration.create",
        operator=op,
        resource="registration",
        resource_id=reg.id,
        detail=f"business={body.business_name}",
    )
    return _reg_out(reg)


@router.get("/{registration_id}")
def get_registration(
    registration_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    return _reg_out(reg)


@router.post("/{registration_id}/approve")
def approve_registration(
    registration_id: str,
    body: RegistrationApprove,
    db: Session = Depends(get_db),
    op: Operator = Depends(require_step_up),
) -> dict:
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    if reg.status != "pending_review":
        raise HTTPException(status_code=409, detail=f"Registration already {reg.status}")

    slug = _unique_slug(db, _slugify(reg.business_name))
    db_name = f"{slug.replace('-', '_')}_erp"

    client = Client(
        id=f"client_{uuid.uuid4().hex[:12]}",
        name=reg.business_name,
        slug=slug,
        domain=reg.website,
        db_host=body.db_host,
        db_port=body.db_port,
        db_name=db_name,
        db_user=body.db_user,
        db_password=body.db_password,
        plan=reg.requested_plan,
        status="pending",
        is_active=True,
        notes=(
            f"Provisioned from registration {reg.id}\n"
            f"Contact: {reg.contact_name} <{reg.contact_email}>\n"
            f"{body.operator_notes or reg.operator_notes or ''}"
        ).strip(),
    )
    db.add(client)
    db.flush()

    create_subscription(db, client_id=client.id, plan=reg.requested_plan)
    create_license(db, client_id=client.id, plan=reg.requested_plan)
    ensure_client_update_state(db, client.id)
    requested_modules = json.loads(reg.requested_modules) if reg.requested_modules else []
    provision_client_modules(
        db,
        client.id,
        plan=reg.requested_plan,
        extra_modules=requested_modules,
    )
    ensure_backup_policy(db, client.id, reg.requested_plan)
    ensure_client_ai_access(db, client.id, plan=reg.requested_plan, wants_ai=reg.wants_ai, client_status=client.status)
    _, agent_raw = create_agent_token(db, client_id=client.id, label="registration-provision")

    reg.status = "approved"
    reg.client_id = client.id
    reg.operator_notes = body.operator_notes or reg.operator_notes
    reg.reviewed_by_id = op.id
    reg.reviewed_by_email = op.email
    reg.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)

    log_audit(
        db,
        action="registration.approve",
        operator=op,
        resource="registration",
        resource_id=reg.id,
        detail=f"client_id={client.id}",
    )

    return {
        "registration": _reg_out(reg),
        "client_id": client.id,
        "client_slug": client.slug,
        "agent_token": agent_raw,
    }


@router.post("/{registration_id}/reject")
def reject_registration(
    registration_id: str,
    body: RegistrationReject,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    reg = db.query(Registration).filter(Registration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    if reg.status != "pending_review":
        raise HTTPException(status_code=409, detail=f"Registration already {reg.status}")

    reg.status = "rejected"
    reg.rejection_reason = body.reason
    reg.reviewed_by_id = op.id
    reg.reviewed_by_email = op.email
    reg.reviewed_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)

    log_audit(
        db,
        action="registration.reject",
        operator=op,
        resource="registration",
        resource_id=reg.id,
        detail=body.reason[:200],
    )
    return _reg_out(reg)

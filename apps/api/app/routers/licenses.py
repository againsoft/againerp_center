from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.license import License
from app.models.operator import Operator
from app.services.audit_service import log_audit
from app.services.license_service import create_license, validate_license

router = APIRouter(prefix="/licenses", tags=["licenses"])


class LicenseCreate(BaseModel):
    client_id: str
    plan: str = "starter"
    subscription_id: Optional[str] = None
    expires_days: int = 365


class LicenseValidateRequest(BaseModel):
    license_key: str


def _lic_out(lic: License) -> dict:
    return {
        "id": lic.id,
        "client_id": lic.client_id,
        "subscription_id": lic.subscription_id,
        "license_key": lic.license_key,
        "status": lic.status,
        "plan": lic.plan,
        "issued_at": lic.issued_at.isoformat() if lic.issued_at else None,
        "expires_at": lic.expires_at.isoformat() if lic.expires_at else None,
        "grace_ends_at": lic.grace_ends_at.isoformat() if lic.grace_ends_at else None,
        "created_at": lic.created_at.isoformat() if lic.created_at else None,
    }


@router.get("")
def list_licenses(
    client_id: Optional[str] = None,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> list:
    q = db.query(License).order_by(License.created_at.desc())
    if client_id:
        q = q.filter(License.client_id == client_id)
    return [_lic_out(lic) for lic in q.all()]


@router.post("", status_code=201)
def create_license_route(
    body: LicenseCreate,
    db: Session = Depends(get_db),
    op: Operator = Depends(get_current_operator),
) -> dict:
    lic = create_license(
        db,
        client_id=body.client_id,
        plan=body.plan,
        subscription_id=body.subscription_id,
        expires_days=body.expires_days,
    )
    log_audit(
        db,
        action="license.create",
        operator=op,
        resource="license",
        resource_id=lic.id,
        detail=f"key={lic.license_key}",
    )
    return _lic_out(lic)


@router.post("/validate")
def validate_license_route(
    body: LicenseValidateRequest,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    return validate_license(db, body.license_key)


@router.get("/{license_id}")
def get_license(
    license_id: str,
    db: Session = Depends(get_db),
    _: Operator = Depends(get_current_operator),
) -> dict:
    lic = db.query(License).filter(License.id == license_id).first()
    if not lic:
        raise HTTPException(status_code=404, detail="License not found")
    return _lic_out(lic)

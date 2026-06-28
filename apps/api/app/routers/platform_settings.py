from __future__ import annotations

from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.auth import get_current_operator
from app.models.platform_setting import PlatformSetting
from app.models.operator import Operator

router = APIRouter(prefix="/platform-settings", tags=["platform-settings"])

SECRET_KEYS = {"pagespeed_api_key", "openai_api_key", "smtp_password", "sms_api_key"}

KNOWN_KEYS: dict[str, dict[str, Any]] = {
    "pagespeed_api_key": {"label": "PageSpeed API Key", "description": "Google PageSpeed Insights — all client stores share this key", "is_secret": True, "group": "integrations"},
    "openai_api_key": {"label": "OpenAI API Key", "description": "OpenAI — used for AI features across all clients", "is_secret": True, "group": "integrations"},
    "smtp_host": {"label": "SMTP Host", "description": "SMTP server hostname", "is_secret": False, "group": "email"},
    "smtp_port": {"label": "SMTP Port", "description": "SMTP port (e.g. 587)", "is_secret": False, "group": "email"},
    "smtp_user": {"label": "SMTP Username", "description": "SMTP sender email", "is_secret": False, "group": "email"},
    "smtp_password": {"label": "SMTP Password", "description": "SMTP password", "is_secret": True, "group": "email"},
    "sms_api_key": {"label": "SMS API Key", "description": "SMS gateway API key", "is_secret": True, "group": "sms"},
    "sms_sender_id": {"label": "SMS Sender ID", "description": "Sender name for SMS", "is_secret": False, "group": "sms"},
    "platform_name": {"label": "Platform Name", "description": "Display name shown in emails and reports", "is_secret": False, "group": "general"},
    "support_email": {"label": "Support Email", "description": "Support contact email", "is_secret": False, "group": "general"},
}


def _mask(key: str, value: Optional[str]) -> Optional[str]:
    if value and key in SECRET_KEYS:
        return "•" * 8
    return value


class SettingOut(BaseModel):
    key: str
    value: Optional[str]
    description: Optional[str]
    is_secret: bool
    group: str
    label: str
    configured: bool


class SettingUpsert(BaseModel):
    value: str


@router.get("/", response_model=list[SettingOut])
def list_settings(db: Session = Depends(get_db), _: Operator = Depends(get_current_operator)) -> list[SettingOut]:
    rows = {r.key: r for r in db.query(PlatformSetting).all()}
    return [
        SettingOut(
            key=key,
            value=_mask(key, rows[key].value if key in rows else None),
            description=meta["description"],
            is_secret=meta["is_secret"],
            group=meta["group"],
            label=meta["label"],
            configured=bool(key in rows and rows[key].value),
        )
        for key, meta in KNOWN_KEYS.items()
    ]


@router.put("/{key}", response_model=SettingOut)
def upsert_setting(key: str, body: SettingUpsert, db: Session = Depends(get_db), _: Operator = Depends(get_current_operator)) -> SettingOut:
    if key not in KNOWN_KEYS:
        raise HTTPException(status_code=404, detail=f"Unknown key: {key}")
    meta = KNOWN_KEYS[key]
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    if row:
        row.value = body.value or None
    else:
        row = PlatformSetting(key=key, value=body.value or None, description=meta["description"], is_secret=meta["is_secret"])
        db.add(row)
    db.commit()
    db.refresh(row)
    return SettingOut(key=key, value=_mask(key, row.value), description=meta["description"], is_secret=meta["is_secret"], group=meta["group"], label=meta["label"], configured=bool(row.value))


@router.delete("/{key}")
def clear_setting(key: str, db: Session = Depends(get_db), _: Operator = Depends(get_current_operator)) -> dict:
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    if row:
        row.value = None
        db.commit()
    return {"cleared": True}


def get_platform_setting(db: Session, key: str) -> Optional[str]:
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    return row.value if row else None

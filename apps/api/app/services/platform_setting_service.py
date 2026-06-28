from __future__ import annotations

from typing import Optional

from sqlalchemy.orm import Session

from app.models.platform_setting import PlatformSetting


def get_platform_setting(db: Session, key: str) -> Optional[str]:
    row = db.query(PlatformSetting).filter(PlatformSetting.key == key).first()
    return row.value if row else None

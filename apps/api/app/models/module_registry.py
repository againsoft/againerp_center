import json
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ModuleRegistry(Base):
    """Platform ERP module catalog."""
    __tablename__ = "modules"

    code: Mapped[str] = mapped_column(String(64), primary_key=True)
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tier: Mapped[str] = mapped_column(String(20), nullable=False, default="core")
    dependencies: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    min_erp_version: Mapped[str] = mapped_column(String(32), nullable=False, default="2026.1.0")
    platform_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    feature_flag_key: Mapped[str] = mapped_column(String(128), nullable=False)
    is_core: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

    def dependency_list(self) -> list[str]:
        try:
            return json.loads(self.dependencies)
        except json.JSONDecodeError:
            return []

from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class BackupPolicy(Base):
    """Per-client backup schedule and retention policy — metadata only."""
    __tablename__ = "backup_policies"

    client_id: Mapped[str] = mapped_column(String(50), ForeignKey("clients.id"), primary_key=True)
    schedule_label: Mapped[str] = mapped_column(String(128), nullable=False, default="Daily 02:00 UTC")
    retention_days: Mapped[int] = mapped_column(Integer, nullable=False, default=30)
    storage_target: Mapped[str] = mapped_column(String(30), nullable=False, default="local")
    verification_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    policy_max_age_hours: Mapped[int] = mapped_column(Integer, nullable=False, default=26)
    timezone: Mapped[str] = mapped_column(String(64), nullable=False, default="UTC")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

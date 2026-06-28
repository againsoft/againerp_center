from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class UpdateRollout(Base):
    """Staged rollout campaign targeting an ERP version."""
    __tablename__ = "update_rollouts"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    erp_version_id: Mapped[str] = mapped_column(String(50), ForeignKey("erp_versions.id"), nullable=False)
    target_version: Mapped[str] = mapped_column(String(32), nullable=False)
    channel: Mapped[str] = mapped_column(String(20), nullable=False, default="stable")
    type: Mapped[str] = mapped_column(String(20), nullable=False, default="patch")
    stage: Mapped[str] = mapped_column(String(20), nullable=False, default="canary")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active")
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    soak_until: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    clients_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    clients_complete: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    clients_failed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    clients_pending: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

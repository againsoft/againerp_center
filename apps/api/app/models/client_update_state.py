from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ClientUpdateState(Base):
    """Per-client update channel, version, and rollout participation."""
    __tablename__ = "client_update_states"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    client_id: Mapped[str] = mapped_column(String(50), ForeignKey("clients.id"), unique=True, nullable=False, index=True)
    current_version: Mapped[str] = mapped_column(String(32), nullable=False, default="2026.5.2")
    target_version: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    channel: Mapped[str] = mapped_column(String(20), nullable=False, default="stable")
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="up_to_date")
    auto_update: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    last_attempt_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rollout_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("update_rollouts.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

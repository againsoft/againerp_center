from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ErpVersion(Base):
    """Published ERP release in the version catalog."""
    __tablename__ = "erp_versions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    version: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    channel: Mapped[str] = mapped_column(String(20), nullable=False, default="stable")
    type: Mapped[str] = mapped_column(String(20), nullable=False, default="patch")
    released_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    agent_min_version: Mapped[str] = mapped_column(String(32), nullable=False, default="1.0.0")
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rollout_stage: Mapped[str] = mapped_column(String(20), nullable=False, default="ga")
    is_latest: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

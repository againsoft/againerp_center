from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ClientAiAccess(Base):
    """Per-client AI OS provisioning and credit usage — metadata only."""

    __tablename__ = "client_ai_access"

    client_id: Mapped[str] = mapped_column(String(50), ForeignKey("clients.id"), primary_key=True)
    ai_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    access_status: Mapped[str] = mapped_column(String(20), nullable=False, default="disabled")
    agents_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=2)
    agents_active: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    credits_used: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    tools_enabled: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    last_ai_request: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    proxy_mode: Mapped[str] = mapped_column(String(20), nullable=False, default="cloud")
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

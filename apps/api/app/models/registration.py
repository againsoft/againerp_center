import json
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Registration(Base):
    """Inbound business signup awaiting operator review."""
    __tablename__ = "registrations"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    business_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_name: Mapped[str] = mapped_column(String(200), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    requested_plan: Mapped[str] = mapped_column(String(50), nullable=False, default="starter")
    requested_modules: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    wants_ai: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    deployment_mode: Mapped[str] = mapped_column(String(30), nullable=False, default="saas")
    region: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    website: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    employee_count: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    referral_source: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending_review", index=True)
    operator_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reviewed_by_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    reviewed_by_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    client_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    @property
    def modules_list(self) -> list[str]:
        try:
            return json.loads(self.requested_modules)
        except (json.JSONDecodeError, TypeError):
            return []

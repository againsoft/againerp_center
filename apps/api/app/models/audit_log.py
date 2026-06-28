from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AuditLog(Base):
    """Records every action taken in the Control Center."""
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    operator_id: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    operator_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    detail: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class AgentDiagnostic(Base):
    """Diagnostics bundle lifecycle — metadata only, bundle stored in object storage."""

    __tablename__ = "agent_diagnostics"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    client_id: Mapped[str] = mapped_column(String(50), ForeignKey("clients.id"), nullable=False, index=True)
    command_id: Mapped[Optional[str]] = mapped_column(String(50), ForeignKey("agent_commands.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="requested", index=True)
    requested_by: Mapped[str] = mapped_column(String(128), nullable=False)
    bundle_prefix: Mapped[str] = mapped_column(String(32), nullable=False)
    bundle_size_mb: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    uploaded_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)

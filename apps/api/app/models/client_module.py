from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class ClientModule(Base):
    """Per-client module entitlement and sync state."""
    __tablename__ = "client_modules"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    client_id: Mapped[str] = mapped_column(String(50), ForeignKey("clients.id"), nullable=False, index=True)
    module_code: Mapped[str] = mapped_column(String(64), ForeignKey("modules.code"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="enabled")
    enabled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    disabled_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

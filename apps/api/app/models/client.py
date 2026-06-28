from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Client(Base):
    """A registered client store/project controlled by this Control Center."""
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Client's own database connection
    db_host: Mapped[str] = mapped_column(String(255), nullable=False, default="localhost")
    db_port: Mapped[int] = mapped_column(Integer, nullable=False, default=5432)
    db_name: Mapped[str] = mapped_column(String(100), nullable=False)
    db_user: Mapped[str] = mapped_column(String(100), nullable=False)
    db_password: Mapped[str] = mapped_column(String(255), nullable=False)

    # Client API (for health checks, agent commands)
    api_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    api_key: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Status
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="active")
    plan: Mapped[str] = mapped_column(String(50), nullable=False, default="starter")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    # Metadata
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

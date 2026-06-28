from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Operator(Base):
    """Control Center admin users (super_admin, operator, viewer)."""
    __tablename__ = "operators"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    role: Mapped[str] = mapped_column(String(30), nullable=False, default="operator")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, server_default=func.now())

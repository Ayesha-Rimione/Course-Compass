import uuid
import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.students import StudentProfile


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    password_hash: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )

    profile: Mapped[Optional["StudentProfile"]] = relationship(
        "StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class OTPCode(Base):
    __tablename__ = "otp_codes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(
        String(255), index=True, nullable=False
    )
    code_hash: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    expires_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), nullable=False
    )
    used: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

import uuid
import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, Boolean, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.students import StudentProfile
    from app.models.mappings import CareerRoleSkill


class CareerRole(Base, TimestampMixin):
    __tablename__ = "career_roles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(100), default="Software Engineering", nullable=True
    )
    target_readiness_level: Mapped[Optional[int]] = mapped_column(
        Integer, default=80, nullable=True
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )

    student_career_interests: Mapped[list["StudentCareerInterest"]] = relationship(
        "StudentCareerInterest", back_populates="career_role"
    )
    required_skills: Mapped[list["CareerRoleSkill"]] = relationship(
        "CareerRoleSkill", back_populates="career_role", cascade="all, delete-orphan"
    )


class StudentCareerInterest(Base):
    __tablename__ = "student_career_interests"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    career_role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True
    )
    is_still_exploring: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile")
    career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole", back_populates="student_career_interests")

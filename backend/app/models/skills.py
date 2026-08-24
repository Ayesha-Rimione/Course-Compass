import uuid
import datetime
import enum
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Enum, Text, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.students import StudentProfile
    from app.models.mappings import CourseSkillMapping, CareerRoleSkill


class VerificationStatus(str, enum.Enum):
    NOT_VERIFIED = "NOT_VERIFIED"
    QUIZ_AVAILABLE = "QUIZ_AVAILABLE"
    QUIZ_IN_PROGRESS = "QUIZ_IN_PROGRESS"
    VERIFIED = "VERIFIED"


class QuizStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    PASSED = "PASSED"
    FAILED = "FAILED"


class Skill(Base, TimestampMixin):
    __tablename__ = "skills"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    category: Mapped[str] = mapped_column(
        String(100), default="Other", nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )

    student_skills: Mapped[List["StudentSkill"]] = relationship(
        "StudentSkill", back_populates="skill", cascade="all, delete-orphan"
    )
    skill_verifications: Mapped[List["SkillVerification"]] = relationship(
        "SkillVerification", back_populates="skill", cascade="all, delete-orphan"
    )
    course_mappings: Mapped[List["CourseSkillMapping"]] = relationship(
        "CourseSkillMapping", back_populates="skill", cascade="all, delete-orphan"
    )
    career_mappings: Mapped[List["CareerRoleSkill"]] = relationship(
        "CareerRoleSkill", back_populates="skill", cascade="all, delete-orphan"
    )


class StudentSkill(Base, TimestampMixin):
    __tablename__ = "student_skills"
    __table_args__ = (
        UniqueConstraint("student_profile_id", "skill_id", name="uq_student_skill"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False
    )
    self_rating: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False
    )
    verification_status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.NOT_VERIFIED, nullable=False
    )
    verified_rating: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="student_skills")
    verifications: Mapped[List["SkillVerification"]] = relationship(
        "SkillVerification",
        primaryjoin="and_(StudentSkill.student_profile_id==foreign(SkillVerification.student_profile_id), "
                    "StudentSkill.skill_id==foreign(SkillVerification.skill_id))",
        viewonly=True
    )


class SkillVerification(Base):
    __tablename__ = "skill_verifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    attempt_number: Mapped[int] = mapped_column(
        Integer, default=1, nullable=False
    )
    score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )
    max_score: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )
    percentage: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )
    status: Mapped[QuizStatus] = mapped_column(
        Enum(QuizStatus), default=QuizStatus.IN_PROGRESS, nullable=False
    )
    verified_rating: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    started_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="skill_verifications")

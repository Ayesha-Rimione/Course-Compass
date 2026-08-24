import uuid
import datetime
from typing import TYPE_CHECKING
from sqlalchemy import String, Float, Integer, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.courses import Course
    from app.models.skills import Skill
    from app.models.careers import CareerRole


class CourseSkillMapping(Base):
    """
    Maps a Course to a Skill with a relevance weight (0.0 – 1.0).
    Represents how strongly a course teaches a particular skill.
    """
    __tablename__ = "course_skill_mappings"
    __table_args__ = (
        UniqueConstraint("course_id", "skill_id", name="uq_course_skill"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    relevance_weight: Mapped[float] = mapped_column(
        Float, default=0.5, nullable=False
    )
    contribution_level: Mapped[str] = mapped_column(
        String(30), default="INTERMEDIATE", nullable=False
    )
    source: Mapped[str] = mapped_column(
        String(50), default="academic_mapping", nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    course: Mapped["Course"] = relationship("Course", back_populates="skill_mappings")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="course_mappings")


class CareerRoleSkill(Base):
    """
    Maps a CareerRole to a required Skill with importance and minimum_rating.
    Represents the CourseCompass career competency model.
    """
    __tablename__ = "career_role_skills"
    __table_args__ = (
        UniqueConstraint("career_role_id", "skill_id", name="uq_career_role_skill"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    career_role_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    skill_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True
    )
    importance: Mapped[int] = mapped_column(
        Integer, default=3, nullable=False
    )
    importance_level: Mapped[str] = mapped_column(
        String(30), default="IMPORTANT", nullable=False
    )
    minimum_rating: Mapped[int] = mapped_column(
        Integer, default=3, nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    career_role: Mapped["CareerRole"] = relationship("CareerRole", back_populates="required_skills")
    skill: Mapped["Skill"] = relationship("Skill", back_populates="career_mappings")

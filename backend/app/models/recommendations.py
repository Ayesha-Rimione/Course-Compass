import uuid
import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.skills import Skill
    from app.models.careers import CareerRole


class LearningResource(Base):
    """
    Database-backed learning resource mapped to skills and career roles.
    Uses verified, real-world URLs.
    """
    __tablename__ = "learning_resources"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    resource_type: Mapped[str] = mapped_column(
        String(50), default="DOCUMENTATION", nullable=False
    )
    difficulty: Mapped[str] = mapped_column(
        String(50), default="Beginner", nullable=False
    )
    estimated_hours: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    is_free: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    price: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    skill_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("skills.id", ondelete="SET NULL"), nullable=True, index=True
    )
    career_role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    skill: Mapped[Optional["Skill"]] = relationship("Skill")
    career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole")


class ProjectRecommendation(Base):
    """
    Recommended portfolio and capstone projects based on career role and skill gaps.
    """
    __tablename__ = "project_recommendations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    description: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    difficulty: Mapped[str] = mapped_column(
        String(50), default="Intermediate", nullable=False
    )
    estimated_hours: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    project_type: Mapped[Optional[str]] = mapped_column(
        String(50), default="Web App", nullable=True
    )
    skills_demonstrated: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True  # JSON string or comma-separated
    )
    technologies: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True  # JSON string or comma-separated
    )
    recommended_for_gap_level: Mapped[Optional[str]] = mapped_column(
        String(50), default="DEVELOPING", nullable=True  # MISSING, BEGINNER, DEVELOPING
    )
    is_team: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    career_role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    github_starter_url: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    live_demo_url: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole")


class Certification(Base):
    """
    Recognized industry credentials and certifications mapped to career roles and skills.
    """
    __tablename__ = "certifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    provider: Mapped[str] = mapped_column(
        String(100), nullable=False, index=True
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    url: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    estimated_hours: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    difficulty: Mapped[str] = mapped_column(
        String(50), default="Intermediate", nullable=False
    )
    skills_learned: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True  # JSON string or comma-separated
    )
    career_role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole")


class JobListing(Base):
    """
    Job role intelligence data model with clearly labeled sample data.
    """
    __tablename__ = "job_listings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    role: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    company_name: Mapped[str] = mapped_column(
        String(255), nullable=False, index=True
    )
    location: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    employment_type: Mapped[str] = mapped_column(
        String(50), default="Full-time", nullable=False
    )
    experience_level: Mapped[str] = mapped_column(
        String(50), default="Junior", nullable=False
    )
    salary_min: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    salary_max: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    currency: Mapped[str] = mapped_column(
        String(10), default="BDT", nullable=False
    )
    salary_formatted: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    required_skills: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True  # JSON string or comma-separated
    )
    source_url: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    posted_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    is_sample: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )
    career_role_id: Mapped[Optional[str]] = mapped_column(
        String(36), ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True, index=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    career_role: Mapped[Optional["CareerRole"]] = relationship("CareerRole")

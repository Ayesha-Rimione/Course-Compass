import uuid
import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.students import StudentProfile


class StudentProject(Base):
    __tablename__ = "student_projects"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True
    )
    tech_stack: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    github_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    live_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="projects")


class StudentCertification(Base):
    __tablename__ = "student_certifications"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    issuer: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    issue_date: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    expiry_date: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    credential_id: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    credential_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="certifications")

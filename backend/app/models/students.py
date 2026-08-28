import uuid
import datetime
import enum
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Float, Integer, Enum, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.users import User
    from app.models.courses import Course
    from app.models.portfolio import StudentProject, StudentCertification


class ProgressStatus(str, enum.Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class StudentProfile(Base, TimestampMixin):
    __tablename__ = "student_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    student_id: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    full_name: Mapped[Optional[str]] = mapped_column(
        String(255), nullable=True
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    university: Mapped[str] = mapped_column(
        String(255), default="IUBAT", nullable=False
    )
    department: Mapped[str] = mapped_column(
        String(255), default="Department of Computer Science & Engineering", nullable=False
    )
    program: Mapped[str] = mapped_column(
        String(255), default="B.Sc. in Computer Science & Engineering", nullable=False
    )
    batch: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    current_semester: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    cgpa: Mapped[Optional[float]] = mapped_column(
        Float, nullable=True
    )
    target_role: Mapped[Optional[str]] = mapped_column(
        String(255), default="Full-Stack Software Engineer", nullable=True
    )
    admission_session: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True
    )
    profile_image_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    bio: Mapped[Optional[str]] = mapped_column(
        String(1000), nullable=True
    )
    github_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    linkedin_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    codeforces_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )
    leetcode_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True
    )

    user: Mapped["User"] = relationship("User", back_populates="profile")
    course_progresses: Mapped[List["StudentCourseProgress"]] = relationship(
        "StudentCourseProgress", back_populates="student_profile", cascade="all, delete-orphan"
    )
    projects: Mapped[List["StudentProject"]] = relationship(
        "StudentProject", back_populates="student_profile", cascade="all, delete-orphan"
    )
    certifications: Mapped[List["StudentCertification"]] = relationship(
        "StudentCertification", back_populates="student_profile", cascade="all, delete-orphan"
    )


class StudentCourseProgress(Base):
    __tablename__ = "student_course_progress"
    __table_args__ = (
        UniqueConstraint("student_profile_id", "course_id", name="uq_student_course_progress"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False
    )
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[ProgressStatus] = mapped_column(
        Enum(ProgressStatus), default=ProgressStatus.NOT_STARTED, nullable=False
    )
    grade: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True
    )
    self_rating: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile", back_populates="course_progresses")
    course: Mapped["Course"] = relationship("Course", back_populates="student_progresses")

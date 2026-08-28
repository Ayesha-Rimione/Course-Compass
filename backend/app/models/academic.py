import uuid
import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.courses import Course


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    code: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    programs: Mapped[List["Program"]] = relationship(
        "Program", back_populates="department", cascade="all, delete-orphan"
    )


class Program(Base):
    __tablename__ = "programs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    department_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False
    )
    code: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    degree_type: Mapped[str] = mapped_column(
        String(100), default="Bachelor of Science", nullable=False
    )
    total_credits: Mapped[int] = mapped_column(
        Integer, default=140, nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    department: Mapped["Department"] = relationship("Department", back_populates="programs")
    batches: Mapped[List["Batch"]] = relationship("Batch", back_populates="program", cascade="all, delete-orphan")
    curriculum_versions: Mapped[List["CurriculumVersion"]] = relationship(
        "CurriculumVersion", back_populates="program", cascade="all, delete-orphan"
    )


class Batch(Base):
    __tablename__ = "batches"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    program_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("programs.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )
    admission_year: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="ACTIVE", nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    program: Mapped["Program"] = relationship("Program", back_populates="batches")


class CurriculumVersion(Base):
    __tablename__ = "curriculum_versions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    program_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("programs.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )  # e.g. "IUBAT CSE B231 Curriculum"
    version_code: Mapped[str] = mapped_column(
        String(50), index=True, nullable=False
    )  # e.g. "B231"
    effective_from: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    effective_to: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50), default="ACTIVE", nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    program: Mapped["Program"] = relationship("Program", back_populates="curriculum_versions")
    curriculum_courses: Mapped[List["CurriculumCourse"]] = relationship(
        "CurriculumCourse", back_populates="curriculum_version", cascade="all, delete-orphan"
    )


class CurriculumCourse(Base):
    __tablename__ = "curriculum_courses"
    __table_args__ = (
        UniqueConstraint("curriculum_version_id", "course_id", name="uq_curriculum_course"),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    curriculum_version_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("curriculum_versions.id", ondelete="CASCADE"), nullable=False
    )
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    semester: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    is_required: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False
    )

    curriculum_version: Mapped["CurriculumVersion"] = relationship("CurriculumVersion", back_populates="curriculum_courses")
    course: Mapped["Course"] = relationship("Course")

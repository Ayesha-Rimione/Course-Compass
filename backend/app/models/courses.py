import uuid
import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Float, Integer, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

if TYPE_CHECKING:
    from app.models.students import StudentCourseProgress
    from app.models.mappings import CourseSkillMapping


class Course(Base):
    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    course_code: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    course_name: Mapped[str] = mapped_column(
        String(255), nullable=False
    )
    credit_hours: Mapped[float] = mapped_column(
        Float, default=3.0, nullable=False
    )
    semester: Mapped[int] = mapped_column(
        Integer, default=1, index=True, nullable=False
    )
    description: Mapped[str] = mapped_column(
        Text, nullable=True, default=""
    )
    department: Mapped[str] = mapped_column(
        String(255), default="Department of Computer Science & Engineering", nullable=False
    )
    program: Mapped[str] = mapped_column(
        String(255), default="B.Sc. in Computer Science & Engineering", nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    topics: Mapped[List["CourseTopic"]] = relationship(
        "CourseTopic", back_populates="course", cascade="all, delete-orphan"
    )
    outcomes: Mapped[List["CourseOutcome"]] = relationship(
        "CourseOutcome", back_populates="course", cascade="all, delete-orphan"
    )
    student_progresses: Mapped[List["StudentCourseProgress"]] = relationship(
        "StudentCourseProgress", back_populates="course", cascade="all, delete-orphan"
    )
    skill_mappings: Mapped[List["CourseSkillMapping"]] = relationship(
        "CourseSkillMapping", back_populates="course", cascade="all, delete-orphan"
    )


class CourseTopic(Base):
    __tablename__ = "course_topics"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    topic_name: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    course: Mapped["Course"] = relationship("Course", back_populates="topics")


class CourseOutcome(Base):
    __tablename__ = "course_outcomes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    course_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False
    )
    outcome_code: Mapped[str] = mapped_column(
        String(50), nullable=False
    )
    description: Mapped[str] = mapped_column(
        Text, nullable=False
    )

    course: Mapped["Course"] = relationship("Course", back_populates="outcomes")

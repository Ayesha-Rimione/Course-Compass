import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.students import ProgressStatus
from app.schemas.courses import CourseListItem


class StudentProfileUpdate(BaseModel):
    student_id: Optional[str] = Field(None, json_schema_extra={"example": "21103042"})
    full_name: Optional[str] = Field(None, json_schema_extra={"example": "Nusrat Jahan"})
    university: Optional[str] = Field(None, json_schema_extra={"example": "IUBAT"})
    department: Optional[str] = Field(None, json_schema_extra={"example": "Department of Computer Science & Engineering"})
    program: Optional[str] = Field(None, json_schema_extra={"example": "B.Sc. in Computer Science & Engineering"})
    batch: Optional[str] = Field(None, json_schema_extra={"example": "51st"})
    current_semester: Optional[int] = Field(None, ge=1, le=12, json_schema_extra={"example": 6})
    cgpa: Optional[float] = Field(None, ge=0.0, le=4.0, json_schema_extra={"example": 3.75})
    admission_session: Optional[str] = Field(None, json_schema_extra={"example": "Fall 2021"})


class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    email: str
    student_id: Optional[str] = None
    full_name: Optional[str] = None
    university: str
    department: str
    program: str
    batch: Optional[str] = None
    current_semester: Optional[int] = None
    cgpa: Optional[float] = None
    admission_session: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class StudentCourseProgressCreate(BaseModel):
    course_code: str = Field(..., json_schema_extra={"example": "CSC 101"})
    status: ProgressStatus = Field(..., json_schema_extra={"example": ProgressStatus.COMPLETED})
    grade: Optional[str] = Field(None, json_schema_extra={"example": "A"})
    self_rating: Optional[int] = Field(None, ge=1, le=5, json_schema_extra={"example": 5})


class StudentCourseProgressUpdate(BaseModel):
    status: Optional[ProgressStatus] = Field(None, json_schema_extra={"example": ProgressStatus.COMPLETED})
    grade: Optional[str] = Field(None, json_schema_extra={"example": "A-"})
    self_rating: Optional[int] = Field(None, ge=1, le=5, json_schema_extra={"example": 4})


class StudentCourseProgressResponse(BaseModel):
    id: str
    student_profile_id: str
    course_id: str
    course_code: str
    course_name: str
    credit_hours: float
    semester: int
    status: ProgressStatus
    grade: Optional[str] = None
    self_rating: Optional[int] = None
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class CurriculumCourseItem(BaseModel):
    course: CourseListItem
    status: ProgressStatus
    grade: Optional[str] = None
    self_rating: Optional[int] = None


class CurriculumResponse(BaseModel):
    university: str
    department: str
    program: str
    batch: Optional[str]
    current_semester: Optional[int]
    total_courses: int
    completed_courses: int
    in_progress_courses: int
    courses: List[CurriculumCourseItem]

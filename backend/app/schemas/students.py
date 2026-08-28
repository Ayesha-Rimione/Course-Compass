import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.students import ProgressStatus
from app.schemas.courses import CourseListItem


class StudentProfileUpdate(BaseModel):
    student_id: Optional[str] = Field(None, json_schema_extra={"example": "21103042"})
    full_name: Optional[str] = Field(None, json_schema_extra={"example": "Nusrat Jahan"})
    phone: Optional[str] = Field(None, json_schema_extra={"example": "+8801700000000"})
    university: Optional[str] = Field(None, json_schema_extra={"example": "IUBAT"})
    department: Optional[str] = Field(None, json_schema_extra={"example": "Department of Computer Science & Engineering"})
    program: Optional[str] = Field(None, json_schema_extra={"example": "B.Sc. in Computer Science & Engineering"})
    batch: Optional[str] = Field(None, json_schema_extra={"example": "51st"})
    current_semester: Optional[int] = Field(None, ge=1, le=12, json_schema_extra={"example": 6})
    cgpa: Optional[float] = Field(None, ge=0.0, le=4.0, json_schema_extra={"example": 3.75})
    target_role: Optional[str] = Field(None, json_schema_extra={"example": "Full-Stack Software Engineer"})
    admission_session: Optional[str] = Field(None, json_schema_extra={"example": "Fall 2021"})
    bio: Optional[str] = Field(None, json_schema_extra={"example": "Computer science student passionate about backend systems."})
    github_url: Optional[str] = Field(None, json_schema_extra={"example": "https://github.com/nusrat"})
    linkedin_url: Optional[str] = Field(None, json_schema_extra={"example": "https://linkedin.com/in/nusrat"})
    codeforces_url: Optional[str] = Field(None, json_schema_extra={"example": "https://codeforces.com/profile/nusrat"})
    leetcode_url: Optional[str] = Field(None, json_schema_extra={"example": "https://leetcode.com/u/nusrat"})


class StudentProfileResponse(BaseModel):
    id: str
    user_id: str
    email: str
    role: str = "STUDENT"
    student_id: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    university: str
    department: str
    program: str
    batch: Optional[str] = None
    current_semester: Optional[int] = None
    cgpa: Optional[float] = None
    target_role: Optional[str] = None
    admission_session: Optional[str] = None
    bio: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    codeforces_url: Optional[str] = None
    leetcode_url: Optional[str] = None
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


class StudentCourseBatchItem(BaseModel):
    code: str
    grade: Optional[str] = "A"
    rating: Optional[int] = 4
    status: Optional[ProgressStatus] = ProgressStatus.COMPLETED


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


# Projects Schemas
class StudentProjectCreate(BaseModel):
    title: str = Field(..., json_schema_extra={"example": "CourseCompass Web Platform"})
    description: Optional[str] = Field(None, json_schema_extra={"example": "Curriculum-intelligence web app for CSE students."})
    tech_stack: Optional[str] = Field(None, json_schema_extra={"example": "React, TypeScript, FastAPI, PostgreSQL"})
    github_url: Optional[str] = Field(None, json_schema_extra={"example": "https://github.com/example/repo"})
    live_url: Optional[str] = Field(None, json_schema_extra={"example": "https://demo.app"})


class StudentProjectResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    tech_stack: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


# Certifications Schemas
class StudentCertificationCreate(BaseModel):
    name: str = Field(..., json_schema_extra={"example": "AWS Certified Solutions Architect"})
    issuer: str = Field(..., json_schema_extra={"example": "Amazon Web Services"})
    issue_date: Optional[str] = Field(None, json_schema_extra={"example": "2024-05"})
    expiry_date: Optional[str] = Field(None, json_schema_extra={"example": "2027-05"})
    credential_id: Optional[str] = Field(None, json_schema_extra={"example": "AWS-12345"})
    credential_url: Optional[str] = Field(None, json_schema_extra={"example": "https://aws.amazon.com/verify"})


class StudentCertificationResponse(BaseModel):
    id: str
    name: str
    issuer: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    created_at: datetime.datetime

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

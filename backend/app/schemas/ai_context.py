from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class AIStudentInfo(BaseModel):
    id: str
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
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    codeforces_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    bio: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AIAcademicContext(BaseModel):
    current_semester: Optional[int] = None
    cgpa: Optional[float] = None
    total_courses: int
    completed_courses: List[Dict[str, Any]] = []
    ongoing_courses: List[Dict[str, Any]] = []
    remaining_courses: List[Dict[str, Any]] = []
    completed_credits: float
    total_credits: float

    model_config = ConfigDict(from_attributes=True)


class AISkillsContext(BaseModel):
    self_rated: List[Dict[str, Any]] = []
    verified: List[Dict[str, Any]] = []
    gaps: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)


class AICareerContext(BaseModel):
    status: str  # SELECTED, STILL_EXPLORING, NOT_SET
    target_role: Optional[str] = None
    career_role_id: Optional[str] = None
    category: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AIReadinessContext(BaseModel):
    score: int
    current_level: str
    strongest_skills: List[str] = []
    weakest_skills: List[str] = []
    critical_gaps: List[str] = []
    next_priority: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AIPlanningContext(BaseModel):
    weekly: List[Dict[str, Any]] = []
    monthly: List[Dict[str, Any]] = []
    semester: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)


class AIRecommendationsContext(BaseModel):
    resources: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    certifications: List[Dict[str, Any]] = []
    sample_jobs: List[Dict[str, Any]] = []

    model_config = ConfigDict(from_attributes=True)


class AIContextResponse(BaseModel):
    """
    Sanitized, deterministic AI context contract for CourseCompass AI Bhai.
    Strictly guaranteed to never contain passwords, hashes, tokens, or credentials.
    """
    student: AIStudentInfo
    academic: AIAcademicContext
    skills: AISkillsContext
    career: AICareerContext
    readiness: AIReadinessContext
    planning: AIPlanningContext
    recommendations: AIRecommendationsContext

    model_config = ConfigDict(from_attributes=True)

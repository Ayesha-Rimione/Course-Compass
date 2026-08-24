from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class SkillGapItem(BaseModel):
    id: str
    skill: str
    skill_category: Optional[str] = None
    current_level: int = Field(0, alias="currentLevel")
    required_level: int = Field(3, alias="requiredLevel")
    gap: int
    importance: int = 3
    importance_level: str = "IMPORTANT"  # CORE, IMPORTANT, NICE_TO_HAVE
    priority: str  # CRITICAL, HIGH, MEDIUM, LOW, NO_GAP
    status: str  # MISSING, BEGINNER, DEVELOPING, READY
    evidence_source: str  # VERIFIED, SELF_RATED, ACADEMIC_EVIDENCE, MISSING
    academic_support: Optional[Dict[str, List[str]]] = None

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)


class RadarAxisItem(BaseModel):
    axis: str
    current: float
    required: float

    model_config = ConfigDict(from_attributes=True)


class SemesterGuidanceItem(BaseModel):
    semester: int
    title: str
    recommendations: List[str]

    model_config = ConfigDict(from_attributes=True)


class AcademicProgressSummary(BaseModel):
    completed_courses: int
    in_progress_courses: int
    remaining_courses: int
    total_courses: int
    completed_credits: float
    total_credits: float

    model_config = ConfigDict(from_attributes=True)


class RoadmapResponse(BaseModel):
    status: str = "ACTIVE"  # ACTIVE, EXPLORING
    target_role: str
    overall_readiness_percentage: int
    percent: int  # Seamless alias for frontend
    current_level: str
    summary: str
    strongest_skills: List[str] = []
    weakest_skills: List[str] = []
    critical_gaps: List[str] = []
    academic_progress: AcademicProgressSummary
    next_priority: str
    gaps: List[SkillGapItem] = []
    radar: List[RadarAxisItem] = []
    semester_guidance: List[SemesterGuidanceItem] = []
    formula_explanation: str

    model_config = ConfigDict(from_attributes=True)

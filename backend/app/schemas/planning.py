from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class PlanningRecommendationItem(BaseModel):
    id: str
    title: str
    description: str
    category: str  # ACADEMIC, SKILL, PROJECT, CERTIFICATION, CAREER
    priority: str  # HIGH, MEDIUM, LOW
    related_skill: Optional[str] = None
    related_course: Optional[str] = None
    estimated_effort: str  # e.g., "4-6 hrs/week", "20 hrs"
    reason: str  # Explicit deterministic explanation of WHY this recommendation was generated
    completed: bool = False

    model_config = ConfigDict(from_attributes=True)


class PlanningResponse(BaseModel):
    target_role: str
    current_semester: Optional[int] = 1
    weekly: List[PlanningRecommendationItem] = []
    monthly: List[PlanningRecommendationItem] = []
    semester: List[PlanningRecommendationItem] = []

    model_config = ConfigDict(from_attributes=True)

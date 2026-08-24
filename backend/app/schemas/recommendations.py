import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class LearningResourceResponse(BaseModel):
    id: str
    title: str
    provider: str
    url: str
    resource_type: str
    difficulty: str
    estimated_hours: Optional[int] = None
    is_free: bool = True
    price: Optional[str] = None
    category: Optional[str] = None
    skill_id: Optional[str] = None
    skill_name: Optional[str] = None
    career_role_id: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ProjectRecommendationResponse(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str
    estimated_hours: Optional[int] = None
    project_type: Optional[str] = "Web App"
    skills_demonstrated: List[str] = []
    technologies: List[str] = []
    recommended_for_gap_level: Optional[str] = "DEVELOPING"
    is_team: bool = False
    career_role_id: Optional[str] = None
    github_starter_url: Optional[str] = None
    live_demo_url: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class CertificationResponse(BaseModel):
    id: str
    name: str
    provider: str
    description: Optional[str] = None
    url: str
    estimated_hours: Optional[int] = None
    difficulty: str
    skills_learned: List[str] = []
    career_role_id: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class JobListingResponse(BaseModel):
    id: str
    role: str
    company_name: str
    location: str
    employment_type: str
    experience_level: str
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    currency: str = "BDT"
    salary_formatted: Optional[str] = None
    required_skills: List[str] = []
    source_url: Optional[str] = None
    posted_at: Optional[datetime.datetime] = None
    is_sample: bool = True
    career_role_id: Optional[str] = None
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

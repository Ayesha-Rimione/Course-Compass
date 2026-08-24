import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.models.skills import VerificationStatus


class SkillResponse(BaseModel):
    id: str
    name: str
    category: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StudentSkillCreate(BaseModel):
    skill_id: str = Field(..., description="UUID of the skill from the catalog")
    self_rating: int = Field(..., ge=1, le=5, description="Self-assessed rating 1–5")


class StudentSkillUpdate(BaseModel):
    self_rating: int = Field(..., ge=1, le=5, description="Updated self-assessed rating 1–5")


class StudentSkillResponse(BaseModel):
    id: str
    student_profile_id: str
    skill_id: str
    skill_name: str
    skill_category: str
    self_rating: int
    verification_status: VerificationStatus
    verified_rating: Optional[int] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field, model_validator


class CareerRoleSkillItem(BaseModel):
    skill_id: str
    skill_name: str
    skill_category: str
    importance: int
    importance_level: str  # CORE, IMPORTANT, NICE_TO_HAVE
    minimum_rating: int

    model_config = ConfigDict(from_attributes=True)


class CareerRoleResponse(BaseModel):
    id: str
    name: str
    category: Optional[str] = "Software Engineering"
    target_readiness_level: Optional[int] = 80
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CareerRoleDetailResponse(CareerRoleResponse):
    required_skills: List[CareerRoleSkillItem] = []


class CareerInterestUpdate(BaseModel):
    career_role_id: Optional[str] = Field(None, description="UUID of the selected career role, or null")
    is_still_exploring: bool = Field(False, description="True if student is still exploring career options")

    @model_validator(mode="after")
    def validate_career_state(self) -> "CareerInterestUpdate":
        """
        A student must be in exactly one valid state:
        - Exploring (is_still_exploring=True, career_role_id can be anything)
        - Selected a role (career_role_id is set, is_still_exploring=False)
        It is invalid to have: career_role_id=None AND is_still_exploring=False
        """
        if not self.is_still_exploring and self.career_role_id is None:
            raise ValueError(
                "Invalid career interest state: must either select a career role "
                "or set is_still_exploring=true."
            )
        return self


class CareerInterestResponse(BaseModel):
    id: str
    student_profile_id: str
    career_role_id: Optional[str] = None
    career_role_name: Optional[str] = None
    is_still_exploring: bool
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

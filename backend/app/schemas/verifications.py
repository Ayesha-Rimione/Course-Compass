import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.skills import QuizStatus


class VerificationStartResponse(BaseModel):
    id: str
    student_profile_id: str
    skill_id: str
    skill_name: str
    attempt_number: int
    status: QuizStatus
    started_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class VerificationAttemptResponse(BaseModel):
    id: str
    skill_id: str
    skill_name: str
    attempt_number: int
    score: Optional[float] = None
    max_score: Optional[float] = None
    percentage: Optional[float] = None
    status: QuizStatus
    verified_rating: Optional[int] = None
    started_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None

    model_config = ConfigDict(from_attributes=True)


class VerificationHistoryResponse(BaseModel):
    skill_id: str
    skill_name: str
    total_attempts: int
    attempts: List[VerificationAttemptResponse]

from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.skills import SkillResponse, StudentSkillCreate, StudentSkillUpdate, StudentSkillResponse
from app.schemas.verifications import VerificationStartResponse, VerificationHistoryResponse
from app.services import skill_service, verification_service

router = APIRouter(tags=["Skills"])


@router.get("/skills", response_model=List[SkillResponse], status_code=status.HTTP_200_OK)
def list_skills_catalog(db: Session = Depends(get_db)):
    """Return the global skills catalog (no authentication required)."""
    return skill_service.list_skills(db)


@router.get("/students/me/skills", response_model=List[StudentSkillResponse], status_code=status.HTTP_200_OK)
def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return all skills in the authenticated student's profile."""
    return skill_service.get_student_skills(db, current_user)


@router.post("/students/me/skills", response_model=StudentSkillResponse, status_code=status.HTTP_201_CREATED)
def add_my_skill(
    payload: StudentSkillCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a skill to the authenticated student's profile."""
    return skill_service.add_student_skill(db, current_user, payload)


@router.put("/students/me/skills/{skill_id}", response_model=StudentSkillResponse, status_code=status.HTTP_200_OK)
def update_my_skill(
    skill_id: str,
    payload: StudentSkillUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update self-rating for a skill in the authenticated student's profile."""
    return skill_service.update_student_skill(db, current_user, skill_id, payload)


@router.delete("/students/me/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_skill(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a skill from the authenticated student's profile."""
    skill_service.delete_student_skill(db, current_user, skill_id)


@router.post(
    "/students/me/skills/{skill_id}/verification/start",
    response_model=VerificationStartResponse,
    status_code=status.HTTP_201_CREATED
)
def start_skill_verification(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Initialize a verification attempt record for a student skill."""
    return verification_service.start_verification(db, current_user, skill_id)


@router.get(
    "/students/me/skills/{skill_id}/verification",
    response_model=VerificationHistoryResponse,
    status_code=status.HTTP_200_OK
)
def get_skill_verification_history(
    skill_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return verification attempt history for a specific skill."""
    return verification_service.get_verification_history(db, current_user, skill_id)

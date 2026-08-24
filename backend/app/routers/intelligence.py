from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.services import skill_gap_service, course_coverage_service

router = APIRouter(tags=["Academic Intelligence"])


@router.get(
    "/students/me/skill-gaps",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK
)
def get_my_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return a deterministic skill gap analysis for the authenticated student.

    Based on:
    - Student's selected career role and its required skills
    - Student's self-rated (and verified) skills
    - Academic coverage from course_skill_mappings

    Priority formula: importance × gap × evidence_factor
    (see skill_gap_service.py for full documentation)
    """
    return skill_gap_service.calculate_skill_gaps(db, current_user)


@router.get(
    "/students/me/course-coverage",
    response_model=Dict[str, Any],
    status_code=status.HTTP_200_OK
)
def get_my_course_coverage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return academic course coverage per skill for the authenticated student.
    Shows which courses teach each relevant skill and the student's
    current progress status for each course.
    """
    return course_coverage_service.get_course_coverage(db, current_user)

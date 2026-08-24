from typing import Any, Dict
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.services import student_context_service

router = APIRouter(tags=["Student Context"])


@router.get("/students/me/context", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
def get_my_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Return a comprehensive, structured context for the authenticated student.
    Includes: profile, curriculum summary, skills, career interest, verifications.
    This is the AI Bhai integration endpoint — contains NO secrets or auth data.
    """
    return student_context_service.get_student_context(db, current_user)

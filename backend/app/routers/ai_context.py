from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.ai_context import AIContextResponse
from app.services import ai_context_service

router = APIRouter(tags=["AI Integration Contract"])


@router.get(
    "/students/me/ai-context",
    response_model=AIContextResponse,
    status_code=status.HTTP_200_OK,
    summary="Get sanitized, security-hardened AI context contract for future AI Bhai",
)
def get_student_ai_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Assemble the complete student intelligence context for the AI advising engine.
    Guaranteed zero passwords, zero OTP hashes, zero JWT secrets.
    """
    return ai_context_service.get_ai_context(db, current_user)

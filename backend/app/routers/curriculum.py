from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.students import CurriculumResponse
from app.services import curriculum_service

router = APIRouter(prefix="/curriculum", tags=["Curriculum"])


@router.get("/me", response_model=CurriculumResponse, status_code=status.HTTP_200_OK)
def get_my_curriculum(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return curriculum_service.get_student_curriculum(db, current_user)

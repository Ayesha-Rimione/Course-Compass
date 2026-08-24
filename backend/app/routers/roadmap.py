from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.roadmap import RoadmapResponse
from app.services import readiness_service

router = APIRouter(tags=["Roadmap & Readiness"])


@router.get(
    "/students/me/roadmap",
    response_model=RoadmapResponse,
    status_code=status.HTTP_200_OK,
    summary="Get student career roadmap and deterministic readiness score",
)
def get_my_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the authenticated student's deterministic career readiness roadmap,
    including overall readiness score, skill gaps, competency radar, and semester guidance.
    """
    return readiness_service.calculate_readiness_roadmap(db, current_user)


@router.get(
    "/roadmap",
    response_model=RoadmapResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def get_my_roadmap_alias(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return readiness_service.calculate_readiness_roadmap(db, current_user)

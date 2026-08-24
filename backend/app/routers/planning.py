from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.planning import PlanningResponse
from app.services import planning_service

router = APIRouter(tags=["Academic Planning"])


@router.get(
    "/students/me/planning",
    response_model=PlanningResponse,
    status_code=status.HTTP_200_OK,
    summary="Get 3-horizon academic & career planning recommendations",
)
def get_my_planning(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return deterministic weekly, monthly, and semester planning recommendations
    rooted in the student's target career role, curriculum status, and skill gaps.
    """
    return planning_service.generate_planning_recommendations(db, current_user)


@router.get(
    "/planning",
    response_model=PlanningResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False,
)
def get_my_planning_alias(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return planning_service.generate_planning_recommendations(db, current_user)

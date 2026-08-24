from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.careers import (
    CareerRoleResponse,
    CareerRoleDetailResponse,
    CareerInterestUpdate,
    CareerInterestResponse,
)
from app.services import career_service

router = APIRouter(tags=["Careers"])


@router.get("/career-roles", response_model=List[CareerRoleResponse], status_code=status.HTTP_200_OK)
@router.get("/careers/roles", response_model=List[CareerRoleResponse], status_code=status.HTTP_200_OK, include_in_schema=False)
def list_career_roles_catalog(db: Session = Depends(get_db)):
    """Return the global career roles catalog (no authentication required)."""
    return career_service.list_career_roles(db)


@router.get("/career-roles/{role_id}", response_model=CareerRoleDetailResponse, status_code=status.HTTP_200_OK)
@router.get("/careers/roles/{role_id}", response_model=CareerRoleDetailResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def get_career_role_detail(role_id: str, db: Session = Depends(get_db)):
    """Return detailed career role information with its required skills."""
    return career_service.get_career_role_detail(db, role_id)


@router.get("/career-interests/me", response_model=CareerInterestResponse, status_code=status.HTTP_200_OK)
@router.get("/students/me/career", response_model=CareerInterestResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def get_my_career_interest(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return the authenticated student's current career interest."""
    return career_service.get_career_interest(db, current_user)


@router.put("/career-interests/me", response_model=CareerInterestResponse, status_code=status.HTTP_200_OK)
@router.put("/students/me/career", response_model=CareerInterestResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def update_my_career_interest(
    payload: CareerInterestUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Set or update the authenticated student's career interest.
    Must either select a career_role_id OR set is_still_exploring=true.
    """
    return career_service.update_career_interest(db, current_user, payload)

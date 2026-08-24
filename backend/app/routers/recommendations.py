from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.recommendations import (
    LearningResourceResponse,
    ProjectRecommendationResponse,
    CertificationResponse,
    JobListingResponse,
)
from app.services import recommendations_service

router = APIRouter(tags=["Recommendations & Opportunities"])


# ── 1. Learning Resources ──────────────────────────────────────────────
@router.get(
    "/resources",
    response_model=List[LearningResourceResponse],
    status_code=status.HTTP_200_OK,
    summary="List global learning resources catalog",
)
def list_resources(
    skill_id: Optional[str] = Query(None, description="Filter by skill ID"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    db: Session = Depends(get_db),
):
    return recommendations_service.list_resources(
        db, skill_id=skill_id, resource_type=resource_type, difficulty=difficulty
    )


@router.get(
    "/students/me/resources",
    response_model=List[LearningResourceResponse],
    status_code=status.HTTP_200_OK,
    summary="Get personalized learning resources prioritized by skill gaps",
)
def get_my_resources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recommendations_service.get_student_resources(db, current_user)


# ── 2. Project Recommendations ─────────────────────────────────────────
@router.get(
    "/projects",
    response_model=List[ProjectRecommendationResponse],
    status_code=status.HTTP_200_OK,
    summary="List recommended projects catalog",
)
def list_projects(
    career_role_id: Optional[str] = Query(None, description="Filter by career role ID"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    db: Session = Depends(get_db),
):
    return recommendations_service.list_projects(
        db, career_role_id=career_role_id, difficulty=difficulty
    )


@router.get(
    "/students/me/projects",
    response_model=List[ProjectRecommendationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get personalized portfolio projects matching target career role",
)
def get_my_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recommendations_service.get_student_projects(db, current_user)


# ── 3. Certifications ──────────────────────────────────────────────────
@router.get(
    "/certifications",
    response_model=List[CertificationResponse],
    status_code=status.HTTP_200_OK,
    summary="List recognized certifications catalog",
)
def list_certifications(
    career_role_id: Optional[str] = Query(None, description="Filter by career role ID"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty"),
    db: Session = Depends(get_db),
):
    return recommendations_service.list_certifications(
        db, career_role_id=career_role_id, difficulty=difficulty
    )


@router.get(
    "/students/me/certifications",
    response_model=List[CertificationResponse],
    status_code=status.HTTP_200_OK,
    summary="Get personalized certifications aligned with career role",
)
def get_my_certifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recommendations_service.get_student_certifications(db, current_user)


# ── 4. Job Listings ────────────────────────────────────────────────────
@router.get(
    "/jobs",
    response_model=List[JobListingResponse],
    status_code=status.HTTP_200_OK,
    summary="List sample job market opportunities",
)
def list_jobs(
    career_role_id: Optional[str] = Query(None, description="Filter by career role ID"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level"),
    db: Session = Depends(get_db),
):
    return recommendations_service.list_jobs(
        db, career_role_id=career_role_id, experience_level=experience_level
    )


@router.get(
    "/students/me/jobs",
    response_model=List[JobListingResponse],
    status_code=status.HTTP_200_OK,
    summary="Get job market listings matching student's career role",
)
def get_my_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return recommendations_service.get_student_jobs(db, current_user)

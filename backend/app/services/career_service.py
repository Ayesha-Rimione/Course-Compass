from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.mappings import CareerRoleSkill
from app.models.skills import Skill
from app.schemas.careers import (
    CareerRoleResponse,
    CareerRoleDetailResponse,
    CareerRoleSkillItem,
    CareerInterestUpdate,
    CareerInterestResponse
)
from app.services.student_service import get_or_create_profile


def list_career_roles(db: Session) -> List[CareerRoleResponse]:
    """Return the global career roles catalog."""
    roles = db.query(CareerRole).order_by(CareerRole.name.asc()).all()
    return [CareerRoleResponse.model_validate(r) for r in roles]


def get_career_role_detail(db: Session, role_id: str) -> CareerRoleDetailResponse:
    """Return detailed career role information with its required skills."""
    role = db.query(CareerRole).filter(CareerRole.id == role_id).first()
    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Career role '{role_id}' not found."
        )

    skills_data: List[CareerRoleSkillItem] = []
    for req in role.required_skills:
        skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
        if skill:
            skills_data.append(
                CareerRoleSkillItem(
                    skill_id=skill.id,
                    skill_name=skill.name,
                    skill_category=skill.category,
                    importance=req.importance,
                    importance_level=getattr(req, "importance_level", "IMPORTANT") or "IMPORTANT",
                    minimum_rating=req.minimum_rating,
                )
            )

    return CareerRoleDetailResponse(
        id=role.id,
        name=role.name,
        category=role.category or "Software Engineering",
        target_readiness_level=role.target_readiness_level or 80,
        description=role.description,
        required_skills=skills_data,
    )


def get_career_interest(db: Session, user: User) -> CareerInterestResponse:
    """Return the student's current career interest record (creates default if none)."""
    profile = get_or_create_profile(db, user)
    record = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )
    if not record:
        # Return a default "still exploring" state without persisting
        return CareerInterestResponse(
            id="",
            student_profile_id=profile.id,
            career_role_id=None,
            career_role_name=None,
            is_still_exploring=True,
            updated_at=None
        )
    return _build_career_interest_response(record)


def update_career_interest(
    db: Session, user: User, data: CareerInterestUpdate
) -> CareerInterestResponse:
    """
    Upsert career interest for the authenticated student.
    Validation is enforced by the CareerInterestUpdate schema validator.
    """
    profile = get_or_create_profile(db, user)

    # Validate career_role_id if provided
    if data.career_role_id is not None:
        role = db.query(CareerRole).filter(CareerRole.id == data.career_role_id).first()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Career role with id '{data.career_role_id}' not found."
            )

    record = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    if record:
        record.career_role_id = data.career_role_id
        record.is_still_exploring = data.is_still_exploring
    else:
        record = StudentCareerInterest(
            student_profile_id=profile.id,
            career_role_id=data.career_role_id,
            is_still_exploring=data.is_still_exploring
        )
        db.add(record)

    db.commit()
    db.refresh(record)
    return _build_career_interest_response(record)


def _build_career_interest_response(record: StudentCareerInterest) -> CareerInterestResponse:
    role_name = record.career_role.name if record.career_role else None
    return CareerInterestResponse(
        id=record.id,
        student_profile_id=record.student_profile_id,
        career_role_id=record.career_role_id,
        career_role_name=role_name,
        is_still_exploring=record.is_still_exploring,
        updated_at=record.updated_at
    )

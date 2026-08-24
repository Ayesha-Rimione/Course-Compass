from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.students import StudentProfile
from app.schemas.skills import StudentSkillCreate, StudentSkillUpdate, StudentSkillResponse, SkillResponse
from app.services.student_service import get_or_create_profile


def list_skills(db: Session) -> List[SkillResponse]:
    """Return the global skills catalog."""
    skills = db.query(Skill).order_by(Skill.category.asc(), Skill.name.asc()).all()
    return [SkillResponse.model_validate(s) for s in skills]


def get_student_skills(db: Session, user: User) -> List[StudentSkillResponse]:
    """Return all skills associated with the authenticated student."""
    profile = get_or_create_profile(db, user)
    records = (
        db.query(StudentSkill)
        .filter(StudentSkill.student_profile_id == profile.id)
        .all()
    )
    return [_build_student_skill_response(r) for r in records]


def add_student_skill(
    db: Session, user: User, data: StudentSkillCreate
) -> StudentSkillResponse:
    """Add a skill to the student's profile. Prevents duplicates."""
    profile = get_or_create_profile(db, user)

    skill = db.query(Skill).filter(Skill.id == data.skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill with id '{data.skill_id}' not found in catalog."
        )

    existing = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.student_profile_id == profile.id,
            StudentSkill.skill_id == data.skill_id
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Skill '{skill.name}' already added. Use PUT to update the rating."
        )

    student_skill = StudentSkill(
        student_profile_id=profile.id,
        skill_id=data.skill_id,
        self_rating=data.self_rating,
        verification_status=VerificationStatus.NOT_VERIFIED
    )
    db.add(student_skill)
    db.commit()
    db.refresh(student_skill)
    return _build_student_skill_response(student_skill)


def update_student_skill(
    db: Session, user: User, skill_id: str, data: StudentSkillUpdate
) -> StudentSkillResponse:
    """Update self-rating for an existing student skill. Enforces ownership."""
    profile = get_or_create_profile(db, user)

    student_skill = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.student_profile_id == profile.id,
            StudentSkill.skill_id == skill_id
        )
        .first()
    )
    if not student_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill not found in your profile. Add it first with POST /students/me/skills."
        )

    student_skill.self_rating = data.self_rating
    db.commit()
    db.refresh(student_skill)
    return _build_student_skill_response(student_skill)


def delete_student_skill(db: Session, user: User, skill_id: str) -> None:
    """Remove a skill from the student's profile. Enforces ownership."""
    profile = get_or_create_profile(db, user)

    student_skill = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.student_profile_id == profile.id,
            StudentSkill.skill_id == skill_id
        )
        .first()
    )
    if not student_skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found in your profile."
        )

    db.delete(student_skill)
    db.commit()


def _build_student_skill_response(record: StudentSkill) -> StudentSkillResponse:
    return StudentSkillResponse(
        id=record.id,
        student_profile_id=record.student_profile_id,
        skill_id=record.skill_id,
        skill_name=record.skill.name,
        skill_category=record.skill.category,
        self_rating=record.self_rating,
        verification_status=record.verification_status,
        verified_rating=record.verified_rating,
        created_at=record.created_at,
        updated_at=record.updated_at
    )

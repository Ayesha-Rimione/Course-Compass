from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.skills import Skill, StudentSkill, SkillVerification, VerificationStatus, QuizStatus
from app.schemas.verifications import VerificationStartResponse, VerificationHistoryResponse, VerificationAttemptResponse
from app.services.student_service import get_or_create_profile


def start_verification(
    db: Session, user: User, skill_id: str
) -> VerificationStartResponse:
    """
    Initialize a skill verification attempt record.
    Sets StudentSkill.verification_status to QUIZ_IN_PROGRESS.
    Does NOT generate quiz questions — data layer only.
    """
    profile = get_or_create_profile(db, user)

    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill with id '{skill_id}' not found."
        )

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
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must add this skill to your profile before starting verification."
        )

    # Count existing attempts for this student+skill
    attempt_count = (
        db.query(SkillVerification)
        .filter(
            SkillVerification.student_profile_id == profile.id,
            SkillVerification.skill_id == skill_id
        )
        .count()
    )

    verification = SkillVerification(
        student_profile_id=profile.id,
        skill_id=skill_id,
        attempt_number=attempt_count + 1,
        status=QuizStatus.IN_PROGRESS
    )
    db.add(verification)

    # Update student_skill verification_status
    student_skill.verification_status = VerificationStatus.QUIZ_IN_PROGRESS
    db.commit()
    db.refresh(verification)

    return VerificationStartResponse(
        id=verification.id,
        student_profile_id=verification.student_profile_id,
        skill_id=verification.skill_id,
        skill_name=skill.name,
        attempt_number=verification.attempt_number,
        status=verification.status,
        started_at=verification.started_at
    )


def get_verification_history(
    db: Session, user: User, skill_id: str
) -> VerificationHistoryResponse:
    """Return all verification attempts for a specific skill."""
    profile = get_or_create_profile(db, user)

    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Skill with id '{skill_id}' not found."
        )

    records = (
        db.query(SkillVerification)
        .filter(
            SkillVerification.student_profile_id == profile.id,
            SkillVerification.skill_id == skill_id
        )
        .order_by(SkillVerification.started_at.asc())
        .all()
    )

    attempts = [
        VerificationAttemptResponse(
            id=r.id,
            skill_id=r.skill_id,
            skill_name=skill.name,
            attempt_number=r.attempt_number,
            score=r.score,
            max_score=r.max_score,
            percentage=r.percentage,
            status=r.status,
            verified_rating=r.verified_rating,
            started_at=r.started_at,
            completed_at=r.completed_at
        )
        for r in records
    ]

    return VerificationHistoryResponse(
        skill_id=skill_id,
        skill_name=skill.name,
        total_attempts=len(attempts),
        attempts=attempts
    )

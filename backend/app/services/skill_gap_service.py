"""
skill_gap_service.py

Deterministic skill gap engine for CourseCompass.

PRIORITY FORMULA (documented explicitly):
    priority_score = importance × gap × evidence_factor

Where:
    importance      = career role's importance for this skill (1-5)
    gap             = minimum_rating - effective_rating  (0 if no gap)
    evidence_factor = weight applied based on rating evidence quality:
        VERIFIED_SKILL : 0.8  (verified evidence — we trust the rating more, so gap is smaller concern)
        SELF_RATED     : 1.0  (self-reported — full gap weight)
        MISSING        : 1.2  (no data at all — highest uncertainty, prioritize)

Priority categories (based on priority_score):
    score >= 10  → CRITICAL
    score >= 6   → HIGH
    score >= 3   → MEDIUM
    score >= 1   → LOW
    score == 0   → NO_GAP

Status mapping:
    effective_rating == 0              → MISSING
    gap == 0 or effective >= target    → READY
    effective_rating <= 2              → BEGINNER
    otherwise                          → DEVELOPING

The same student data always produces the same result (deterministic).
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.courses import Course
from app.models.students import StudentCourseProgress, ProgressStatus
from app.models.mappings import CareerRoleSkill, CourseSkillMapping
from app.services.student_service import get_or_create_profile


# Evidence factor constants (documented in module docstring)
EVIDENCE_FACTOR_VERIFIED = 0.8
EVIDENCE_FACTOR_SELF_RATED = 1.0
EVIDENCE_FACTOR_MISSING = 1.2

# Priority thresholds
PRIORITY_CRITICAL = 10
PRIORITY_HIGH = 6
PRIORITY_MEDIUM = 3
PRIORITY_LOW = 1


def _priority_label(score: float) -> str:
    if score >= PRIORITY_CRITICAL:
        return "CRITICAL"
    if score >= PRIORITY_HIGH:
        return "HIGH"
    if score >= PRIORITY_MEDIUM:
        return "MEDIUM"
    if score >= PRIORITY_LOW:
        return "LOW"
    return "NO_GAP"


def _status_label(effective_rating: int, gap: int) -> str:
    if effective_rating == 0:
        return "MISSING"
    if gap == 0:
        return "READY"
    if effective_rating <= 2:
        return "BEGINNER"
    return "DEVELOPING"


def _importance_level(req: CareerRoleSkill) -> str:
    if hasattr(req, "importance_level") and req.importance_level:
        return req.importance_level
    if req.importance >= 4:
        return "CORE"
    elif req.importance == 3:
        return "IMPORTANT"
    else:
        return "NICE_TO_HAVE"


def _get_academic_support(
    db: Session,
    skill_id: str,
    profile_id: str
) -> Dict[str, List[str]]:
    """
    For a given skill, find all courses that teach it and classify
    them by the student's progress status.
    """
    mappings = (
        db.query(CourseSkillMapping)
        .filter(CourseSkillMapping.skill_id == skill_id)
        .all()
    )

    progress_records = (
        db.query(StudentCourseProgress)
        .filter(StudentCourseProgress.student_profile_id == profile_id)
        .all()
    )
    progress_map = {p.course_id: p.status for p in progress_records}

    completed: List[str] = []
    ongoing: List[str] = []
    remaining: List[str] = []

    for m in mappings:
        status = progress_map.get(m.course_id)
        course = db.query(Course).filter(Course.id == m.course_id).first()
        if not course:
            continue
        label = course.course_code
        if status == ProgressStatus.COMPLETED:
            completed.append(label)
        elif status == ProgressStatus.IN_PROGRESS:
            ongoing.append(label)
        else:
            remaining.append(label)

    return {
        "completed_courses": completed,
        "ongoing_courses": ongoing,
        "remaining_courses": remaining,
    }


def calculate_skill_gaps(db: Session, user: User) -> Dict[str, Any]:
    """
    Main entry point for the skill gap engine.

    Returns a structured gap analysis for the student's selected career.
    Handles all edge cases: no career, no skills, no career requirements.
    """
    profile = get_or_create_profile(db, user)

    # ── Edge Case: no career selected ──────────────────────────────
    career_record: Optional[StudentCareerInterest] = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    if not career_record or career_record.is_still_exploring or not career_record.career_role_id:
        return {
            "status": "STILL_EXPLORING",
            "message": "Select a career role to see your skill gap analysis.",
            "career": None,
            "summary": None,
            "gaps": [],
        }

    role: Optional[CareerRole] = (
        db.query(CareerRole)
        .filter(CareerRole.id == career_record.career_role_id)
        .first()
    )
    if not role:
        return {
            "status": "STILL_EXPLORING",
            "message": "Career role not found.",
            "career": None,
            "summary": None,
            "gaps": [],
        }

    # ── Edge Case: career with no configured skill requirements ────
    required_skills: List[CareerRoleSkill] = (
        db.query(CareerRoleSkill)
        .filter(CareerRoleSkill.career_role_id == role.id)
        .all()
    )

    if not required_skills:
        return {
            "status": "NO_REQUIREMENTS",
            "message": f"No skill requirements configured for '{role.name}' yet.",
            "career": {"id": role.id, "name": role.name},
            "summary": {
                "target_skills": 0,
                "skills_met": 0,
                "skills_with_gaps": 0,
                "missing_skills": 0,
            },
            "gaps": [],
        }

    # ── Build student skill map ────────────────────────────────────
    student_skill_map: Dict[str, StudentSkill] = {
        ss.skill_id: ss
        for ss in db.query(StudentSkill)
        .filter(StudentSkill.student_profile_id == profile.id)
        .all()
    }

    # ── Calculate gaps for each required skill ────────────────────
    gaps = []
    skills_met = 0
    skills_with_gaps = 0
    missing_skills = 0

    for req in required_skills:
        skill: Optional[Skill] = db.query(Skill).filter(Skill.id == req.skill_id).first()
        if not skill:
            continue

        student_skill = student_skill_map.get(req.skill_id)
        academic_support = _get_academic_support(db, req.skill_id, profile.id)

        has_courses = len(academic_support["completed_courses"]) > 0
        if student_skill:
            if (
                student_skill.verification_status == VerificationStatus.VERIFIED
                and student_skill.verified_rating is not None
            ):
                effective_rating = student_skill.verified_rating
                evidence = "VERIFIED"
                evidence_factor = EVIDENCE_FACTOR_VERIFIED
                evidence_source = "VERIFIED_RATING_PLUS_COURSE" if has_courses else "VERIFIED_RATING"
            else:
                effective_rating = student_skill.self_rating
                evidence = "SELF_RATED"
                evidence_factor = EVIDENCE_FACTOR_SELF_RATED
                evidence_source = "SELF_RATING_PLUS_COURSE" if has_courses else "SELF_RATING"
        else:
            effective_rating = 0
            if has_courses:
                evidence = "ACADEMIC_EVIDENCE"
                evidence_factor = EVIDENCE_FACTOR_MISSING
                evidence_source = "COURSE_EVIDENCE"
            else:
                evidence = "MISSING"
                evidence_factor = EVIDENCE_FACTOR_MISSING
                evidence_source = "NONE"
            missing_skills += 1

        gap = max(0, req.minimum_rating - effective_rating)
        priority_score = req.importance * gap * evidence_factor

        if gap == 0:
            skills_met += 1
        else:
            skills_with_gaps += 1

        imp_level = _importance_level(req)
        status_str = _status_label(effective_rating, gap)

        gaps.append({
            "skill_id": skill.id,
            "id": skill.id,
            "skill": skill.name,
            "skill_category": skill.category,
            "required_rating": req.minimum_rating,
            "target_rating": req.minimum_rating,
            "required_level": req.minimum_rating,
            "current_rating": effective_rating if student_skill else None,
            "current_level": effective_rating if student_skill else 0,
            "self_rating": student_skill.self_rating if student_skill else None,
            "verified_rating": student_skill.verified_rating if student_skill else None,
            "gap": gap,
            "importance": req.importance,
            "importance_level": imp_level,
            "priority_score": round(priority_score, 2),
            "priority": _priority_label(priority_score),
            "status": status_str,
            "evidence": evidence,
            "evidence_source": evidence_source,
            "academic_support": academic_support,
        })

    # Sort by priority_score descending (highest priority first)
    gaps.sort(key=lambda g: g["priority_score"], reverse=True)

    for g in gaps:
        del g["priority_score"]

    return {
        "status": "ANALYSIS_COMPLETE",
        "career": {"id": role.id, "name": role.name},
        "summary": {
            "target_skills": len(required_skills),
            "skills_met": skills_met,
            "skills_with_gaps": skills_with_gaps,
            "missing_skills": missing_skills,
        },
        "gaps": gaps,
    }

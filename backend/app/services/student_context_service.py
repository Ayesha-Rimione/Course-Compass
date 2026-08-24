from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.courses import Course
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.models.skills import Skill, StudentSkill, SkillVerification, VerificationStatus, QuizStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.services.student_service import get_or_create_profile
from app.services import skill_gap_service, course_coverage_service


def get_student_context(db: Session, user: User) -> Dict[str, Any]:
    """
    Assemble a comprehensive, deterministic, database-backed context for the student.
    This is the contract between the backend and the AI Bhai integration.

    NEVER includes: OTP hashes, JWT tokens, passwords, secrets, or credentials.
    """
    profile = get_or_create_profile(db, user)

    # ── Student Profile ─────────────────────────────────────────────────────
    student_profile_data = {
        "id": profile.id,
        "email": user.email,
        "student_id": profile.student_id,
        "full_name": profile.full_name,
        "university": profile.university,
        "department": profile.department,
        "program": profile.program,
        "batch": profile.batch,
        "current_semester": profile.current_semester,
        "cgpa": profile.cgpa,
        "admission_session": profile.admission_session,
        "github_url": profile.github_url,
        "linkedin_url": profile.linkedin_url,
        "codeforces_url": profile.codeforces_url,
        "leetcode_url": profile.leetcode_url,
        "bio": profile.bio,
    }

    # ── Curriculum Summary ──────────────────────────────────────────────────
    all_courses = (
        db.query(Course)
        .filter(
            Course.department == profile.department,
            Course.program == profile.program
        )
        .all()
    )
    if not all_courses:
        all_courses = db.query(Course).all()

    progress_records = (
        db.query(StudentCourseProgress)
        .filter(StudentCourseProgress.student_profile_id == profile.id)
        .all()
    )
    progress_map = {p.course_id: p for p in progress_records}

    total = len(all_courses)
    completed = sum(
        1 for c in all_courses
        if progress_map.get(c.id) and progress_map[c.id].status == ProgressStatus.COMPLETED
    )
    in_progress = sum(
        1 for c in all_courses
        if progress_map.get(c.id) and progress_map[c.id].status == ProgressStatus.IN_PROGRESS
    )
    remaining = total - completed - in_progress

    curriculum_data = {
        "total_courses": total,
        "completed_courses": completed,
        "in_progress_courses": in_progress,
        "remaining_courses": remaining,
    }

    # ── Skills ─────────────────────────────────────────────────────────────
    student_skills = (
        db.query(StudentSkill)
        .filter(StudentSkill.student_profile_id == profile.id)
        .all()
    )

    self_rated: List[Dict[str, Any]] = []
    verified: List[Dict[str, Any]] = []
    unverified: List[Dict[str, Any]] = []

    for ss in student_skills:
        skill_entry = {
            "skill_id": ss.skill_id,
            "skill_name": ss.skill.name,
            "skill_category": ss.skill.category,
            "self_rating": ss.self_rating,
            "verification_status": ss.verification_status.value,
            "verified_rating": ss.verified_rating,
        }
        if ss.verification_status == VerificationStatus.VERIFIED:
            verified.append(skill_entry)
        elif ss.verification_status == VerificationStatus.NOT_VERIFIED:
            unverified.append(skill_entry)
        else:
            self_rated.append(skill_entry)

    skills_data = {
        "self_rated": self_rated,
        "verified": verified,
        "unverified": unverified,
    }

    # ── Career Interest ────────────────────────────────────────────────────
    career_record = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    if not career_record:
        career_data = {
            "status": "NOT_SET",
            "role": None,
        }
    elif career_record.is_still_exploring:
        career_data = {
            "status": "STILL_EXPLORING",
            "role": None,
        }
    else:
        career_data = {
            "status": "SELECTED",
            "role": career_record.career_role.name if career_record.career_role else None,
            "career_role_id": career_record.career_role_id,
        }

    # ── Verification Summary ───────────────────────────────────────────────
    all_verifications = (
        db.query(SkillVerification)
        .filter(SkillVerification.student_profile_id == profile.id)
        .all()
    )
    total_attempts = len(all_verifications)
    passed = sum(1 for v in all_verifications if v.status == QuizStatus.PASSED)

    verifications_data = {
        "total_attempts": total_attempts,
        "passed_verifications": passed,
    }

    # ── Academic Intelligence ──────────────────────────────────────────────
    gap_analysis = skill_gap_service.calculate_skill_gaps(db, user)
    coverage = course_coverage_service.get_course_coverage(db, user)

    # Top 5 CRITICAL/HIGH priority gaps for the context summary
    top_gaps = [
        {"skill": g["skill"], "priority": g["priority"]}
        for g in gap_analysis.get("gaps", [])
        if g["priority"] in ("CRITICAL", "HIGH")
    ][:5]

    # Academic coverage summary: skill → list of completed courses
    academic_coverage = {}
    for item in coverage.get("skills", []):
        completed = [c["course_code"] for c in item["covered_by"] if c["status"] == "COMPLETED"]
        if completed:
            academic_coverage[item["skill"]] = {"completed_courses": completed}

    academic_intelligence = {
        "target_role": gap_analysis.get("career", {}).get("name") if gap_analysis.get("career") else None,
        "gap_status": gap_analysis.get("status"),
        "top_gaps": top_gaps,
        "academic_coverage": academic_coverage,
    }

    return {
        "student_profile": student_profile_data,
        "curriculum": curriculum_data,
        "skills": skills_data,
        "career_interest": career_data,
        "verifications": verifications_data,
        "academic_intelligence": academic_intelligence,
    }

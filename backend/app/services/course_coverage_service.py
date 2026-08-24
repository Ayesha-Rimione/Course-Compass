"""
course_coverage_service.py

For each student skill or career-required skill, calculate which
courses teach that skill and how the student relates to those courses.

This allows AI Bhai to understand: did the student already take the
course that covers a missing skill, or is it still available?
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.skills import Skill, StudentSkill
from app.models.courses import Course
from app.models.students import StudentCourseProgress, ProgressStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.mappings import CourseSkillMapping, CareerRoleSkill
from app.services.student_service import get_or_create_profile


def get_course_coverage(db: Session, user: User) -> Dict[str, Any]:
    """
    Returns academic coverage of skills relevant to the student.

    Logic:
    1. If the student has a selected career → use career target skills
    2. Also include the student's self-rated skills
    3. For each skill, find courses that teach it, classify by progress

    Returns all unique skills from either career requirements or student skills.
    """
    profile = get_or_create_profile(db, user)

    # Build student progress map
    progress_records = (
        db.query(StudentCourseProgress)
        .filter(StudentCourseProgress.student_profile_id == profile.id)
        .all()
    )
    progress_map = {p.course_id: p.status for p in progress_records}

    # Collect skill IDs to analyze
    skill_ids_to_analyze = set()

    # From career selection
    career_record: Optional[StudentCareerInterest] = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )
    career_name: Optional[str] = None
    if career_record and not career_record.is_still_exploring and career_record.career_role_id:
        role = db.query(CareerRole).filter(CareerRole.id == career_record.career_role_id).first()
        if role:
            career_name = role.name
            required = (
                db.query(CareerRoleSkill)
                .filter(CareerRoleSkill.career_role_id == role.id)
                .all()
            )
            for req in required:
                skill_ids_to_analyze.add(req.skill_id)

    # From student's own skills
    student_skills = (
        db.query(StudentSkill)
        .filter(StudentSkill.student_profile_id == profile.id)
        .all()
    )
    for ss in student_skills:
        skill_ids_to_analyze.add(ss.skill_id)

    # Build coverage for each skill
    coverage_items = []
    for skill_id in skill_ids_to_analyze:
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        if not skill:
            continue

        # Find all courses that map to this skill
        mappings = (
            db.query(CourseSkillMapping)
            .filter(CourseSkillMapping.skill_id == skill_id)
            .order_by(CourseSkillMapping.relevance_weight.desc())
            .all()
        )

        covered_by = []
        for m in mappings:
            course = db.query(Course).filter(Course.id == m.course_id).first()
            if not course:
                continue
            status = progress_map.get(m.course_id)
            if status == ProgressStatus.COMPLETED:
                status_str = "COMPLETED"
            elif status == ProgressStatus.IN_PROGRESS:
                status_str = "IN_PROGRESS"
            else:
                status_str = "NOT_STARTED"

            covered_by.append({
                "course": course.course_code,
                "course_code": course.course_code,
                "course_name": course.course_name,
                "skill": skill.name,
                "relevance_weight": m.relevance_weight,
                "contribution_level": getattr(m, "contribution_level", "INTERMEDIATE") or "INTERMEDIATE",
                "status": status_str,
            })

        coverage_items.append({
            "skill_id": skill.id,
            "skill": skill.name,
            "skill_category": skill.category,
            "covered_by": covered_by,
        })

    # Sort by skill name
    coverage_items.sort(key=lambda x: x["skill"])

    return {
        "career": career_name,
        "skills": coverage_items,
    }

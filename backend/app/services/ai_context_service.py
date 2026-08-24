"""
ai_context_service.py

Clean AI-Ready Student Context Contract for CourseCompass AI Bhai.

CRITICAL SECURITY RULE:
This context must NEVER include:
- OTP codes or OTP hashes
- JWT tokens or refresh tokens
- Passwords or credentials
- Internal database secret keys

The output is sanitized, deterministic, and educational/career-focused.
"""
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.courses import Course
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.schemas.ai_context import (
    AIContextResponse,
    AIStudentInfo,
    AIAcademicContext,
    AISkillsContext,
    AICareerContext,
    AIReadinessContext,
    AIPlanningContext,
    AIRecommendationsContext,
)
from app.services.student_service import get_or_create_profile
from app.services import (
    skill_gap_service,
    readiness_service,
    planning_service,
    recommendations_service,
)


def get_ai_context(db: Session, user: User) -> AIContextResponse:
    """
    Assemble complete deterministic intelligence for the future AI Bhai assistant.
    Strictly sanitized and security-hardened.
    """
    profile = get_or_create_profile(db, user)

    # 1. Student Profile Context (Safe Fields Only)
    student_info = AIStudentInfo(
        id=profile.id,
        email=user.email,
        student_id=profile.student_id,
        full_name=profile.full_name,
        university=profile.university,
        department=profile.department,
        program=profile.program,
        batch=profile.batch,
        current_semester=profile.current_semester,
        cgpa=profile.cgpa,
        admission_session=profile.admission_session,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        codeforces_url=profile.codeforces_url,
        leetcode_url=profile.leetcode_url,
        bio=profile.bio,
    )

    # 2. Academic Context
    all_courses = (
        db.query(Course)
        .filter(Course.department == profile.department, Course.program == profile.program)
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

    completed_courses = []
    ongoing_courses = []
    remaining_courses = []
    completed_credits = 0.0
    total_credits = sum(c.credit_hours for c in all_courses)

    for c in all_courses:
        p = progress_map.get(c.id)
        course_obj = {
            "code": c.course_code,
            "title": c.course_name,
            "credits": c.credit_hours,
            "semester": c.semester,
            "status": p.status.value if p else "NOT_STARTED",
            "grade": p.grade if p else None,
            "self_rating": p.self_rating if p else None,
        }
        if p and p.status == ProgressStatus.COMPLETED:
            completed_courses.append(course_obj)
            completed_credits += c.credit_hours
        elif p and p.status == ProgressStatus.IN_PROGRESS:
            ongoing_courses.append(course_obj)
        else:
            remaining_courses.append(course_obj)

    academic_ctx = AIAcademicContext(
        current_semester=profile.current_semester,
        cgpa=profile.cgpa,
        total_courses=len(all_courses),
        completed_courses=completed_courses,
        ongoing_courses=ongoing_courses,
        remaining_courses=remaining_courses,
        completed_credits=round(completed_credits, 1),
        total_credits=round(total_credits, 1),
    )

    # 3. Skills Context
    student_skills = (
        db.query(StudentSkill)
        .filter(StudentSkill.student_profile_id == profile.id)
        .all()
    )

    self_rated_list = []
    verified_list = []
    for ss in student_skills:
        skill_dict = {
            "skill_id": ss.skill_id,
            "skill_name": ss.skill.name if ss.skill else "",
            "category": ss.skill.category if ss.skill else "Other",
            "self_rating": ss.self_rating,
            "verified_rating": ss.verified_rating,
            "verification_status": ss.verification_status.value,
        }
        self_rated_list.append(skill_dict)
        if ss.verification_status == VerificationStatus.VERIFIED:
            verified_list.append(skill_dict)

    gap_data = skill_gap_service.calculate_skill_gaps(db, user)
    gaps_list = gap_data.get("gaps", [])

    skills_ctx = AISkillsContext(
        self_rated=self_rated_list,
        verified=verified_list,
        gaps=gaps_list,
    )

    # 4. Career Context
    career_record = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    if not career_record:
        career_ctx = AICareerContext(status="NOT_SET", target_role=None, career_role_id=None, category=None)
    elif career_record.is_still_exploring or not career_record.career_role_id:
        career_ctx = AICareerContext(status="STILL_EXPLORING", target_role=None, career_role_id=None, category=None)
    else:
        role = career_record.career_role
        career_ctx = AICareerContext(
            status="SELECTED",
            target_role=role.name if role else None,
            career_role_id=career_record.career_role_id,
            category=role.category if role else None,
        )

    # 5. Readiness Context
    roadmap_resp = readiness_service.calculate_readiness_roadmap(db, user)
    readiness_ctx = AIReadinessContext(
        score=roadmap_resp.overall_readiness_percentage,
        current_level=roadmap_resp.current_level,
        strongest_skills=roadmap_resp.strongest_skills,
        weakest_skills=roadmap_resp.weakest_skills,
        critical_gaps=roadmap_resp.critical_gaps,
        next_priority=roadmap_resp.next_priority,
    )

    # 6. Planning Context
    planning_resp = planning_service.generate_planning_recommendations(db, user)
    planning_ctx = AIPlanningContext(
        weekly=[p.model_dump() for p in planning_resp.weekly],
        monthly=[p.model_dump() for p in planning_resp.monthly],
        semester=[p.model_dump() for p in planning_resp.semester],
    )

    # 7. Recommendations Context
    student_res = recommendations_service.get_student_resources(db, user)
    student_projs = recommendations_service.get_student_projects(db, user)
    student_certs = recommendations_service.get_student_certifications(db, user)
    student_jobs = recommendations_service.get_student_jobs(db, user)

    recs_ctx = AIRecommendationsContext(
        resources=[r.model_dump() for r in student_res[:6]],
        projects=[p.model_dump() for p in student_projs[:6]],
        certifications=[c.model_dump() for c in student_certs[:6]],
        sample_jobs=[j.model_dump() for j in student_jobs[:6]],
    )

    return AIContextResponse(
        student=student_info,
        academic=academic_ctx,
        skills=skills_ctx,
        career=career_ctx,
        readiness=readiness_ctx,
        planning=planning_ctx,
        recommendations=recs_ctx,
    )

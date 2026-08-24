"""
planning_service.py

Deterministic Academic & Career Planning Engine for CourseCompass.

Generates 3 planning horizons:
- Weekly: Immediate actionable tasks (gap practice, verification quiz, current coursework)
- Monthly: Project milestones, module completion, certification prep
- Semester: Strategic academic registration, internship readiness, capstone roadmap

Every recommendation strictly explains WHY it exists based on database evidence.
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.courses import Course
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.mappings import CareerRoleSkill, CourseSkillMapping
from app.schemas.planning import PlanningResponse, PlanningRecommendationItem
from app.services.student_service import get_or_create_profile
from app.services import skill_gap_service


def generate_planning_recommendations(db: Session, user: User) -> PlanningResponse:
    """
    Generate deterministic weekly, monthly, and semester planning recommendations.
    """
    profile = get_or_create_profile(db, user)
    sem = profile.current_semester or 1

    # 1. Fetch Career Selection
    career_record = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    if not career_record or career_record.is_still_exploring or not career_record.career_role_id:
        target_role_name = "Exploring Career Tracks"
        weekly = [
            PlanningRecommendationItem(
                id="plan-w-explore-1",
                title="Explore Core Computer Science Specializations",
                description="Review roles in Software Engineering, Data Science, AI/ML, and Cybersecurity to set a target trajectory.",
                category="CAREER",
                priority="HIGH",
                related_skill="Career Planning",
                related_course=None,
                estimated_effort="2 hrs/week",
                reason="You have not selected a target career role yet. Selecting a target role unlocks customized gap analysis and planning.",
                completed=False
            ),
            PlanningRecommendationItem(
                id="plan-w-explore-2",
                title="Audit Foundation Programming Skills",
                description="Self-rate your current proficiency in Python, C++, and SQL in the Skills tab.",
                category="SKILL",
                priority="MEDIUM",
                related_skill="Programming Fundamentals",
                related_course="CSC 101",
                estimated_effort="1 hr/week",
                reason="Self-rating your baseline skills establishes your starting competency radar.",
                completed=False
            )
        ]
        monthly = [
            PlanningRecommendationItem(
                id="plan-m-explore-1",
                title="Review IUBAT CSE Semester 1-4 Prerequisite Chain",
                description="Ensure you are on track with calculus, algorithms, and data structure prerequisites.",
                category="ACADEMIC",
                priority="HIGH",
                related_skill=None,
                related_course="CSC 201",
                estimated_effort="4 hrs/month",
                reason="Academic progression in early semesters forms the foundation for all specialized careers.",
                completed=False
            )
        ]
        semester = [
            PlanningRecommendationItem(
                id="plan-s-explore-1",
                title="Select a Target Career Track for Next Semester",
                description="Finalize your specialization interest before enrolling in 300/400 level electives.",
                category="CAREER",
                priority="HIGH",
                related_skill=None,
                related_course=None,
                estimated_effort="10 hrs/semester",
                reason="Elective course selection in higher semesters is most effective when aligned with a specific career role.",
                completed=False
            )
        ]
        return PlanningResponse(
            target_role=target_role_name,
            current_semester=sem,
            weekly=weekly,
            monthly=monthly,
            semester=semester
        )

    role = db.query(CareerRole).filter(CareerRole.id == career_record.career_role_id).first()
    target_role_name = role.name if role else "Selected Career Role"

    # 2. Analyze Gaps
    gap_data = skill_gap_service.calculate_skill_gaps(db, user)
    gaps: List[Dict[str, Any]] = gap_data.get("gaps", [])

    weekly: List[PlanningRecommendationItem] = []
    monthly: List[PlanningRecommendationItem] = []
    semester: List[PlanningRecommendationItem] = []

    # 3. Weekly Items: Critical Gaps & Verification Quizzes
    unverified_skills = (
        db.query(StudentSkill)
        .filter(
            StudentSkill.student_profile_id == profile.id,
            StudentSkill.verification_status != VerificationStatus.VERIFIED
        )
        .all()
    )

    if unverified_skills:
        uv_skill = unverified_skills[0]
        skill_name = uv_skill.skill.name if uv_skill.skill else "Core Skill"
        weekly.append(PlanningRecommendationItem(
            id=f"plan-w-verify-{uv_skill.skill_id[:8]}",
            title=f"Take Skill Verification Quiz for {skill_name}",
            description=f"Validate your self-rated score of {uv_skill.self_rating}/5 by attempting the 10-question MCQ assessment.",
            category="SKILL",
            priority="HIGH",
            related_skill=skill_name,
            related_course=None,
            estimated_effort="30 mins",
            reason=f"Your self-rating for {skill_name} is {uv_skill.self_rating}, but unverified skills carry lower confidence in your readiness score.",
            completed=False
        ))

    # Add top critical gaps to weekly plan
    for g in gaps:
        if g.get("priority") in ("CRITICAL", "HIGH") and len(weekly) < 3:
            s_name = g.get("skill", "Skill")
            c_lvl = g.get("current_rating", 0)
            r_lvl = g.get("required_rating", 3)
            weekly.append(PlanningRecommendationItem(
                id=f"plan-w-gap-{g.get('skill_id', 'id')[:8]}",
                title=f"Practice {s_name} Coding Exercises",
                description=f"Dedicate 4 hours this week to resolve the gap in {s_name} (Current: {c_lvl}/5, Required: {r_lvl}/5).",
                category="SKILL",
                priority="HIGH",
                related_skill=s_name,
                related_course=g.get("academic_support", {}).get("completed_courses", [None])[0] if g.get("academic_support", {}).get("completed_courses") else None,
                estimated_effort="4-5 hrs/week",
                reason=f"{target_role_name} requires {s_name} at Level {r_lvl}. Your current rating is {c_lvl} (Gap: {g.get('gap')}).",
                completed=False
            ))

    # If weekly is still light, add course revision task
    if len(weekly) < 2:
        weekly.append(PlanningRecommendationItem(
            id="plan-w-general",
            title=f"Align Ongoing Coursework with {target_role_name}",
            description="Connect lecture topics in your ongoing semester courses with practical real-world industry patterns.",
            category="ACADEMIC",
            priority="MEDIUM",
            related_skill=None,
            related_course=None,
            estimated_effort="3 hrs/week",
            reason=f"Maximizing coursework retention supports your long-term {target_role_name} career roadmap.",
            completed=False
        ))

    # 4. Monthly Items: Practical Projects & Milestones
    top_gap_name = gaps[0].get("skill") if gaps else "Core Technology"
    monthly.append(PlanningRecommendationItem(
        id="plan-m-proj-1",
        title=f"Build a {target_role_name} Portfolio Project",
        description=f"Develop and deploy a complete project showcasing your capability in {top_gap_name}.",
        category="PROJECT",
        priority="HIGH",
        related_skill=top_gap_name,
        related_course=None,
        estimated_effort="15-20 hrs/month",
        reason=f"Portfolio projects provide proof of mastery for {target_role_name} recruiters beyond academic transcripts.",
        completed=False
    ))

    monthly.append(PlanningRecommendationItem(
        id="plan-m-cert-1",
        title="Complete Recommended Learning Module",
        description=f"Follow official documentation and tutorials for your weakest skill: {gaps[0].get('skill') if gaps else 'System Design'}.",
        category="CERTIFICATION",
        priority="MEDIUM",
        related_skill=gaps[0].get("skill") if gaps else None,
        related_course=None,
        estimated_effort="10 hrs/month",
        reason=f"Structured online learning directly reduces your highest priority skill gap.",
        completed=False
    ))

    # 5. Semester Items: Academic Strategy & Career Prep
    semester.append(PlanningRecommendationItem(
        id="plan-s-acad-1",
        title=f"Complete Semester {sem} Curriculum Courses with Grade >= B+",
        description="Maintain strong academic performance in core computer science courses to preserve your CGPA.",
        category="ACADEMIC",
        priority="HIGH",
        related_skill=None,
        related_course=None,
        estimated_effort="Full Semester",
        reason=f"Current CGPA is {profile.cgpa or 'in evaluation'}. A strong academic record satisfies campus placement and graduate study criteria.",
        completed=False
    ))

    semester.append(PlanningRecommendationItem(
        id="plan-s-intern-1",
        title=f"Prepare Resume & GitHub Portfolio for {target_role_name}",
        description="Format technical projects, code repositories, and verified skill badges for internship applications.",
        category="CAREER",
        priority="HIGH" if (sem >= 6) else "MEDIUM",
        related_skill=None,
        related_course=None,
        estimated_effort="20 hrs/semester",
        reason=f"Students in Semester {sem} should prepare verified artifacts to qualify for upcoming {target_role_name} industry internships.",
        completed=False
    ))

    return PlanningResponse(
        target_role=target_role_name,
        current_semester=sem,
        weekly=weekly,
        monthly=monthly,
        semester=semester
    )

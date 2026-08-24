"""
readiness_service.py

Deterministic Roadmap & Readiness calculation service for CourseCompass.

WEIGHTED READINESS FORMULA:
    Readiness = Skill Component (max 90%) + Academic Curriculum Component (max 10%)

Where:
    1. Skill Component:
       For each skill required by the selected CareerRole:
           skill_score = min(1.0, effective_rating / required_rating)
           confidence_factor = 1.0 (VERIFIED) or 0.9 (SELF_RATED) or 0.0 (MISSING)
           weight = 3.0 (CORE), 2.0 (IMPORTANT), 1.0 (NICE_TO_HAVE)

       skill_percentage = (sum(skill_score * confidence_factor * weight) / sum(weight * 1.0)) * 90.0

    2. Academic Support Component:
       completed_mapped_courses = courses completed by student that map to required skills
       total_mapped_courses = all courses that map to required skills
       academic_percentage = (completed_mapped_courses / total_mapped_courses) * 10.0 (if total > 0)

    Overall Readiness Score = min(100, round(skill_percentage + academic_percentage))

This guarantees an explainable, deterministic readiness percentage rooted in database evidence.
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.courses import Course
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.mappings import CareerRoleSkill, CourseSkillMapping
from app.schemas.roadmap import RoadmapResponse, SkillGapItem, RadarAxisItem, SemesterGuidanceItem, AcademicProgressSummary
from app.services.student_service import get_or_create_profile
from app.services import skill_gap_service


def calculate_readiness_roadmap(db: Session, user: User) -> RoadmapResponse:
    """
    Calculate and return the full deterministic roadmap for the authenticated student.
    """
    profile = get_or_create_profile(db, user)

    # 1. Fetch Curriculum Progress
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

    completed_courses_count = sum(
        1 for c in all_courses
        if progress_map.get(c.id) and progress_map[c.id].status == ProgressStatus.COMPLETED
    )
    in_progress_courses_count = sum(
        1 for c in all_courses
        if progress_map.get(c.id) and progress_map[c.id].status == ProgressStatus.IN_PROGRESS
    )
    total_courses_count = len(all_courses)
    remaining_courses_count = max(0, total_courses_count - completed_courses_count - in_progress_courses_count)

    total_credits = sum(c.credit_hours for c in all_courses)
    completed_credits = sum(
        c.credit_hours for c in all_courses
        if progress_map.get(c.id) and progress_map[c.id].status == ProgressStatus.COMPLETED
    )

    academic_summary = AcademicProgressSummary(
        completed_courses=completed_courses_count,
        in_progress_courses=in_progress_courses_count,
        remaining_courses=remaining_courses_count,
        total_courses=total_courses_count,
        completed_credits=round(completed_credits, 1),
        total_credits=round(total_credits, 1),
    )

    # 2. Check Career Selection
    career_record = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    if not career_record or career_record.is_still_exploring or not career_record.career_role_id:
        # Default / Still Exploring Response
        return RoadmapResponse(
            status="EXPLORING",
            target_role="Career Path Exploring",
            overall_readiness_percentage=0,
            percent=0,
            current_level="Exploring",
            summary="You are currently exploring career paths. Select a target role to view your readiness percentage and competency roadmap.",
            strongest_skills=[],
            weakest_skills=[],
            critical_gaps=[],
            academic_progress=academic_summary,
            next_priority="Select a target career role in your Profile or Onboarding.",
            gaps=[],
            radar=[],
            semester_guidance=[
                SemesterGuidanceItem(
                    semester=profile.current_semester or 1,
                    title="Foundation & Discovery",
                    recommendations=[
                        "Explore different software engineering tracks (Frontend, Backend, AI/ML, DevOps)",
                        "Complete foundational programming courses in C, C++, and Data Structures",
                        "Begin self-rating your comfort levels in core languages"
                    ]
                )
            ],
            formula_explanation="Select a career role to compute weighted readiness based on CORE/IMPORTANT skills and academic course evidence."
        )

    role = db.query(CareerRole).filter(CareerRole.id == career_record.career_role_id).first()
    if not role:
        role_name = "Selected Role"
    else:
        role_name = role.name

    # 3. Calculate Skill Gaps
    gap_result = skill_gap_service.calculate_skill_gaps(db, user)
    gaps_list = gap_result.get("gaps", [])

    if not gaps_list:
        return RoadmapResponse(
            target_role=role_name,
            overall_readiness_percentage=0,
            percent=0,
            current_level="Novice",
            summary=f"No skill requirements configured for '{role_name}' yet.",
            strongest_skills=[],
            weakest_skills=[],
            critical_gaps=[],
            academic_progress=academic_summary,
            next_priority="Configure skill requirements for this role.",
            gaps=[],
            radar=[],
            semester_guidance=[],
            formula_explanation="Readiness calculation requires configured career skills."
        )

    # 4. Deterministic Weighted Readiness Calculation
    weighted_score_sum = 0.0
    weight_total = 0.0

    radar_groups: Dict[str, Dict[str, float]] = {}
    strongest_skills = []
    weakest_skills = []
    critical_gaps = []

    total_mapped_courses = 0
    completed_mapped_courses = 0

    pydantic_gaps: List[SkillGapItem] = []

    for g in gaps_list:
        importance_level = g.get("importance_level", "IMPORTANT")
        if importance_level == "CORE":
            weight = 3.0
        elif importance_level == "IMPORTANT":
            weight = 2.0
        else:
            weight = 1.0

        current_rating = g.get("current_rating", 0) or 0
        required_rating = g.get("required_rating", 3) or 3
        evidence = g.get("evidence", "MISSING")

        # Confidence factor based on verified vs self-rated evidence
        if evidence == "VERIFIED":
            confidence = 1.0
        elif evidence == "SELF_RATED":
            confidence = 0.90
        elif evidence == "ACADEMIC_EVIDENCE":
            confidence = 0.50
        else:
            confidence = 0.0

        skill_ratio = min(1.0, current_rating / required_rating) if required_rating > 0 else 1.0
        weighted_score_sum += (skill_ratio * confidence * weight)
        weight_total += weight

        # Track category radar stats
        category = g.get("skill_category") or "General"
        if category not in radar_groups:
            radar_groups[category] = {"current_sum": 0.0, "required_sum": 0.0, "count": 0}
        radar_groups[category]["current_sum"] += current_rating
        radar_groups[category]["required_sum"] += required_rating
        radar_groups[category]["count"] += 1

        # Strongest / Weakest / Critical tracking
        if g.get("gap", 0) == 0:
            strongest_skills.append(g.get("skill"))
        elif g.get("priority") in ("CRITICAL", "HIGH"):
            critical_gaps.append(g.get("skill"))
            weakest_skills.append(g.get("skill"))
        else:
            weakest_skills.append(g.get("skill"))

        # Academic support count
        acad = g.get("academic_support", {})
        comp = len(acad.get("completed_courses", []))
        total_c = comp + len(acad.get("ongoing_courses", [])) + len(acad.get("remaining_courses", []))
        completed_mapped_courses += comp
        total_mapped_courses += total_c

        pydantic_gaps.append(SkillGapItem(
            id=g.get("skill_id", ""),
            skill=g.get("skill", ""),
            skill_category=g.get("skill_category"),
            currentLevel=current_rating,
            requiredLevel=required_rating,
            gap=g.get("gap", 0),
            importance=g.get("importance", 3),
            importance_level=importance_level,
            priority=g.get("priority", "MEDIUM"),
            status=g.get("status", "DEVELOPING"),
            evidence_source=evidence,
            academic_support=acad
        ))

    # Skill component (max 90%)
    skill_percentage = (weighted_score_sum / weight_total) * 90.0 if weight_total > 0 else 0.0

    # Academic curriculum boost (max 10%)
    if total_mapped_courses > 0:
        academic_boost = (completed_mapped_courses / total_mapped_courses) * 10.0
    else:
        academic_boost = 0.0

    overall_readiness = min(100, max(0, round(skill_percentage + academic_boost)))

    # Level classification
    if overall_readiness >= 85:
        level_str = "Job-Ready"
    elif overall_readiness >= 65:
        level_str = "Proficient"
    elif overall_readiness >= 40:
        level_str = "Developing"
    else:
        level_str = "Novice"

    # Radar construction
    radar_axes: List[RadarAxisItem] = []
    for cat, stats in radar_groups.items():
        count = stats["count"]
        radar_axes.append(RadarAxisItem(
            axis=cat,
            current=round(stats["current_sum"] / count, 1) if count > 0 else 0,
            required=round(stats["required_sum"] / count, 1) if count > 0 else 0
        ))

    # Next priority action determination
    if critical_gaps:
        next_priority = f"Close critical gap in {critical_gaps[0]} through coursework or project practice."
    elif weakest_skills:
        next_priority = f"Improve proficiency in {weakest_skills[0]} to target rating level."
    elif completed_courses_count < total_courses_count:
        next_priority = "Continue university curriculum milestones and build capstone projects."
    else:
        next_priority = "Take skill verification quizzes to validate full job-readiness."

    # Semester Guidance Generation
    sem = profile.current_semester or 1
    guidance: List[SemesterGuidanceItem] = [
        SemesterGuidanceItem(
            semester=sem,
            title=f"Semester {sem} Focus: Core Competencies & Gaps",
            recommendations=[
                f"Prioritize coursework that addresses your top gaps: {', '.join(critical_gaps[:2]) if critical_gaps else 'Foundation skills'}",
                f"Target at least one practical project aligned with {role_name}",
                "Take verification quizzes for your self-rated skills to boost confidence score"
            ]
        ),
        SemesterGuidanceItem(
            semester=min(12, sem + 1),
            title=f"Semester {min(12, sem + 1)} Outlook: Project & Certification Milestone",
            recommendations=[
                f"Build a portfolio project demonstrating {role_name} skills",
                "Review remaining curriculum prerequisites for advanced electives",
                "Begin exploring internship requirements in the job market tab"
            ]
        )
    ]

    summary = (
        f"You are currently {overall_readiness}% ready for a {role_name} role ({level_str}). "
        f"{len(strongest_skills)} requirements met, with {len(critical_gaps)} high-priority gaps remaining."
    )

    formula_exp = (
        "Readiness Score Formula: 90% weighted skill evidence (CORE weight=3, IMPORTANT weight=2, NICE_TO_HAVE weight=1; "
        "Verified=1.0x confidence, Self-rated=0.9x confidence) + 10% curriculum course alignment."
    )

    return RoadmapResponse(
        target_role=role_name,
        overall_readiness_percentage=overall_readiness,
        percent=overall_readiness,
        current_level=level_str,
        summary=summary,
        strongest_skills=strongest_skills[:5],
        weakest_skills=weakest_skills[:5],
        critical_gaps=critical_gaps[:5],
        academic_progress=academic_summary,
        next_priority=next_priority,
        gaps=pydantic_gaps,
        radar=radar_axes,
        semester_guidance=guidance,
        formula_explanation=formula_exp
    )

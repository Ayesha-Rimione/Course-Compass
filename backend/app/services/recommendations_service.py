"""
recommendations_service.py

Database-backed recommendation engine for:
- Learning Resources (with verified real-world URLs)
- Recommended Portfolio Projects
- Industry Certifications
- Job Market Intelligence (clearly labeled sample dataset)

All personalized endpoints prioritize results based on the student's
selected CareerRole and identified Skill Gaps.
"""
import json
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.recommendations import LearningResource, ProjectRecommendation, Certification, JobListing
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.skills import Skill
from app.schemas.recommendations import (
    LearningResourceResponse,
    ProjectRecommendationResponse,
    CertificationResponse,
    JobListingResponse,
)
from app.services.student_service import get_or_create_profile
from app.services import skill_gap_service


# ── Helper JSON / Text parser ──────────────────────────────────────────
def _parse_list(val: Optional[str]) -> List[str]:
    if not val:
        return []
    try:
        data = json.loads(val)
        if isinstance(data, list):
            return [str(x) for x in data]
    except Exception:
        pass
    return [x.strip() for x in val.split(",") if x.strip()]


# ── 1. Learning Resources ──────────────────────────────────────────────
def list_resources(
    db: Session,
    skill_id: Optional[str] = None,
    resource_type: Optional[str] = None,
    difficulty: Optional[str] = None
) -> List[LearningResourceResponse]:
    """List all learning resources with optional filtering."""
    query = db.query(LearningResource)
    if skill_id:
        query = query.filter(LearningResource.skill_id == skill_id)
    if resource_type:
        query = query.filter(LearningResource.resource_type == resource_type)
    if difficulty:
        query = query.filter(LearningResource.difficulty == difficulty)

    records = query.order_by(LearningResource.title.asc()).all()
    results = []
    for r in records:
        results.append(
            LearningResourceResponse(
                id=r.id,
                title=r.title,
                provider=r.provider,
                url=r.url,
                resource_type=r.resource_type,
                difficulty=r.difficulty,
                estimated_hours=r.estimated_hours,
                is_free=r.is_free,
                price=r.price,
                category=r.category,
                skill_id=r.skill_id,
                skill_name=r.skill.name if r.skill else None,
                career_role_id=r.career_role_id,
                created_at=r.created_at
            )
        )
    return results


def get_student_resources(db: Session, user: User) -> List[LearningResourceResponse]:
    """Return learning resources prioritized by the student's skill gaps."""
    gap_result = skill_gap_service.calculate_skill_gaps(db, user)
    gap_skills = [g["skill_id"] for g in gap_result.get("gaps", []) if g.get("gap", 0) > 0]

    all_resources = list_resources(db)
    if not gap_skills:
        return all_resources

    # Prioritize resources matching gap skills
    gap_set = set(gap_skills)
    priority_res = [r for r in all_resources if r.skill_id in gap_set]
    other_res = [r for r in all_resources if r.skill_id not in gap_set]
    return priority_res + other_res


# ── 2. Project Recommendations ─────────────────────────────────────────
def list_projects(
    db: Session,
    career_role_id: Optional[str] = None,
    difficulty: Optional[str] = None
) -> List[ProjectRecommendationResponse]:
    """List all project recommendations."""
    query = db.query(ProjectRecommendation)
    if career_role_id:
        query = query.filter(ProjectRecommendation.career_role_id == career_role_id)
    if difficulty:
        query = query.filter(ProjectRecommendation.difficulty == difficulty)

    records = query.order_by(ProjectRecommendation.title.asc()).all()
    results = []
    for p in records:
        results.append(
            ProjectRecommendationResponse(
                id=p.id,
                title=p.title,
                description=p.description,
                difficulty=p.difficulty,
                estimated_hours=p.estimated_hours,
                project_type=p.project_type,
                skills_demonstrated=_parse_list(p.skills_demonstrated),
                technologies=_parse_list(p.technologies),
                recommended_for_gap_level=p.recommended_for_gap_level,
                is_team=p.is_team,
                career_role_id=p.career_role_id,
                github_starter_url=p.github_starter_url,
                live_demo_url=p.live_demo_url,
                created_at=p.created_at
            )
        )
    return results


def get_student_projects(db: Session, user: User) -> List[ProjectRecommendationResponse]:
    """Return projects tailored to student's selected career role and gaps."""
    profile = get_or_create_profile(db, user)
    career_rec = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    role_id = career_rec.career_role_id if (career_rec and not career_rec.is_still_exploring) else None
    all_projects = list_projects(db)

    if not role_id:
        return all_projects

    role_projects = [p for p in all_projects if p.career_role_id == role_id]
    other_projects = [p for p in all_projects if p.career_role_id != role_id]
    return role_projects + other_projects


# ── 3. Certifications ──────────────────────────────────────────────────
def list_certifications(
    db: Session,
    career_role_id: Optional[str] = None,
    difficulty: Optional[str] = None
) -> List[CertificationResponse]:
    """List all industry certifications."""
    query = db.query(Certification)
    if career_role_id:
        query = query.filter(Certification.career_role_id == career_role_id)
    if difficulty:
        query = query.filter(Certification.difficulty == difficulty)

    records = query.order_by(Certification.name.asc()).all()
    results = []
    for c in records:
        results.append(
            CertificationResponse(
                id=c.id,
                name=c.name,
                provider=c.provider,
                description=c.description,
                url=c.url,
                estimated_hours=c.estimated_hours,
                difficulty=c.difficulty,
                skills_learned=_parse_list(c.skills_learned),
                career_role_id=c.career_role_id,
                created_at=c.created_at
            )
        )
    return results


def get_student_certifications(db: Session, user: User) -> List[CertificationResponse]:
    """Return certifications prioritizing student's target career role."""
    profile = get_or_create_profile(db, user)
    career_rec = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    role_id = career_rec.career_role_id if (career_rec and not career_rec.is_still_exploring) else None
    all_certs = list_certifications(db)

    if not role_id:
        return all_certs

    role_certs = [c for c in all_certs if c.career_role_id == role_id]
    other_certs = [c for c in all_certs if c.career_role_id != role_id]
    return role_certs + other_certs


# ── 4. Job Listings ────────────────────────────────────────────────────
def list_jobs(
    db: Session,
    career_role_id: Optional[str] = None,
    experience_level: Optional[str] = None
) -> List[JobListingResponse]:
    """List all sample job listings."""
    query = db.query(JobListing)
    if career_role_id:
        query = query.filter(JobListing.career_role_id == career_role_id)
    if experience_level:
        query = query.filter(JobListing.experience_level == experience_level)

    records = query.order_by(JobListing.role.asc()).all()
    results = []
    for j in records:
        results.append(
            JobListingResponse(
                id=j.id,
                role=j.role,
                company_name=j.company_name,
                location=j.location,
                employment_type=j.employment_type,
                experience_level=j.experience_level,
                salary_min=j.salary_min,
                salary_max=j.salary_max,
                currency=j.currency,
                salary_formatted=j.salary_formatted,
                required_skills=_parse_list(j.required_skills),
                source_url=j.source_url,
                posted_at=j.posted_at,
                is_sample=j.is_sample,
                career_role_id=j.career_role_id,
                created_at=j.created_at
            )
        )
    return results


def get_student_jobs(db: Session, user: User) -> List[JobListingResponse]:
    """Return job listings matching student's selected career role."""
    profile = get_or_create_profile(db, user)
    career_rec = (
        db.query(StudentCareerInterest)
        .filter(StudentCareerInterest.student_profile_id == profile.id)
        .first()
    )

    role_id = career_rec.career_role_id if (career_rec and not career_rec.is_still_exploring) else None
    all_jobs = list_jobs(db)

    if not role_id:
        return all_jobs

    role_jobs = [j for j in all_jobs if j.career_role_id == role_id]
    other_jobs = [j for j in all_jobs if j.career_role_id != role_id]
    return role_jobs + other_jobs

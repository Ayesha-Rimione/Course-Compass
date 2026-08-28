from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.users import User, UserRole
from app.models.students import StudentProfile, StudentCourseProgress
from app.models.courses import Course, CourseTopic, CourseOutcome
from app.models.portfolio import StudentProject, StudentCertification
from app.utils.security import get_current_admin_user

router = APIRouter(prefix="/admin", tags=["CSE Department Admin"])


# Schemas
class CourseCreateRequest(BaseModel):
    course_code: str = Field(..., example="CSE 489")
    course_name: str = Field(..., example="Cloud Native Computing")
    credit_hours: float = Field(3.0, ge=1.0, le=6.0)
    semester: int = Field(8, ge=1, le=12)
    description: Optional[str] = ""
    department: str = "Department of Computer Science & Engineering"
    program: str = "B.Sc. in Computer Science & Engineering"


class CourseUpdateRequest(BaseModel):
    course_name: Optional[str] = None
    credit_hours: Optional[float] = None
    semester: Optional[int] = None
    description: Optional[str] = None


class TopicItem(BaseModel):
    topic_name: str


class OutcomeItem(BaseModel):
    outcome_code: str
    description: str


# ── 1. DEPARTMENT ANALYTICS OVERVIEW ─────────────────────────────────────────
@router.get("/analytics", status_code=status.HTTP_200_OK)
def get_department_analytics(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    total_students = db.query(StudentProfile).count()
    avg_cgpa_row = db.query(func.avg(StudentProfile.cgpa)).filter(StudentProfile.cgpa > 0).first()
    avg_cgpa = round(float(avg_cgpa_row[0]), 2) if avg_cgpa_row and avg_cgpa_row[0] else 0.0

    total_courses = db.query(Course).count()
    total_topics = db.query(CourseTopic).count()
    total_outcomes = db.query(CourseOutcome).count()

    # Semester distribution
    sem_counts = (
        db.query(StudentProfile.current_semester, func.count(StudentProfile.id))
        .group_by(StudentProfile.current_semester)
        .all()
    )
    semester_distribution = {f"Semester {sem or 1}": count for sem, count in sem_counts}

    # Top completed courses
    completed_counts = (
        db.query(StudentCourseProgress.course_id, func.count(StudentCourseProgress.id))
        .filter(StudentCourseProgress.status == "COMPLETED")
        .group_by(StudentCourseProgress.course_id)
        .order_by(func.count(StudentCourseProgress.id).desc())
        .limit(5)
        .all()
    )

    top_courses = []
    for cid, cnt in completed_counts:
        c = db.query(Course).filter(Course.id == cid).first()
        if c:
            top_courses.append({"code": c.course_code, "name": c.course_name, "completions": cnt})

    return {
        "total_students": total_students,
        "average_cgpa": avg_cgpa,
        "total_courses": total_courses,
        "total_topics": total_topics,
        "total_course_outcomes": total_outcomes,
        "semester_distribution": semester_distribution,
        "top_completed_courses": top_courses
    }


# ── 2. STUDENT COHORT TRACKER ────────────────────────────────────────────────
@router.get("/students", status_code=status.HTTP_200_OK)
def list_students(
    semester: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    query = db.query(StudentProfile)
    if semester:
        query = query.filter(StudentProfile.current_semester == semester)
    if search:
        s = f"%{search}%"
        query = query.filter((StudentProfile.full_name.ilike(s)) | (StudentProfile.student_id.ilike(s)))

    profiles = query.order_by(StudentProfile.current_semester.desc(), StudentProfile.full_name.asc()).all()

    results = []
    for p in profiles:
        u = db.query(User).filter(User.id == p.user_id).first()
        completed_count = db.query(StudentCourseProgress).filter(
            StudentCourseProgress.student_profile_id == p.id,
            StudentCourseProgress.status == "COMPLETED"
        ).count()
        in_progress_count = db.query(StudentCourseProgress).filter(
            StudentCourseProgress.student_profile_id == p.id,
            StudentCourseProgress.status == "IN_PROGRESS"
        ).count()
        projects_count = db.query(StudentProject).filter(StudentProject.student_profile_id == p.id).count()

        results.append({
            "user_id": p.user_id,
            "profile_id": p.id,
            "student_id": p.student_id or "N/A",
            "full_name": p.full_name or "Student",
            "email": u.email if u else "",
            "phone": p.phone or "",
            "semester": p.current_semester or 1,
            "cgpa": float(p.cgpa) if p.cgpa else 0.0,
            "target_role": p.target_role or "Full-Stack Software Engineer",
            "completed_courses_count": completed_count,
            "in_progress_courses_count": in_progress_count,
            "projects_count": projects_count
        })

    return results


@router.get("/students/{user_id}", status_code=status.HTTP_200_OK)
def get_student_deep_dive(
    user_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student profile not found.")

    u = db.query(User).filter(User.id == user_id).first()

    # Courses
    progress_rows = db.query(StudentCourseProgress).filter(StudentCourseProgress.student_profile_id == profile.id).all()
    courses = []
    for pr in progress_rows:
        c = db.query(Course).filter(Course.id == pr.course_id).first()
        if c:
            courses.append({
                "code": c.course_code,
                "name": c.course_name,
                "credits": float(c.credit_hours),
                "semester": c.semester,
                "status": pr.status.value if hasattr(pr.status, "value") else str(pr.status),
                "grade": pr.grade,
                "rating": pr.self_rating
            })

    # Projects
    projs = db.query(StudentProject).filter(StudentProject.student_profile_id == profile.id).all()
    projects_list = [{
        "id": p.id,
        "title": p.title,
        "description": p.description,
        "tech_stack": p.tech_stack,
        "github_url": p.github_url,
        "live_url": p.live_url
    } for p in projs]

    # Certifications
    certs = db.query(StudentCertification).filter(StudentCertification.student_profile_id == profile.id).all()
    certs_list = [{
        "id": c.id,
        "name": c.name,
        "issuer": c.issuer,
        "issue_date": c.issue_date,
        "credential_url": c.credential_url
    } for c in certs]

    return {
        "profile": {
            "user_id": user_id,
            "student_id": profile.student_id,
            "full_name": profile.full_name,
            "email": u.email if u else "",
            "phone": profile.phone,
            "semester": profile.current_semester,
            "cgpa": float(profile.cgpa) if profile.cgpa else 0.0,
            "target_role": profile.target_role,
            "bio": profile.bio,
            "github_url": profile.github_url,
            "linkedin_url": profile.linkedin_url
        },
        "courses": courses,
        "projects": projects_list,
        "certifications": certs_list
    }


# ── 3. CURRICULUM & COURSE MANAGEMENT ────────────────────────────────────────
@router.get("/courses", status_code=status.HTTP_200_OK)
def list_admin_courses(
    semester: Optional[int] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    query = db.query(Course)
    if semester:
        query = query.filter(Course.semester == semester)
    courses = query.order_by(Course.semester.asc(), Course.course_code.asc()).all()

    res = []
    for c in courses:
        t_count = db.query(CourseTopic).filter(CourseTopic.course_id == c.id).count()
        o_count = db.query(CourseOutcome).filter(CourseOutcome.course_id == c.id).count()
        res.append({
            "id": c.id,
            "course_code": c.course_code,
            "course_name": c.course_name,
            "credit_hours": float(c.credit_hours),
            "semester": c.semester,
            "description": c.description,
            "topics_count": t_count,
            "outcomes_count": o_count
        })
    return res


@router.post("/courses", status_code=status.HTTP_201_CREATED)
def create_admin_course(
    payload: CourseCreateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    code_clean = payload.course_code.strip().upper()
    existing = db.query(Course).filter(Course.course_code == code_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Course with code '{code_clean}' already exists."
        )

    new_course = Course(
        course_code=code_clean,
        course_name=payload.course_name.strip(),
        credit_hours=payload.credit_hours,
        semester=payload.semester,
        description=payload.description or "",
        department=payload.department,
        program=payload.program
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return {
        "id": new_course.id,
        "course_code": new_course.course_code,
        "course_name": new_course.course_name,
        "credit_hours": float(new_course.credit_hours),
        "semester": new_course.semester,
        "description": new_course.description
    }


@router.put("/courses/{course_code}", status_code=status.HTTP_200_OK)
def update_admin_course(
    course_code: str,
    payload: CourseUpdateRequest,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    code_clean = course_code.strip().upper()
    course = db.query(Course).filter(Course.course_code == code_clean).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    if payload.course_name is not None:
        course.course_name = payload.course_name.strip()
    if payload.credit_hours is not None:
        course.credit_hours = payload.credit_hours
    if payload.semester is not None:
        course.semester = payload.semester
    if payload.description is not None:
        course.description = payload.description.strip()

    db.commit()
    db.refresh(course)
    return {
        "id": course.id,
        "course_code": course.course_code,
        "course_name": course.course_name,
        "credit_hours": float(course.credit_hours),
        "semester": course.semester,
        "description": course.description
    }


# ── 4. COURSE TOPICS & OUTCOMES GOVERNANCE ──────────────────────────────────
@router.get("/courses/{course_code}/topics", status_code=status.HTTP_200_OK)
def get_course_topics(
    course_code: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    code_clean = course_code.strip().upper()
    course = db.query(Course).filter(Course.course_code == code_clean).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    topics = db.query(CourseTopic).filter(CourseTopic.course_id == course.id).all()
    return [{"id": t.id, "topic_name": t.topic_name} for t in topics]


@router.post("/courses/{course_code}/topics", status_code=status.HTTP_200_OK)
def update_course_topics(
    course_code: str,
    topics_list: List[TopicItem],
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    code_clean = course_code.strip().upper()
    course = db.query(Course).filter(Course.course_code == code_clean).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    # Remove existing topics and replace with new list
    db.query(CourseTopic).filter(CourseTopic.course_id == course.id).delete()
    for t in topics_list:
        clean_t = t.topic_name.strip()
        if clean_t:
            db.add(CourseTopic(course_id=course.id, topic_name=clean_t))

    db.commit()
    updated = db.query(CourseTopic).filter(CourseTopic.course_id == course.id).all()
    return [{"id": t.id, "topic_name": t.topic_name} for t in updated]


@router.get("/courses/{course_code}/outcomes", status_code=status.HTTP_200_OK)
def get_course_outcomes(
    course_code: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    code_clean = course_code.strip().upper()
    course = db.query(Course).filter(Course.course_code == code_clean).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    outcomes = db.query(CourseOutcome).filter(CourseOutcome.course_id == course.id).order_by(CourseOutcome.outcome_code.asc()).all()
    return [{"id": o.id, "outcome_code": o.outcome_code, "description": o.description} for o in outcomes]


@router.post("/courses/{course_code}/outcomes", status_code=status.HTTP_200_OK)
def update_course_outcomes(
    course_code: str,
    outcomes_list: List[OutcomeItem],
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    code_clean = course_code.strip().upper()
    course = db.query(Course).filter(Course.course_code == code_clean).first()
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found.")

    # Replace outcomes
    db.query(CourseOutcome).filter(CourseOutcome.course_id == course.id).delete()
    for o in outcomes_list:
        clean_code = o.outcome_code.strip().upper()
        clean_desc = o.description.strip()
        if clean_code and clean_desc:
            db.add(CourseOutcome(course_id=course.id, outcome_code=clean_code, description=clean_desc))

    db.commit()
    updated = db.query(CourseOutcome).filter(CourseOutcome.course_id == course.id).order_by(CourseOutcome.outcome_code.asc()).all()
    return [{"id": o.id, "outcome_code": o.outcome_code, "description": o.description} for o in updated]

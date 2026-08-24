from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.courses import Course
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.schemas.students import CurriculumResponse, CurriculumCourseItem, CourseListItem


def get_student_curriculum(db: Session, user: User) -> CurriculumResponse:
    profile = user.profile
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incomplete student profile: profile record has not been initialized. Please update your student profile."
        )

    missing_fields = []
    if not profile.department:
        missing_fields.append("department")
    if not profile.program:
        missing_fields.append("program")
    if not profile.current_semester:
        missing_fields.append("current_semester")

    if missing_fields:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Incomplete student profile: missing required field(s): {', '.join(missing_fields)}. Please update your profile."
        )

    # Fetch curriculum courses for program/department
    courses = (
        db.query(Course)
        .filter(
            Course.department == profile.department,
            Course.program == profile.program
        )
        .order_by(Course.semester.asc(), Course.course_code.asc())
        .all()
    )

    # Fallback to all courses if exact department/program matching returns empty
    if not courses:
        courses = (
            db.query(Course)
            .order_by(Course.semester.asc(), Course.course_code.asc())
            .all()
        )

    # Fetch student's progress records
    progress_map = {}
    progress_records = (
        db.query(StudentCourseProgress)
        .filter(StudentCourseProgress.student_profile_id == profile.id)
        .all()
    )
    for p in progress_records:
        progress_map[p.course_id] = p

    items: List[CurriculumCourseItem] = []
    completed_count = 0
    in_progress_count = 0

    for c in courses:
        prog = progress_map.get(c.id)
        status_val = prog.status if prog else ProgressStatus.NOT_STARTED
        grade_val = prog.grade if prog else None
        rating_val = prog.self_rating if prog else None

        if status_val == ProgressStatus.COMPLETED:
            completed_count += 1
        elif status_val == ProgressStatus.IN_PROGRESS:
            in_progress_count += 1

        items.append(
            CurriculumCourseItem(
                course=CourseListItem.model_validate(c),
                status=status_val,
                grade=grade_val,
                self_rating=rating_val
            )
        )

    return CurriculumResponse(
        university=profile.university,
        department=profile.department,
        program=profile.program,
        batch=profile.batch,
        current_semester=profile.current_semester,
        total_courses=len(items),
        completed_courses=completed_count,
        in_progress_courses=in_progress_count,
        courses=items
    )

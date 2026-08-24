from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.courses import Course
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.schemas.students import (
    StudentProfileUpdate,
    StudentProfileResponse,
    StudentCourseProgressCreate,
    StudentCourseProgressUpdate,
    StudentCourseProgressResponse
)


def get_or_create_profile(db: Session, user: User) -> StudentProfile:
    if not user.profile:
        profile = StudentProfile(
            user_id=user.id,
            university="IUBAT",
            department="Department of Computer Science & Engineering",
            program="B.Sc. in Computer Science & Engineering"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        return profile
    return user.profile


def get_student_profile_response(db: Session, user: User) -> StudentProfileResponse:
    profile = get_or_create_profile(db, user)
    return StudentProfileResponse(
        id=profile.id,
        user_id=profile.user_id,
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
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )


def update_student_profile(
    db: Session, user: User, update_data: StudentProfileUpdate
) -> StudentProfileResponse:
    profile = get_or_create_profile(db, user)

    data_dict = update_data.model_dump(exclude_unset=True)
    for field, value in data_dict.items():
        if value is not None:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return get_student_profile_response(db, user)


def list_student_course_progress(
    db: Session, user: User
) -> List[StudentCourseProgressResponse]:
    profile = get_or_create_profile(db, user)
    progress_records = (
        db.query(StudentCourseProgress)
        .filter(StudentCourseProgress.student_profile_id == profile.id)
        .all()
    )

    results = []
    for record in progress_records:
        course = record.course
        results.append(
            StudentCourseProgressResponse(
                id=record.id,
                student_profile_id=record.student_profile_id,
                course_id=record.course_id,
                course_code=course.course_code,
                course_name=course.course_name,
                credit_hours=course.credit_hours,
                semester=course.semester,
                status=record.status,
                grade=record.grade,
                self_rating=record.self_rating,
                updated_at=record.updated_at
            )
        )
    return results


def add_student_course_progress(
    db: Session, user: User, data: StudentCourseProgressCreate
) -> StudentCourseProgressResponse:
    profile = get_or_create_profile(db, user)
    course_code_clean = data.course_code.strip().upper()

    course = db.query(Course).filter(Course.course_code == course_code_clean).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with code '{course_code_clean}' does not exist."
        )

    # Check duplicate
    existing = (
        db.query(StudentCourseProgress)
        .filter(
            StudentCourseProgress.student_profile_id == profile.id,
            StudentCourseProgress.course_id == course.id
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Progress record already exists for course '{course_code_clean}'. Use PUT to update."
        )

    progress = StudentCourseProgress(
        student_profile_id=profile.id,
        course_id=course.id,
        status=data.status,
        grade=data.grade,
        self_rating=data.self_rating
    )
    db.add(progress)
    db.commit()
    db.refresh(progress)

    return StudentCourseProgressResponse(
        id=progress.id,
        student_profile_id=progress.student_profile_id,
        course_id=progress.course_id,
        course_code=course.course_code,
        course_name=course.course_name,
        credit_hours=course.credit_hours,
        semester=course.semester,
        status=progress.status,
        grade=progress.grade,
        self_rating=progress.self_rating,
        updated_at=progress.updated_at
    )


def update_student_course_progress(
    db: Session, user: User, course_code: str, data: StudentCourseProgressUpdate
) -> StudentCourseProgressResponse:
    profile = get_or_create_profile(db, user)
    course_code_clean = course_code.strip().upper()

    course = db.query(Course).filter(Course.course_code == course_code_clean).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with code '{course_code_clean}' does not exist."
        )

    progress = (
        db.query(StudentCourseProgress)
        .filter(
            StudentCourseProgress.student_profile_id == profile.id,
            StudentCourseProgress.course_id == course.id
        )
        .first()
    )

    if not progress:
        # Create new if doesn't exist
        progress = StudentCourseProgress(
            student_profile_id=profile.id,
            course_id=course.id,
            status=data.status or ProgressStatus.IN_PROGRESS,
            grade=data.grade,
            self_rating=data.self_rating
        )
        db.add(progress)
    else:
        if data.status is not None:
            progress.status = data.status
        if data.grade is not None:
            progress.grade = data.grade
        if data.self_rating is not None:
            progress.self_rating = data.self_rating

    db.commit()
    db.refresh(progress)

    return StudentCourseProgressResponse(
        id=progress.id,
        student_profile_id=progress.student_profile_id,
        course_id=progress.course_id,
        course_code=course.course_code,
        course_name=course.course_name,
        credit_hours=course.credit_hours,
        semester=course.semester,
        status=progress.status,
        grade=progress.grade,
        self_rating=progress.self_rating,
        updated_at=progress.updated_at
    )

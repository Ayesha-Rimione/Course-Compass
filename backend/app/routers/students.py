from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.students import (
    StudentProfileUpdate,
    StudentProfileResponse,
    StudentCourseProgressCreate,
    StudentCourseProgressUpdate,
    StudentCourseProgressResponse
)
from app.services import student_service

router = APIRouter(prefix="/students", tags=["Student Profile & Progress"])


@router.get("/me", response_model=StudentProfileResponse, status_code=status.HTTP_200_OK)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.get_student_profile_response(db, current_user)


@router.put("/me", response_model=StudentProfileResponse, status_code=status.HTTP_200_OK)
def update_my_profile(
    payload: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.update_student_profile(db, current_user, payload)


@router.get("/me/courses", response_model=List[StudentCourseProgressResponse], status_code=status.HTTP_200_OK)
def get_my_course_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.list_student_course_progress(db, current_user)


@router.post("/me/courses", response_model=StudentCourseProgressResponse, status_code=status.HTTP_201_CREATED)
def add_my_course_progress(
    payload: StudentCourseProgressCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.add_student_course_progress(db, current_user, payload)


@router.put("/me/courses/{course_code}", response_model=StudentCourseProgressResponse, status_code=status.HTTP_200_OK)
def update_my_course_progress(
    course_code: str,
    payload: StudentCourseProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.update_student_course_progress(db, current_user, course_code, payload)

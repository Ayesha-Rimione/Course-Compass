from typing import List
from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.students import (
    StudentProfileUpdate,
    StudentProfileResponse,
    StudentCourseProgressCreate,
    StudentCourseProgressUpdate,
    StudentCourseProgressResponse,
    StudentCourseBatchItem,
    StudentProjectCreate,
    StudentProjectResponse,
    StudentCertificationCreate,
    StudentCertificationResponse,
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


@router.post("/me/courses/batch", response_model=List[StudentCourseProgressResponse], status_code=status.HTTP_200_OK)
def batch_update_my_courses(
    payload: List[StudentCourseBatchItem],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.batch_save_courses(db, current_user, payload)


@router.put("/me/courses/{course_code}", response_model=StudentCourseProgressResponse, status_code=status.HTTP_200_OK)
def update_my_course_progress(
    course_code: str,
    payload: StudentCourseProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.update_student_course_progress(db, current_user, course_code, payload)


# Projects Endpoints
@router.get("/me/projects", response_model=List[StudentProjectResponse], status_code=status.HTTP_200_OK)
def get_my_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.list_student_projects(db, current_user)


@router.post("/me/projects", response_model=StudentProjectResponse, status_code=status.HTTP_201_CREATED)
def create_my_project(
    payload: StudentProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.create_student_project(db, current_user, payload)


@router.delete("/me/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student_service.delete_student_project(db, current_user, project_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Certifications Endpoints
@router.get("/me/certifications", response_model=List[StudentCertificationResponse], status_code=status.HTTP_200_OK)
def get_my_certifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.list_student_certifications(db, current_user)


@router.post("/me/certifications", response_model=StudentCertificationResponse, status_code=status.HTTP_201_CREATED)
def create_my_certification(
    payload: StudentCertificationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return student_service.create_student_certification(db, current_user, payload)


@router.delete("/me/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_certification(
    cert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    student_service.delete_student_certification(db, current_user, cert_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.courses import Course
from app.schemas.courses import CourseResponse, CourseListItem

router = APIRouter(prefix="/courses", tags=["Courses"])


@router.get("", response_model=List[CourseListItem], status_code=status.HTTP_200_OK)
def list_courses(
    semester: Optional[int] = None,
    department: Optional[str] = None,
    program: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Course)
    if semester is not None:
        query = query.filter(Course.semester == semester)
    if department:
        query = query.filter(Course.department.ilike(f"%{department}%"))
    if program:
        query = query.filter(Course.program.ilike(f"%{program}%"))

    courses = query.order_by(Course.semester.asc(), Course.course_code.asc()).all()
    return courses


@router.get("/{course_code}", response_model=CourseResponse, status_code=status.HTTP_200_OK)
def get_course_detail(course_code: str, db: Session = Depends(get_db)):
    code_clean = course_code.strip().upper()
    course = db.query(Course).filter(Course.course_code == code_clean).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with code '{code_clean}' not found."
        )
    return course

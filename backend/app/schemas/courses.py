from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class CourseTopicResponse(BaseModel):
    id: str
    topic_name: str

    model_config = ConfigDict(from_attributes=True)


class CourseOutcomeResponse(BaseModel):
    id: str
    outcome_code: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class CourseResponse(BaseModel):
    id: str
    course_code: str
    course_name: str
    credit_hours: float
    semester: int
    description: str
    department: str
    program: str
    topics: List[CourseTopicResponse] = []
    outcomes: List[CourseOutcomeResponse] = []

    model_config = ConfigDict(from_attributes=True)


class CourseListItem(BaseModel):
    id: str
    course_code: str
    course_name: str
    credit_hours: float
    semester: int
    department: str
    program: str

    model_config = ConfigDict(from_attributes=True)

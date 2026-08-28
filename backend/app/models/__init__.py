from app.database import Base
from app.models.users import User, OTPCode, UserRole
from app.models.academic import Department, Program, Batch, CurriculumVersion, CurriculumCourse
from app.models.courses import Course, CourseTopic, CourseOutcome
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.models.portfolio import StudentProject, StudentCertification
from app.models.skills import Skill, StudentSkill, SkillVerification, VerificationStatus, QuizStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.mappings import CourseSkillMapping, CareerRoleSkill
from app.models.recommendations import LearningResource, ProjectRecommendation, Certification, JobListing
from app.models.chat import ChatConversation, ChatMessage

__all__ = [
    "Base",
    "User",
    "OTPCode",
    "UserRole",
    "Department",
    "Program",
    "Batch",
    "CurriculumVersion",
    "CurriculumCourse",
    "Course",
    "CourseTopic",
    "CourseOutcome",
    "StudentProfile",
    "StudentCourseProgress",
    "ProgressStatus",
    "StudentProject",
    "StudentCertification",
    "Skill",
    "StudentSkill",
    "SkillVerification",
    "VerificationStatus",
    "QuizStatus",
    "CareerRole",
    "StudentCareerInterest",
    "CourseSkillMapping",
    "CareerRoleSkill",
    "LearningResource",
    "ProjectRecommendation",
    "Certification",
    "JobListing",
    "ChatConversation",
    "ChatMessage",
]

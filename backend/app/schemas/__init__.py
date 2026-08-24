from app.schemas.auth import OTPRequest, OTPVerify, TokenResponse, MessageResponse
from app.schemas.courses import CourseResponse, CourseListItem, CourseTopicResponse, CourseOutcomeResponse
from app.schemas.students import (
    StudentProfileUpdate,
    StudentProfileResponse,
    StudentCourseProgressCreate,
    StudentCourseProgressUpdate,
    StudentCourseProgressResponse,
    CurriculumResponse,
    CurriculumCourseItem
)
from app.schemas.skills import SkillResponse, StudentSkillCreate, StudentSkillUpdate, StudentSkillResponse
from app.schemas.careers import (
    CareerRoleResponse,
    CareerRoleDetailResponse,
    CareerRoleSkillItem,
    CareerInterestUpdate,
    CareerInterestResponse
)
from app.schemas.verifications import VerificationStartResponse, VerificationAttemptResponse, VerificationHistoryResponse
from app.schemas.recommendations import (
    LearningResourceResponse,
    ProjectRecommendationResponse,
    CertificationResponse,
    JobListingResponse
)
from app.schemas.roadmap import (
    SkillGapItem,
    RadarAxisItem,
    SemesterGuidanceItem,
    AcademicProgressSummary,
    RoadmapResponse
)
from app.schemas.planning import PlanningRecommendationItem, PlanningResponse
from app.schemas.ai_context import AIContextResponse
from app.schemas.chat import (
    ConversationCreate,
    MessageCreate,
    ChatMessageResponse,
    ChatConversationResponse,
    ChatConversationDetailResponse,
    MessagePostResponse
)

__all__ = [
    "OTPRequest",
    "OTPVerify",
    "TokenResponse",
    "MessageResponse",
    "CourseResponse",
    "CourseListItem",
    "CourseTopicResponse",
    "CourseOutcomeResponse",
    "StudentProfileUpdate",
    "StudentProfileResponse",
    "StudentCourseProgressCreate",
    "StudentCourseProgressUpdate",
    "StudentCourseProgressResponse",
    "CurriculumResponse",
    "CurriculumCourseItem",
    "SkillResponse",
    "StudentSkillCreate",
    "StudentSkillUpdate",
    "StudentSkillResponse",
    "CareerRoleResponse",
    "CareerRoleDetailResponse",
    "CareerRoleSkillItem",
    "CareerInterestUpdate",
    "CareerInterestResponse",
    "VerificationStartResponse",
    "VerificationAttemptResponse",
    "VerificationHistoryResponse",
    "LearningResourceResponse",
    "ProjectRecommendationResponse",
    "CertificationResponse",
    "JobListingResponse",
    "SkillGapItem",
    "RadarAxisItem",
    "SemesterGuidanceItem",
    "AcademicProgressSummary",
    "RoadmapResponse",
    "PlanningRecommendationItem",
    "PlanningResponse",
    "AIContextResponse",
    "ConversationCreate",
    "MessageCreate",
    "ChatMessageResponse",
    "ChatConversationResponse",
    "ChatConversationDetailResponse",
    "MessagePostResponse",
]

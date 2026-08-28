from app.routers.health import router as health_router
from app.routers.auth import router as auth_router
from app.routers.students import router as students_router
from app.routers.courses import router as courses_router
from app.routers.curriculum import router as curriculum_router
from app.routers.skills import router as skills_router
from app.routers.careers import router as careers_router
from app.routers.context import router as context_router
from app.routers.intelligence import router as intelligence_router
from app.routers.roadmap import router as roadmap_router
from app.routers.planning import router as planning_router
from app.routers.recommendations import router as recommendations_router
from app.routers.ai_context import router as ai_context_router
from app.routers.chat import router as chat_router
from app.routers.admin import router as admin_router

__all__ = [
    "health_router",
    "auth_router",
    "students_router",
    "courses_router",
    "curriculum_router",
    "skills_router",
    "careers_router",
    "context_router",
    "intelligence_router",
    "roadmap_router",
    "planning_router",
    "recommendations_router",
    "ai_context_router",
    "chat_router",
    "admin_router",
]

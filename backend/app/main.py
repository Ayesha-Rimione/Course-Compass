from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.models import *  # Ensure all models are imported
from app.routers import (
    health_router,
    auth_router,
    students_router,
    courses_router,
    curriculum_router,
    skills_router,
    careers_router,
    context_router,
    intelligence_router,
    roadmap_router,
    planning_router,
    recommendations_router,
    ai_context_router,
    chat_router,
    admin_router,
)

# Initialize database tables if not created via migrations
Base.metadata.create_all(bind=engine)

# Ensure optional columns exist in legacy SQLite database
try:
    with engine.connect() as conn:
        for col_stmt in [
            "ALTER TABLE users ADD COLUMN password_hash VARCHAR(255)",
            "ALTER TABLE student_profiles ADD COLUMN admission_session VARCHAR(100)",
            "ALTER TABLE student_profiles ADD COLUMN profile_image_url VARCHAR(500)",
            "ALTER TABLE student_profiles ADD COLUMN bio TEXT",
            "ALTER TABLE student_profiles ADD COLUMN github_url VARCHAR(500)",
            "ALTER TABLE student_profiles ADD COLUMN linkedin_url VARCHAR(500)",
            "ALTER TABLE student_profiles ADD COLUMN codeforces_url VARCHAR(500)",
            "ALTER TABLE student_profiles ADD COLUMN leetcode_url VARCHAR(500)",
            "ALTER TABLE student_profiles ADD COLUMN phone VARCHAR(50)",
        ]:
            try:
                conn.execute(__import__("sqlalchemy").text(col_stmt))
                conn.commit()
            except Exception:
                pass
except Exception:
    pass


app = FastAPI(
    title="CourseCompass Backend API",
    description="Academic & Career Guidance Platform for IUBAT CSE Students",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ],
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(students_router)
app.include_router(courses_router)
app.include_router(curriculum_router)
app.include_router(skills_router)
app.include_router(careers_router)
app.include_router(context_router)
app.include_router(intelligence_router)
app.include_router(roadmap_router)
app.include_router(planning_router)
app.include_router(recommendations_router)
app.include_router(ai_context_router)
app.include_router(chat_router)
app.include_router(admin_router)


@app.get("/", include_in_schema=False)
def root():
    return {
        "name": "CourseCompass Backend API",
        "status": "running",
        "docs": "/docs"
    }

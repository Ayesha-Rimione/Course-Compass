"""
seed_phase3_data.py — Idempotent seed for Phase 3 catalog data.

Seeds:
 - Skills catalog (~22 skills)
 - Career roles catalog (10 roles)

Running this script twice will NOT create duplicates.
Uses merge/upsert pattern via SQLAlchemy.
"""
import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.skills import Skill
from app.models.careers import CareerRole


SKILLS_DATA = [
    {"name": "Python", "category": "Programming"},
    {"name": "Java", "category": "Programming"},
    {"name": "C++", "category": "Programming"},
    {"name": "JavaScript", "category": "Programming"},
    {"name": "TypeScript", "category": "Programming"},
    {"name": "HTML/CSS", "category": "Web Development"},
    {"name": "React", "category": "Web Development"},
    {"name": "Next.js", "category": "Web Development"},
    {"name": "FastAPI", "category": "Backend Development"},
    {"name": "Django", "category": "Backend Development"},
    {"name": "REST APIs", "category": "Backend Development"},
    {"name": "SQL", "category": "Database"},
    {"name": "PostgreSQL", "category": "Database"},
    {"name": "Git", "category": "Tools & DevOps"},
    {"name": "GitHub", "category": "Tools & DevOps"},
    {"name": "Machine Learning", "category": "AI & Data Science"},
    {"name": "Deep Learning", "category": "AI & Data Science"},
    {"name": "Data Analysis", "category": "AI & Data Science"},
    {"name": "TensorFlow", "category": "AI & Data Science"},
    {"name": "PyTorch", "category": "AI & Data Science"},
    {"name": "Communication", "category": "Soft Skills"},
    {"name": "Problem Solving", "category": "Soft Skills"},
]

CAREER_ROLES_DATA = [
    {"name": "Software Engineer", "description": "Design and develop software systems and applications."},
    {"name": "Backend Engineer", "description": "Build and maintain server-side logic, APIs, and databases."},
    {"name": "Frontend Engineer", "description": "Create user interfaces and client-side web applications."},
    {"name": "Full Stack Engineer", "description": "Develop both frontend and backend components of web applications."},
    {"name": "AI/ML Engineer", "description": "Design and implement machine learning models and AI systems."},
    {"name": "Data Scientist", "description": "Analyze complex data to derive insights and build predictive models."},
    {"name": "Data Analyst", "description": "Collect, process, and analyze data to support business decisions."},
    {"name": "Cybersecurity Engineer", "description": "Protect systems and networks from digital attacks and vulnerabilities."},
    {"name": "DevOps Engineer", "description": "Bridge development and operations with CI/CD, automation, and monitoring."},
    {"name": "Cloud Engineer", "description": "Design, deploy, and manage cloud infrastructure and services."},
]


def seed_skills(db: Session) -> int:
    inserted = 0
    for data in SKILLS_DATA:
        existing = db.query(Skill).filter(Skill.name == data["name"]).first()
        if not existing:
            skill = Skill(
                id=str(uuid.uuid4()),
                name=data["name"],
                category=data["category"]
            )
            db.add(skill)
            inserted += 1
    db.commit()
    return inserted


def seed_career_roles(db: Session) -> int:
    inserted = 0
    for data in CAREER_ROLES_DATA:
        existing = db.query(CareerRole).filter(CareerRole.name == data["name"]).first()
        if not existing:
            role = CareerRole(
                id=str(uuid.uuid4()),
                name=data["name"],
                description=data["description"]
            )
            db.add(role)
            inserted += 1
    db.commit()
    return inserted


def main():
    print("=" * 50)
    print("CourseCompass Phase 3 Seed")
    print("=" * 50)

    db: Session = SessionLocal()
    try:
        # Skills
        skills_before = db.query(Skill).count()
        skills_inserted = seed_skills(db)
        skills_after = db.query(Skill).count()
        print(f"\n[Skills]")
        print(f"  Before: {skills_before} rows")
        print(f"  Inserted: {skills_inserted}")
        print(f"  After:  {skills_after} rows")

        # Career Roles
        roles_before = db.query(CareerRole).count()
        roles_inserted = seed_career_roles(db)
        roles_after = db.query(CareerRole).count()
        print(f"\n[Career Roles]")
        print(f"  Before: {roles_before} rows")
        print(f"  Inserted: {roles_inserted}")
        print(f"  After:  {roles_after} rows")

        print("\n" + "=" * 50)
        print(f"Seed complete.")
        print(f"  Total skills in DB:       {skills_after}")
        print(f"  Total career roles in DB: {roles_after}")
        print("=" * 50)

    finally:
        db.close()


if __name__ == "__main__":
    main()

"""
seed_career_skill_requirements.py

Idempotent seed for career role → skill competency requirements.
This represents the CourseCompass initial career competency model.
Running twice produces no duplicates.

importance:    1 (nice-to-have) → 5 (essential)
minimum_rating: 1 (beginner) → 5 (expert)
"""
import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.careers import CareerRole
from app.models.skills import Skill
from app.models.mappings import CareerRoleSkill

# -------------------------------------------------------------------
# Career competency model definition
# Format: role_name → [ (skill_name, importance, minimum_rating) ]
# -------------------------------------------------------------------
CAREER_SKILL_REQUIREMENTS = {
    "Software Engineer": [
        ("Python",          4, 3),
        ("Java",            3, 3),
        ("C++",             3, 3),
        ("Data Structures", None, None),  # skip if not in catalog
        ("Git",             4, 3),
        ("GitHub",          4, 3),
        ("Problem Solving", 5, 4),
        ("Communication",   3, 3),
        ("REST APIs",       3, 3),
        ("SQL",             3, 3),
    ],
    "Backend Engineer": [
        ("Python",          5, 4),
        ("FastAPI",         4, 3),
        ("Django",          3, 3),
        ("REST APIs",       5, 4),
        ("SQL",             5, 4),
        ("PostgreSQL",      4, 3),
        ("Git",             4, 3),
        ("GitHub",          3, 3),
        ("Problem Solving", 4, 3),
    ],
    "Frontend Engineer": [
        ("JavaScript",      5, 4),
        ("TypeScript",      4, 3),
        ("React",           5, 4),
        ("Next.js",         4, 3),
        ("HTML/CSS",        5, 4),
        ("Git",             4, 3),
        ("GitHub",          3, 3),
        ("REST APIs",       4, 3),
        ("Communication",   3, 3),
    ],
    "Full Stack Engineer": [
        ("JavaScript",      5, 4),
        ("TypeScript",      4, 3),
        ("React",           4, 3),
        ("Next.js",         3, 3),
        ("HTML/CSS",        4, 3),
        ("Python",          4, 3),
        ("FastAPI",         3, 3),
        ("REST APIs",       5, 4),
        ("SQL",             4, 3),
        ("PostgreSQL",      3, 3),
        ("Git",             4, 3),
        ("GitHub",          4, 3),
    ],
    "AI/ML Engineer": [
        ("Python",          5, 4),
        ("Machine Learning", 5, 4),
        ("Deep Learning",   5, 4),
        ("TensorFlow",      4, 3),
        ("PyTorch",         4, 3),
        ("Data Analysis",   4, 3),
        ("SQL",             3, 3),
        ("Git",             3, 3),
        ("Problem Solving", 5, 4),
    ],
    "Data Scientist": [
        ("Python",          5, 4),
        ("Machine Learning", 5, 4),
        ("Data Analysis",   5, 4),
        ("SQL",             4, 4),
        ("TensorFlow",      3, 2),
        ("PyTorch",         3, 2),
        ("Deep Learning",   3, 3),
        ("Problem Solving", 5, 4),
        ("Communication",   4, 3),
    ],
    "Data Analyst": [
        ("Python",          4, 3),
        ("SQL",             5, 4),
        ("PostgreSQL",      4, 3),
        ("Data Analysis",   5, 4),
        ("Communication",   4, 4),
        ("Problem Solving", 4, 3),
    ],
    "Cybersecurity Engineer": [
        ("Python",          4, 3),
        ("C++",             3, 2),
        ("SQL",             3, 3),
        ("Git",             3, 3),
        ("Problem Solving", 5, 4),
        ("Communication",   3, 3),
    ],
    "DevOps Engineer": [
        ("Python",          4, 3),
        ("Git",             5, 4),
        ("GitHub",          5, 4),
        ("REST APIs",       3, 3),
        ("SQL",             3, 2),
        ("Problem Solving", 4, 3),
        ("Communication",   3, 3),
    ],
    "Cloud Engineer": [
        ("Python",          4, 3),
        ("Git",             4, 3),
        ("GitHub",          4, 3),
        ("SQL",             3, 2),
        ("REST APIs",       3, 3),
        ("Problem Solving", 4, 3),
        ("Communication",   3, 3),
    ],
}


def seed(db: Session) -> dict:
    # Build lookup maps
    role_map = {r.name: r for r in db.query(CareerRole).all()}
    skill_map = {s.name: s for s in db.query(Skill).all()}

    inserted = 0
    skipped_missing = 0

    for role_name, skill_reqs in CAREER_SKILL_REQUIREMENTS.items():
        role = role_map.get(role_name)
        if not role:
            print(f"  [WARN] Career role not found: '{role_name}' — skipping")
            continue

        for skill_name, importance, minimum_rating in skill_reqs:
            skill = skill_map.get(skill_name)
            if not skill:
                skipped_missing += 1
                continue  # Skill not in catalog, skip silently

            existing = (
                db.query(CareerRoleSkill)
                .filter(
                    CareerRoleSkill.career_role_id == role.id,
                    CareerRoleSkill.skill_id == skill.id
                )
                .first()
            )
            if existing:
                continue

            mapping = CareerRoleSkill(
                id=str(uuid.uuid4()),
                career_role_id=role.id,
                skill_id=skill.id,
                importance=importance,
                minimum_rating=minimum_rating
            )
            db.add(mapping)
            inserted += 1

    db.commit()
    return {"inserted": inserted, "skipped_missing_skill": skipped_missing}


def main():
    print("=" * 55)
    print("CourseCompass — Seed Career Skill Requirements")
    print("=" * 55)

    db: Session = SessionLocal()
    try:
        before = db.query(CareerRoleSkill).count()
        result = seed(db)
        after = db.query(CareerRoleSkill).count()

        print(f"\n  Before:   {before} rows")
        print(f"  Inserted: {result['inserted']}")
        print(f"  After:    {after} rows")
        if result["skipped_missing_skill"]:
            print(f"  Skipped (skill not in catalog): {result['skipped_missing_skill']}")
        print(f"\n  Seed complete. Total career_role_skills: {after}")
        print("=" * 55)
    finally:
        db.close()


if __name__ == "__main__":
    main()

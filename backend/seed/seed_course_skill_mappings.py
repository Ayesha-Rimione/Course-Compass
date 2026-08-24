"""
seed_course_skill_mappings.py

Idempotent seed for course → skill academic mappings.
Only creates mappings where the relationship is clear from:
  - course name
  - description
  - known curriculum content

Mappings are sourced from manual curriculum analysis ("academic_mapping").
Running twice produces no duplicates.

relevance_weight: 0.0 (weak) → 1.0 (primary focus of the course)
"""
import os
import sys
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.courses import Course
from app.models.skills import Skill
from app.models.mappings import CourseSkillMapping

# -------------------------------------------------------------------
# Course → Skill mapping definition
# Format: course_code → [ (skill_name, relevance_weight) ]
# Only map where the relationship is academically clear.
# -------------------------------------------------------------------
COURSE_SKILL_MAPPINGS = {
    # ── Programming Foundations ────────────────────────────────────
    "CSC 103": [
        ("Problem Solving", 0.6),
    ],
    "CSC 183": [
        ("Problem Solving", 0.7),
        ("C++",             0.5),  # C concepts carry over
    ],
    "CSC 184": [
        ("Problem Solving", 0.6),
    ],
    "CSC 283": [
        ("C++",             0.9),
        ("Problem Solving", 0.7),
    ],
    "CSC 284": [
        ("C++",             0.8),
    ],
    "CSE 151": [
        ("Problem Solving", 0.5),
    ],
    "CSE 383": [
        ("Java",            0.9),
        ("Problem Solving", 0.7),
    ],
    "CSE 384": [
        ("Java",            0.8),
    ],

    # ── Web Development ────────────────────────────────────────────
    "CSE 393": [
        ("HTML/CSS",        0.9),
        ("JavaScript",      0.6),
    ],
    "CSE 394": [
        ("HTML/CSS",        0.8),
        ("JavaScript",      0.5),
    ],
    "CSE 3391": [
        ("HTML/CSS",        0.7),
        ("JavaScript",      0.8),
        ("REST APIs",       0.6),
    ],

    # ── Database ───────────────────────────────────────────────────
    "CSC 433": [
        ("SQL",             0.9),
        ("PostgreSQL",      0.6),
        ("Problem Solving", 0.5),
    ],
    "CSC 434": [
        ("SQL",             0.9),
        ("PostgreSQL",      0.7),
    ],

    # ── Data Structures and Algorithms ────────────────────────────
    "CSC 391": [
        ("Problem Solving", 0.9),
        ("Python",          0.4),
        ("Java",            0.4),
    ],

    # ── Machine Learning / AI / Data Science ──────────────────────
    "CSE 4317": [
        ("Machine Learning", 0.9),
        ("Python",           0.8),
        ("Data Analysis",    0.6),
        ("TensorFlow",       0.4),
        ("PyTorch",          0.4),
    ],
    "CSE 4357": [
        ("Data Analysis",    0.9),
        ("Python",           0.8),
        ("SQL",              0.6),
        ("Machine Learning", 0.5),
    ],
    "CSE 483": [
        ("Machine Learning", 0.6),
        ("Problem Solving",  0.7),
    ],
    "CSE 4383": [
        ("Machine Learning", 0.7),
        ("Python",           0.6),
        ("Problem Solving",  0.8),
    ],
    "CSE 4385": [
        ("Deep Learning",    0.7),
        ("Python",           0.7),
        ("TensorFlow",       0.5),
        ("PyTorch",          0.5),
    ],
    "CSE 485": [
        ("Deep Learning",    0.6),
        ("Python",           0.6),
    ],

    # ── Software Engineering ───────────────────────────────────────
    "CSC 469": [
        ("Problem Solving",  0.8),
        ("Git",              0.6),
        ("Communication",    0.7),
    ],
    "CSC 470": [
        ("Git",              0.6),
        ("Problem Solving",  0.7),
    ],
    "CSC 387": [
        ("Problem Solving",  0.8),
        ("Communication",    0.6),
    ],

    # ── Networks / Systems ────────────────────────────────────────
    "CSC 307": [
        ("Problem Solving",  0.7),
        ("C++",              0.4),
    ],
    "CSC 465": [
        ("REST APIs",        0.5),
        ("Problem Solving",  0.7),
    ],
    "CSC 466": [
        ("REST APIs",        0.5),
    ],

    # ── Statistics / Math (supports Data Science) ─────────────────
    "STA 240": [
        ("Data Analysis",    0.7),
        ("Machine Learning", 0.4),
    ],
    "MAT 219": [
        ("Machine Learning", 0.4),
        ("Data Analysis",    0.4),
    ],
    "MAT 247": [
        ("Data Analysis",    0.5),
        ("Python",           0.3),
    ],

    # ── Career / Communication ────────────────────────────────────
    "ART 202": [
        ("Communication",    0.8),
    ],
    "ART 203": [
        ("Communication",    0.9),
    ],
    "BUS 201": [
        ("Communication",    0.7),
    ],
    "ENG 250": [
        ("Communication",    0.8),
    ],

    # ── Thesis / Practicum ────────────────────────────────────────
    "CSC 488": [
        ("Problem Solving",  0.9),
        ("Communication",    0.7),
        ("Git",              0.5),
        ("GitHub",           0.5),
    ],
    "CSE 490": [
        ("Problem Solving",  0.8),
        ("Communication",    0.7),
        ("Git",              0.5),
    ],
}


def seed(db: Session) -> dict:
    # Build lookup maps
    course_map = {c.course_code: c for c in db.query(Course).all()}
    skill_map = {s.name: s for s in db.query(Skill).all()}

    inserted = 0
    skipped_missing_course = 0
    skipped_missing_skill = 0
    skipped_duplicate = 0

    for course_code, skill_entries in COURSE_SKILL_MAPPINGS.items():
        course = course_map.get(course_code)
        if not course:
            skipped_missing_course += 1
            continue

        for skill_name, weight in skill_entries:
            skill = skill_map.get(skill_name)
            if not skill:
                skipped_missing_skill += 1
                continue

            existing = (
                db.query(CourseSkillMapping)
                .filter(
                    CourseSkillMapping.course_id == course.id,
                    CourseSkillMapping.skill_id == skill.id
                )
                .first()
            )
            if existing:
                skipped_duplicate += 1
                continue

            mapping = CourseSkillMapping(
                id=str(uuid.uuid4()),
                course_id=course.id,
                skill_id=skill.id,
                relevance_weight=weight,
                source="academic_mapping"
            )
            db.add(mapping)
            inserted += 1

    db.commit()
    return {
        "inserted": inserted,
        "skipped_missing_course": skipped_missing_course,
        "skipped_missing_skill": skipped_missing_skill,
        "skipped_duplicate": skipped_duplicate,
    }


def main():
    print("=" * 55)
    print("CourseCompass -- Seed Course-to-Skill Mappings")
    print("=" * 55)

    db: Session = SessionLocal()
    try:
        before = db.query(CourseSkillMapping).count()
        result = seed(db)
        after = db.query(CourseSkillMapping).count()

        print(f"\n  Before:                 {before} rows")
        print(f"  Inserted:               {result['inserted']}")
        print(f"  After:                  {after} rows")
        print(f"  Skipped (dup):          {result['skipped_duplicate']}")
        print(f"  Skipped (no course):    {result['skipped_missing_course']}")
        print(f"  Skipped (no skill):     {result['skipped_missing_skill']}")
        print(f"\n  Seed complete. Total course_skill_mappings: {after}")
        print("=" * 55)
    finally:
        db.close()


if __name__ == "__main__":
    main()

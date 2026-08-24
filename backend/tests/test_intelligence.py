"""
Phase 4 tests — skill gap engine, course coverage, career-skill mappings,
course-skill mappings, priority calculation, edge cases.
"""
import uuid
import pytest
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.courses import Course
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.models.mappings import CourseSkillMapping, CareerRoleSkill


# ── Fixtures / Helpers ───────────────────────────────────────────────────────

def _get_user_profile(db_session, email="student@iubat.edu"):
    from app.models.users import User
    user = db_session.query(User).filter(User.email == email).first()
    profile = db_session.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    return user, profile


def _get_or_create_skill(db_session, name, category="Programming"):
    skill = db_session.query(Skill).filter(Skill.name == name).first()
    if not skill:
        skill = Skill(id=str(uuid.uuid4()), name=name, category=category)
        db_session.add(skill)
        db_session.flush()
    return skill


def _get_or_create_career_role(db_session, name):
    role = db_session.query(CareerRole).filter(CareerRole.name == name).first()
    if not role:
        role = CareerRole(id=str(uuid.uuid4()), name=name, description="Test role")
        db_session.add(role)
        db_session.flush()
    return role


# ── Course-Skill Mapping Tests ────────────────────────────────────────────────

def test_course_skill_mapping_exists(db_session):
    """course_skill_mappings table should be accessible."""
    count = db_session.query(CourseSkillMapping).count()
    assert count >= 0  # Table exists


def test_course_skill_mapping_unique_constraint(db_session):
    """Cannot insert duplicate (course_id, skill_id) pairs."""
    from sqlalchemy.exc import IntegrityError
    skill = _get_or_create_skill(db_session, "UniqueTestSkill")
    course = db_session.query(Course).first()
    assert course is not None

    m1 = CourseSkillMapping(
        id=str(uuid.uuid4()),
        course_id=course.id,
        skill_id=skill.id,
        relevance_weight=0.5,
        source="test"
    )
    db_session.add(m1)
    db_session.flush()

    m2 = CourseSkillMapping(
        id=str(uuid.uuid4()),
        course_id=course.id,
        skill_id=skill.id,
        relevance_weight=0.8,
        source="test"
    )
    db_session.add(m2)
    with pytest.raises(IntegrityError):
        db_session.flush()
    db_session.rollback()


# ── Career-Skill Mapping Tests ────────────────────────────────────────────────

def test_career_role_skill_exists(db_session):
    """career_role_skills table should be accessible."""
    count = db_session.query(CareerRoleSkill).count()
    assert count >= 0


def test_career_role_skill_unique_constraint(db_session):
    """Cannot insert duplicate (career_role_id, skill_id) pairs."""
    from sqlalchemy.exc import IntegrityError
    role = _get_or_create_career_role(db_session, "UniqueTestRole")
    skill = _get_or_create_skill(db_session, "UniqueCareerSkill")

    r1 = CareerRoleSkill(
        id=str(uuid.uuid4()),
        career_role_id=role.id,
        skill_id=skill.id,
        importance=4,
        minimum_rating=3
    )
    db_session.add(r1)
    db_session.flush()

    r2 = CareerRoleSkill(
        id=str(uuid.uuid4()),
        career_role_id=role.id,
        skill_id=skill.id,
        importance=5,
        minimum_rating=4
    )
    db_session.add(r2)
    with pytest.raises(IntegrityError):
        db_session.flush()
    db_session.rollback()


# ── Skill Gap Tests ────────────────────────────────────────────────────────────

def _setup_career_with_skill(db_session, profile, email="student@iubat.edu"):
    """Helper: set up a career role with one required skill for a student."""
    role = _get_or_create_career_role(db_session, "GapTestRole_" + str(uuid.uuid4())[:8])
    skill = _get_or_create_skill(db_session, "GapTestSkill_" + str(uuid.uuid4())[:8])

    req = CareerRoleSkill(
        id=str(uuid.uuid4()),
        career_role_id=role.id,
        skill_id=skill.id,
        importance=5,
        minimum_rating=4
    )
    db_session.add(req)

    # Set student's career interest
    existing_interest = db_session.query(StudentCareerInterest).filter(
        StudentCareerInterest.student_profile_id == profile.id
    ).first()
    if existing_interest:
        existing_interest.career_role_id = role.id
        existing_interest.is_still_exploring = False
    else:
        db_session.add(StudentCareerInterest(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            career_role_id=role.id,
            is_still_exploring=False
        ))
    db_session.flush()
    return role, skill


def test_skill_gap_still_exploring(client, auth_headers, db_session):
    """Student with no career gets STILL_EXPLORING status."""
    _, profile = _get_user_profile(db_session)

    # Set still_exploring
    existing = db_session.query(StudentCareerInterest).filter(
        StudentCareerInterest.student_profile_id == profile.id
    ).first()
    if existing:
        existing.is_still_exploring = True
        existing.career_role_id = None
    else:
        db_session.add(StudentCareerInterest(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            career_role_id=None,
            is_still_exploring=True
        ))
    db_session.flush()

    response = client.get("/students/me/skill-gaps", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "STILL_EXPLORING"
    assert data["gaps"] == []


def test_skill_gap_missing_skill(client, auth_headers, db_session):
    """Student with career but no skills gets all skills as MISSING with CRITICAL/HIGH priority."""
    _, profile = _get_user_profile(db_session)
    role, skill = _setup_career_with_skill(db_session, profile)

    # Remove any student skill for this skill
    db_session.query(StudentSkill).filter(
        StudentSkill.student_profile_id == profile.id,
        StudentSkill.skill_id == skill.id
    ).delete()
    db_session.flush()

    response = client.get("/students/me/skill-gaps", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ANALYSIS_COMPLETE"

    # Find the gap for our test skill
    gap = next((g for g in data["gaps"] if g["skill_id"] == skill.id), None)
    assert gap is not None
    assert gap["evidence"] == "MISSING"
    assert gap["current_rating"] is None
    assert gap["gap"] == 4  # minimum_rating=4, no skill = gap of 4


def test_skill_gap_self_rated_below_minimum(client, auth_headers, db_session):
    """Student rating below minimum shows a gap."""
    _, profile = _get_user_profile(db_session)
    role, skill = _setup_career_with_skill(db_session, profile)

    # Add skill with rating 2 (minimum is 4)
    existing = db_session.query(StudentSkill).filter(
        StudentSkill.student_profile_id == profile.id,
        StudentSkill.skill_id == skill.id
    ).first()
    if existing:
        existing.self_rating = 2
        existing.verification_status = VerificationStatus.NOT_VERIFIED
    else:
        db_session.add(StudentSkill(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            skill_id=skill.id,
            self_rating=2,
            verification_status=VerificationStatus.NOT_VERIFIED
        ))
    db_session.flush()

    response = client.get("/students/me/skill-gaps", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    gap = next((g for g in data["gaps"] if g["skill_id"] == skill.id), None)
    assert gap is not None
    assert gap["gap"] == 2  # minimum 4 - current 2 = 2
    assert gap["evidence"] == "SELF_RATED"
    assert gap["priority"] in ("CRITICAL", "HIGH", "MEDIUM")


def test_skill_gap_met(client, auth_headers, db_session):
    """Student with rating >= minimum shows NO_GAP."""
    _, profile = _get_user_profile(db_session)
    role, skill = _setup_career_with_skill(db_session, profile)

    existing = db_session.query(StudentSkill).filter(
        StudentSkill.student_profile_id == profile.id,
        StudentSkill.skill_id == skill.id
    ).first()
    if existing:
        existing.self_rating = 5
    else:
        db_session.add(StudentSkill(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            skill_id=skill.id,
            self_rating=5,
            verification_status=VerificationStatus.NOT_VERIFIED
        ))
    db_session.flush()

    response = client.get("/students/me/skill-gaps", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    gap = next((g for g in data["gaps"] if g["skill_id"] == skill.id), None)
    assert gap is not None
    assert gap["gap"] == 0
    assert gap["priority"] == "NO_GAP"


def test_skill_gap_verified_skill_uses_verified_rating(client, auth_headers, db_session):
    """When skill is verified, verified_rating is used for gap calculation."""
    _, profile = _get_user_profile(db_session)
    role, skill = _setup_career_with_skill(db_session, profile)

    existing = db_session.query(StudentSkill).filter(
        StudentSkill.student_profile_id == profile.id,
        StudentSkill.skill_id == skill.id
    ).first()
    if existing:
        existing.self_rating = 2
        existing.verified_rating = 4
        existing.verification_status = VerificationStatus.VERIFIED
    else:
        db_session.add(StudentSkill(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            skill_id=skill.id,
            self_rating=2,
            verified_rating=4,
            verification_status=VerificationStatus.VERIFIED
        ))
    db_session.flush()

    response = client.get("/students/me/skill-gaps", headers=auth_headers)
    assert response.status_code == 200
    gap = next((g for g in response.json()["gaps"] if g["skill_id"] == skill.id), None)
    assert gap is not None
    assert gap["evidence"] == "VERIFIED"
    assert gap["gap"] == 0  # verified_rating 4 >= minimum 4


def test_skill_gap_academic_support_completed(client, auth_headers, db_session):
    """Skill covered by a completed course is shown as COMPLETED in academic_support."""
    _, profile = _get_user_profile(db_session)
    role, skill = _setup_career_with_skill(db_session, profile)

    # Map the skill to a test course
    course = db_session.query(Course).first()
    existing_map = db_session.query(CourseSkillMapping).filter(
        CourseSkillMapping.course_id == course.id,
        CourseSkillMapping.skill_id == skill.id
    ).first()
    if not existing_map:
        db_session.add(CourseSkillMapping(
            id=str(uuid.uuid4()),
            course_id=course.id,
            skill_id=skill.id,
            relevance_weight=0.9,
            source="test"
        ))
        db_session.flush()

    # Mark course as completed
    existing_progress = db_session.query(StudentCourseProgress).filter(
        StudentCourseProgress.student_profile_id == profile.id,
        StudentCourseProgress.course_id == course.id
    ).first()
    if existing_progress:
        existing_progress.status = ProgressStatus.COMPLETED
    else:
        db_session.add(StudentCourseProgress(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            course_id=course.id,
            status=ProgressStatus.COMPLETED
        ))
    db_session.flush()

    response = client.get("/students/me/skill-gaps", headers=auth_headers)
    assert response.status_code == 200
    gap = next((g for g in response.json()["gaps"] if g["skill_id"] == skill.id), None)
    assert gap is not None
    assert course.course_code in gap["academic_support"]["completed_courses"]


def test_skill_gap_requires_auth(client):
    """Skill gap endpoint requires authentication."""
    response = client.get("/students/me/skill-gaps")
    assert response.status_code == 401


# ── Course Coverage Tests ─────────────────────────────────────────────────────

def test_course_coverage_shape(client, auth_headers):
    """GET /students/me/course-coverage returns expected structure."""
    response = client.get("/students/me/course-coverage", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "skills" in data
    assert isinstance(data["skills"], list)


def test_course_coverage_requires_auth(client):
    """Course coverage endpoint requires authentication."""
    response = client.get("/students/me/course-coverage")
    assert response.status_code == 401


def test_course_coverage_ongoing_course(client, auth_headers, db_session):
    """Course currently being taken shows as IN_PROGRESS in coverage."""
    _, profile = _get_user_profile(db_session)

    skill = _get_or_create_skill(db_session, "CoverageTestSkill_" + str(uuid.uuid4())[:8])
    course = db_session.query(Course).filter(Course.course_code == "CSC 101").first()
    assert course is not None

    # Map skill to course
    existing_map = db_session.query(CourseSkillMapping).filter(
        CourseSkillMapping.course_id == course.id,
        CourseSkillMapping.skill_id == skill.id
    ).first()
    if not existing_map:
        db_session.add(CourseSkillMapping(
            id=str(uuid.uuid4()),
            course_id=course.id,
            skill_id=skill.id,
            relevance_weight=0.7,
            source="test"
        ))

    # Add skill to student
    existing_ss = db_session.query(StudentSkill).filter(
        StudentSkill.student_profile_id == profile.id,
        StudentSkill.skill_id == skill.id
    ).first()
    if not existing_ss:
        db_session.add(StudentSkill(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            skill_id=skill.id,
            self_rating=3,
            verification_status=VerificationStatus.NOT_VERIFIED
        ))

    # Mark course IN_PROGRESS
    existing_progress = db_session.query(StudentCourseProgress).filter(
        StudentCourseProgress.student_profile_id == profile.id,
        StudentCourseProgress.course_id == course.id
    ).first()
    if existing_progress:
        existing_progress.status = ProgressStatus.IN_PROGRESS
    else:
        db_session.add(StudentCourseProgress(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            course_id=course.id,
            status=ProgressStatus.IN_PROGRESS
        ))
    db_session.flush()

    response = client.get("/students/me/course-coverage", headers=auth_headers)
    assert response.status_code == 200
    skills = response.json()["skills"]
    skill_entry = next((s for s in skills if s["skill_id"] == skill.id), None)
    assert skill_entry is not None
    course_entry = next((c for c in skill_entry["covered_by"] if c["course_code"] == "CSC 101"), None)
    assert course_entry is not None
    assert course_entry["status"] == "IN_PROGRESS"


# ── Student Isolation ─────────────────────────────────────────────────────────

def test_skill_gap_student_isolation(client, auth_headers, auth_headers_b):
    """Two students get independent skill gap analyses."""
    resp_a = client.get("/students/me/skill-gaps", headers=auth_headers)
    resp_b = client.get("/students/me/skill-gaps", headers=auth_headers_b)
    assert resp_a.status_code == 200
    assert resp_b.status_code == 200
    # They may differ in content but both are valid responses
    assert "status" in resp_a.json()
    assert "status" in resp_b.json()


# ── Priority Calculation Tests ────────────────────────────────────────────────

def test_priority_score_deterministic(client, auth_headers, db_session):
    """Same student data always produces the same priority."""
    r1 = client.get("/students/me/skill-gaps", headers=auth_headers)
    r2 = client.get("/students/me/skill-gaps", headers=auth_headers)
    assert r1.status_code == 200
    assert r2.status_code == 200
    # Results must be identical
    assert r1.json() == r2.json()


# ── Context includes academic_intelligence ────────────────────────────────────

def test_context_includes_academic_intelligence(client, auth_headers):
    """GET /students/me/context now includes academic_intelligence."""
    response = client.get("/students/me/context", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "academic_intelligence" in data
    ai = data["academic_intelligence"]
    assert "target_role" in ai
    assert "gap_status" in ai
    assert "top_gaps" in ai
    assert "academic_coverage" in ai
    assert isinstance(ai["top_gaps"], list)
    assert isinstance(ai["academic_coverage"], dict)

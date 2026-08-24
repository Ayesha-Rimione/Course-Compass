import uuid
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.mappings import CareerRoleSkill
from app.models.students import StudentProfile


def test_roadmap_still_exploring(client, auth_headers, db_session):
    """When a student is exploring, readiness should return 0 with safe summary."""
    # Ensure student is exploring
    resp = client.put(
        "/career-interests/me",
        headers=auth_headers,
        json={"career_role_id": None, "is_still_exploring": True},
    )
    assert resp.status_code == 200

    resp = client.get("/students/me/roadmap", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["overall_readiness_percentage"] == 0
    assert data["percent"] == 0
    assert data["current_level"] == "Exploring"
    assert "exploring" in data["summary"].lower()


def test_roadmap_with_career_and_skills(client, auth_headers, db_session):
    """Readiness is calculated deterministically with weighted CORE skills."""
    user_id = db_session.query(StudentProfile).first().user_id
    profile = db_session.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

    # Create role and required skills
    role = CareerRole(
        id=str(uuid.uuid4()),
        name="Test Fullstack Lead",
        category="Software Engineering",
        target_readiness_level=85,
    )
    db_session.add(role)

    s1 = Skill(id=str(uuid.uuid4()), name="Skill Alpha", category="Backend")
    s2 = Skill(id=str(uuid.uuid4()), name="Skill Beta", category="Frontend")
    db_session.add_all([s1, s2])
    db_session.flush()

    crs1 = CareerRoleSkill(
        id=str(uuid.uuid4()),
        career_role_id=role.id,
        skill_id=s1.id,
        importance=5,
        importance_level="CORE",
        minimum_rating=4,
    )
    crs2 = CareerRoleSkill(
        id=str(uuid.uuid4()),
        career_role_id=role.id,
        skill_id=s2.id,
        importance=3,
        importance_level="IMPORTANT",
        minimum_rating=3,
    )
    db_session.add_all([crs1, crs2])

    # Assign career interest
    ci = db_session.query(StudentCareerInterest).filter(StudentCareerInterest.student_profile_id == profile.id).first()
    if not ci:
        ci = StudentCareerInterest(student_profile_id=profile.id, career_role_id=role.id, is_still_exploring=False)
        db_session.add(ci)
    else:
        ci.career_role_id = role.id
        ci.is_still_exploring = False

    # Add verified skill for s1 (4/4) and self-rated for s2 (2/3)
    db_session.add_all([
        StudentSkill(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            skill_id=s1.id,
            self_rating=4,
            verified_rating=4,
            verification_status=VerificationStatus.VERIFIED,
        ),
        StudentSkill(
            id=str(uuid.uuid4()),
            student_profile_id=profile.id,
            skill_id=s2.id,
            self_rating=2,
            verified_rating=None,
            verification_status=VerificationStatus.NOT_VERIFIED,
        ),
    ])
    db_session.commit()

    resp = client.get("/students/me/roadmap", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_role"] == "Test Fullstack Lead"
    assert data["overall_readiness_percentage"] > 0
    assert len(data["gaps"]) == 2
    assert len(data["radar"]) >= 1
    assert "formula_explanation" in data

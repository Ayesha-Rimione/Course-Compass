import uuid
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.mappings import CareerRoleSkill
from app.models.students import StudentProfile


def test_planning_still_exploring(client, auth_headers):
    """When exploring, planning returns exploratory recommendations."""
    client.put(
        "/career-interests/me",
        headers=auth_headers,
        json={"career_role_id": None, "is_still_exploring": True},
    )

    resp = client.get("/students/me/planning", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "weekly" in data
    assert "monthly" in data
    assert "semester" in data
    assert len(data["weekly"]) > 0
    assert data["weekly"][0]["reason"] is not None


def test_planning_with_career_role(client, auth_headers, db_session):
    """Planning generates deterministic recommendations explaining WHY they exist."""
    user_id = db_session.query(StudentProfile).first().user_id
    profile = db_session.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()

    role = CareerRole(
        id=str(uuid.uuid4()),
        name="Security Analyst",
        category="Infrastructure & Security",
    )
    db_session.add(role)

    s1 = Skill(id=str(uuid.uuid4()), name="Network Defense", category="Security")
    db_session.add(s1)
    db_session.flush()

    crs = CareerRoleSkill(
        id=str(uuid.uuid4()),
        career_role_id=role.id,
        skill_id=s1.id,
        importance=5,
        importance_level="CORE",
        minimum_rating=4,
    )
    db_session.add(crs)

    ci = db_session.query(StudentCareerInterest).filter(StudentCareerInterest.student_profile_id == profile.id).first()
    if not ci:
        ci = StudentCareerInterest(student_profile_id=profile.id, career_role_id=role.id, is_still_exploring=False)
        db_session.add(ci)
    else:
        ci.career_role_id = role.id
        ci.is_still_exploring = False

    db_session.commit()

    resp = client.get("/students/me/planning", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["target_role"] == "Security Analyst"
    assert len(data["weekly"]) > 0
    # Every item must have a clear reason
    for item in data["weekly"] + data["monthly"] + data["semester"]:
        assert len(item["reason"]) > 0
        assert "Security Analyst" in item["reason"] or "rating" in item["reason"] or "CGPA" in item["reason"] or "gap" in item["reason"] or "confidence" in item["reason"]

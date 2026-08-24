"""
Phase 3 Verification tests — start attempt, retrieve history.
"""
from app.models.skills import Skill


def _get_sql_skill_id(db_session) -> str:
    skill = db_session.query(Skill).filter(Skill.name == "SQL").first()
    assert skill is not None, "SQL skill not seeded"
    return skill.id


def test_start_verification(client, auth_headers, db_session):
    """POST /students/me/skills/{skill_id}/verification/start creates an attempt."""
    skill_id = _get_sql_skill_id(db_session)

    # Must have skill in profile first
    client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 3},
        headers=auth_headers
    )

    response = client.post(
        f"/students/me/skills/{skill_id}/verification/start",
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["skill_name"] == "SQL"
    assert data["status"] == "IN_PROGRESS"
    assert data["attempt_number"] >= 1


def test_verification_history(client, auth_headers, db_session):
    """GET /students/me/skills/{skill_id}/verification returns attempt history."""
    skill_id = _get_sql_skill_id(db_session)

    # Ensure skill in profile
    client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 3},
        headers=auth_headers
    )
    # Start at least one attempt
    client.post(
        f"/students/me/skills/{skill_id}/verification/start",
        headers=auth_headers
    )

    response = client.get(
        f"/students/me/skills/{skill_id}/verification",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["skill_name"] == "SQL"
    assert data["total_attempts"] >= 1
    assert isinstance(data["attempts"], list)
    assert len(data["attempts"]) >= 1


def test_start_verification_requires_skill_in_profile(client, auth_headers, db_session):
    """Cannot start verification for a skill not in the student's profile."""
    # Use Python skill but ensure it's NOT in the profile
    skill = db_session.query(Skill).filter(Skill.name == "Python").first()
    # Delete from profile first if present
    client.delete(f"/students/me/skills/{skill.id}", headers=auth_headers)

    response = client.post(
        f"/students/me/skills/{skill.id}/verification/start",
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "add this skill" in response.json()["detail"]

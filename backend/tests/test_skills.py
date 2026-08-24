"""
Phase 3 Skills tests — covers catalog, add, update, delete, duplicate, invalid rating.
"""
from app.models.skills import Skill


def _get_python_skill_id(db_session) -> str:
    skill = db_session.query(Skill).filter(Skill.name == "Python").first()
    assert skill is not None, "Python skill not seeded in test DB"
    return skill.id


def _get_js_skill_id(db_session) -> str:
    skill = db_session.query(Skill).filter(Skill.name == "JavaScript").first()
    assert skill is not None, "JavaScript skill not seeded in test DB"
    return skill.id


def test_skills_catalog(client):
    """GET /skills returns a list of skills (no auth required)."""
    response = client.get("/skills")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    names = [s["name"] for s in data]
    assert "Python" in names


def test_add_student_skill(client, auth_headers, db_session):
    """POST /students/me/skills adds a skill to the student profile."""
    skill_id = _get_python_skill_id(db_session)
    response = client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 4},
        headers=auth_headers
    )
    assert response.status_code == 201
    data = response.json()
    assert data["skill_name"] == "Python"
    assert data["self_rating"] == 4
    assert data["verification_status"] == "NOT_VERIFIED"


def test_update_student_skill(client, auth_headers, db_session):
    """PUT /students/me/skills/{skill_id} updates the self_rating."""
    skill_id = _get_python_skill_id(db_session)
    # Add if not present
    client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 3},
        headers=auth_headers
    )
    response = client.put(
        f"/students/me/skills/{skill_id}",
        json={"self_rating": 5},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["self_rating"] == 5


def test_delete_student_skill(client, auth_headers, db_session):
    """DELETE /students/me/skills/{skill_id} removes the skill."""
    skill_id = _get_js_skill_id(db_session)
    client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 2},
        headers=auth_headers
    )
    del_response = client.delete(
        f"/students/me/skills/{skill_id}",
        headers=auth_headers
    )
    assert del_response.status_code == 204

    # Verify it's gone
    list_response = client.get("/students/me/skills", headers=auth_headers)
    names = [s["skill_name"] for s in list_response.json()]
    assert "JavaScript" not in names


def test_duplicate_student_skill_prevention(client, auth_headers, db_session):
    """POST /students/me/skills with same skill_id returns 400."""
    skill_id = _get_python_skill_id(db_session)
    # First add may already exist from previous test — that's OK
    client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 3},
        headers=auth_headers
    )
    # Second add must fail
    response = client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 3},
        headers=auth_headers
    )
    assert response.status_code == 400
    assert "already added" in response.json()["detail"]


def test_invalid_self_rating_too_low(client, auth_headers, db_session):
    """self_rating below 1 is rejected."""
    skill_id = _get_python_skill_id(db_session)
    response = client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 0},
        headers=auth_headers
    )
    assert response.status_code == 422


def test_invalid_self_rating_too_high(client, auth_headers, db_session):
    """self_rating above 5 is rejected."""
    skill_id = _get_python_skill_id(db_session)
    response = client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 6},
        headers=auth_headers
    )
    assert response.status_code == 422


def test_student_skill_isolation(client, auth_headers, auth_headers_b, db_session):
    """Student B cannot see Student A's skills."""
    skill_id = _get_python_skill_id(db_session)
    # Ensure student A has the skill
    client.post(
        "/students/me/skills",
        json={"skill_id": skill_id, "self_rating": 4},
        headers=auth_headers
    )
    # Student B's skills should be empty or not include Python added by A
    response_b = client.get("/students/me/skills", headers=auth_headers_b)
    assert response_b.status_code == 200
    skill_ids_b = [s["skill_id"] for s in response_b.json()]
    # B should not see A's record
    # We simply verify B's list is independent (could be empty)
    response_a = client.get("/students/me/skills", headers=auth_headers)
    assert response_a.status_code == 200
    # Both are valid lists but different profile IDs
    if response_b.json():
        profile_ids_b = {s["student_profile_id"] for s in response_b.json()}
        profile_ids_a = {s["student_profile_id"] for s in response_a.json()}
        assert profile_ids_a.isdisjoint(profile_ids_b)

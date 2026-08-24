"""
Phase 3 Career tests — catalog, select role, still exploring, invalid state.
"""
from app.models.careers import CareerRole


def _get_backend_role_id(db_session) -> str:
    role = db_session.query(CareerRole).filter(CareerRole.name == "Backend Engineer").first()
    assert role is not None, "Backend Engineer role not seeded"
    return role.id


def test_career_roles_catalog(client):
    """GET /career-roles returns career role list (no auth required)."""
    response = client.get("/career-roles")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    names = [r["name"] for r in data]
    assert "Backend Engineer" in names


def test_select_career_role(client, auth_headers, db_session):
    """PUT /career-interests/me with a valid career_role_id succeeds."""
    role_id = _get_backend_role_id(db_session)
    response = client.put(
        "/career-interests/me",
        json={"career_role_id": role_id, "is_still_exploring": False},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["career_role_id"] == role_id
    assert data["career_role_name"] == "Backend Engineer"
    assert data["is_still_exploring"] is False


def test_still_exploring(client, auth_headers):
    """PUT /career-interests/me with is_still_exploring=True succeeds."""
    response = client.put(
        "/career-interests/me",
        json={"career_role_id": None, "is_still_exploring": True},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["is_still_exploring"] is True
    assert data["career_role_id"] is None


def test_invalid_career_interest_state(client, auth_headers):
    """PUT with career_role_id=None AND is_still_exploring=False returns 422."""
    response = client.put(
        "/career-interests/me",
        json={"career_role_id": None, "is_still_exploring": False},
        headers=auth_headers
    )
    assert response.status_code == 422


def test_get_career_interest(client, auth_headers, db_session):
    """GET /career-interests/me returns current interest."""
    role_id = _get_backend_role_id(db_session)
    # Set a known state first
    client.put(
        "/career-interests/me",
        json={"career_role_id": role_id, "is_still_exploring": False},
        headers=auth_headers
    )
    response = client.get("/career-interests/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["career_role_id"] == role_id


def test_invalid_career_role_id(client, auth_headers):
    """PUT with a non-existent career_role_id returns 404."""
    response = client.put(
        "/career-interests/me",
        json={"career_role_id": "non-existent-uuid", "is_still_exploring": False},
        headers=auth_headers
    )
    assert response.status_code == 404

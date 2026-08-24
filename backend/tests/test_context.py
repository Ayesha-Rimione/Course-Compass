"""
Phase 3 Student Context tests — GET /students/me/context
"""


def test_student_context_shape(client, auth_headers):
    """GET /students/me/context returns all top-level keys."""
    response = client.get("/students/me/context", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    assert "student_profile" in data
    assert "curriculum" in data
    assert "skills" in data
    assert "career_interest" in data
    assert "verifications" in data


def test_student_context_no_secrets(client, auth_headers):
    """Context must NOT contain auth secrets."""
    response = client.get("/students/me/context", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()

    context_str = str(data)
    forbidden_keys = ["password", "code_hash", "jwt", "secret", "access_token", "otp"]
    for key in forbidden_keys:
        assert key not in context_str.lower(), f"Secret '{key}' found in context response!"


def test_student_context_curriculum_counts(client, auth_headers):
    """Curriculum summary has valid numeric counts."""
    response = client.get("/students/me/context", headers=auth_headers)
    assert response.status_code == 200
    curriculum = response.json()["curriculum"]

    assert "total_courses" in curriculum
    assert "completed_courses" in curriculum
    assert "in_progress_courses" in curriculum
    assert "remaining_courses" in curriculum
    assert curriculum["total_courses"] >= 0
    assert curriculum["remaining_courses"] >= 0


def test_student_context_skills_structure(client, auth_headers):
    """Skills section has self_rated, verified, unverified lists."""
    response = client.get("/students/me/context", headers=auth_headers)
    assert response.status_code == 200
    skills = response.json()["skills"]

    assert "self_rated" in skills
    assert "verified" in skills
    assert "unverified" in skills
    assert isinstance(skills["self_rated"], list)
    assert isinstance(skills["verified"], list)
    assert isinstance(skills["unverified"], list)


def test_student_context_requires_auth(client):
    """Context endpoint requires authentication."""
    response = client.get("/students/me/context")
    assert response.status_code == 401


def test_student_context_isolation(client, auth_headers, auth_headers_b):
    """Two different students get different context objects."""
    resp_a = client.get("/students/me/context", headers=auth_headers)
    resp_b = client.get("/students/me/context", headers=auth_headers_b)
    assert resp_a.status_code == 200
    assert resp_b.status_code == 200
    profile_a = resp_a.json()["student_profile"]
    profile_b = resp_b.json()["student_profile"]
    assert profile_a["id"] != profile_b["id"]
    assert profile_a["email"] != profile_b["email"]

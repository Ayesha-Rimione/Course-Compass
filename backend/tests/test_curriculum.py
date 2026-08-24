def test_curriculum_incomplete_profile(client, auth_headers):
    # Ensure semester is None
    client.put("/students/me", json={"current_semester": None}, headers=auth_headers)

    response = client.get("/curriculum/me", headers=auth_headers)
    assert response.status_code == 400
    assert "Incomplete student profile" in response.json()["detail"]


def test_curriculum_complete_profile(client, auth_headers):
    # Update profile to complete state
    client.put(
        "/students/me",
        json={
            "department": "Department of Computer Science & Engineering",
            "program": "B.Sc. in Computer Science & Engineering",
            "current_semester": 5
        },
        headers=auth_headers
    )

    response = client.get("/curriculum/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["department"] == "Department of Computer Science & Engineering"
    assert data["current_semester"] == 5
    assert "total_courses" in data
    assert len(data["courses"]) >= 1

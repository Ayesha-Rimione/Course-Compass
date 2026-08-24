def test_get_student_profile(client, auth_headers):
    response = client.get("/students/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "student@iubat.edu"
    assert data["university"] == "IUBAT"


def test_update_student_profile(client, auth_headers):
    payload = {
        "student_id": "21103042",
        "full_name": "Nusrat Jahan",
        "batch": "51st",
        "current_semester": 6,
        "cgpa": 3.75
    }
    response = client.put("/students/me", json=payload, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["student_id"] == "21103042"
    assert data["full_name"] == "Nusrat Jahan"
    assert data["batch"] == "51st"
    assert data["current_semester"] == 6
    assert data["cgpa"] == 3.75

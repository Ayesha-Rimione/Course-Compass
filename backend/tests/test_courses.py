def test_list_courses(client):
    response = client.get("/courses")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


def test_list_courses_with_filter(client):
    response = client.get("/courses?semester=1")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["semester"] == 1


def test_get_course_detail(client):
    response = client.get("/courses/CSC%20101")
    assert response.status_code == 200
    data = response.json()
    assert data["course_code"] == "CSC 101"
    assert data["course_name"] == "Introduction to Computer Studies"


def test_get_course_not_found(client):
    response = client.get("/courses/UNKNOWN999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

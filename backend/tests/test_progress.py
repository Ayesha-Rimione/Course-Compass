def test_course_progress_workflow(client, auth_headers):
    # 1. Add course progress
    post_payload = {
        "course_code": "CSC 101",
        "status": "COMPLETED",
        "grade": "A",
        "self_rating": 5
    }
    res_add = client.post("/students/me/courses", json=post_payload, headers=auth_headers)
    assert res_add.status_code == 201
    data_add = res_add.json()
    assert data_add["course_code"] == "CSC 101"
    assert data_add["status"] == "COMPLETED"
    assert data_add["grade"] == "A"
    assert data_add["self_rating"] == 5

    # 2. Prevent duplicate progress POST
    res_dup = client.post("/students/me/courses", json=post_payload, headers=auth_headers)
    assert res_dup.status_code == 400
    assert "already exists" in res_dup.json()["detail"]

    # 3. List progress
    res_list = client.get("/students/me/courses", headers=auth_headers)
    assert res_list.status_code == 200
    list_data = res_list.json()
    assert len(list_data) == 1
    assert list_data[0]["course_code"] == "CSC 101"

    # 4. Update progress via PUT
    put_payload = {
        "status": "COMPLETED",
        "grade": "A-",
        "self_rating": 4
    }
    res_put = client.put("/students/me/courses/CSC%20101", json=put_payload, headers=auth_headers)
    assert res_put.status_code == 200
    data_put = res_put.json()
    assert data_put["grade"] == "A-"
    assert data_put["self_rating"] == 4

def test_student_projects_crud(client, auth_headers):
    # 1. Create project
    create_resp = client.post("/students/me/projects", json={
        "title": "Portfolio System",
        "description": "Student portfolio with GitHub import",
        "tech_stack": "React, FastAPI, PostgreSQL",
        "github_url": "https://github.com/test/portfolio",
        "live_url": "https://portfolio.demo"
    }, headers=auth_headers)
    assert create_resp.status_code == 201
    data = create_resp.json()
    assert data["title"] == "Portfolio System"
    project_id = data["id"]

    # 2. List projects
    list_resp = client.get("/students/me/projects", headers=auth_headers)
    assert list_resp.status_code == 200
    projects = list_resp.json()
    assert any(p["id"] == project_id for p in projects)

    # 3. Delete project
    del_resp = client.delete(f"/students/me/projects/{project_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # 4. Verify deleted
    list_resp2 = client.get("/students/me/projects", headers=auth_headers)
    assert not any(p["id"] == project_id for p in list_resp2.json())


def test_student_certifications_crud(client, auth_headers):
    # 1. Create certification
    create_resp = client.post("/students/me/certifications", json={
        "name": "AWS Certified Solutions Architect",
        "issuer": "Amazon Web Services",
        "issue_date": "2024-01",
        "expiry_date": "2027-01",
        "credential_id": "AWS-001",
        "credential_url": "https://aws.amazon.com/verify"
    }, headers=auth_headers)
    assert create_resp.status_code == 201
    data = create_resp.json()
    assert data["name"] == "AWS Certified Solutions Architect"
    cert_id = data["id"]

    # 2. List certifications
    list_resp = client.get("/students/me/certifications", headers=auth_headers)
    assert list_resp.status_code == 200
    certs = list_resp.json()
    assert any(c["id"] == cert_id for c in certs)

    # 3. Delete certification
    del_resp = client.delete(f"/students/me/certifications/{cert_id}", headers=auth_headers)
    assert del_resp.status_code == 204


def test_student_batch_courses(client, auth_headers):
    # Batch update course progress
    batch_resp = client.post("/students/me/courses/batch", json=[
        {"code": "CSC 101", "grade": "A", "rating": 5},
        {"code": "ENG 101", "grade": "A-", "rating": 4},
    ], headers=auth_headers)
    assert batch_resp.status_code == 200
    progress_list = batch_resp.json()
    codes = [p["course_code"] for p in progress_list]
    assert "CSC 101" in codes
    assert "ENG 101" in codes

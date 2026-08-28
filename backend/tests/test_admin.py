def test_admin_endpoints_forbidden_for_students(client, auth_headers):
    # Regular students should receive 403 Forbidden
    resp = client.get("/admin/analytics", headers=auth_headers)
    assert resp.status_code == 403

    resp_students = client.get("/admin/students", headers=auth_headers)
    assert resp_students.status_code == 403


def test_admin_analytics(client, admin_auth_headers):
    resp = client.get("/admin/analytics", headers=admin_auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_students" in data
    assert "total_courses" in data
    assert "average_cgpa" in data
    assert "semester_distribution" in data


def test_admin_students_list_and_detail(client, admin_auth_headers, auth_headers):
    # Fetch list
    resp = client.get("/admin/students", headers=admin_auth_headers)
    assert resp.status_code == 200
    students = resp.json()
    assert len(students) >= 1

    # Deep dive
    user_id = students[0]["user_id"]
    detail_resp = client.get(f"/admin/students/{user_id}", headers=admin_auth_headers)
    assert detail_resp.status_code == 200
    detail = detail_resp.json()
    assert "profile" in detail
    assert "courses" in detail
    assert "projects" in detail


def test_admin_course_crud_and_governance(client, admin_auth_headers):
    # 1. Create course
    new_course = {
        "course_code": "CSE 495",
        "course_name": "Distributed Cloud Systems",
        "credit_hours": 3.0,
        "semester": 8,
        "description": "Design and architecture of distributed cloud systems."
    }
    create_resp = client.post("/admin/courses", json=new_course, headers=admin_auth_headers)
    assert create_resp.status_code == 201
    assert create_resp.json()["course_code"] == "CSE 495"

    # 2. Update course
    update_resp = client.put("/admin/courses/CSE 495", json={
        "course_name": "Distributed Cloud & Edge Systems",
        "credit_hours": 4.0
    }, headers=admin_auth_headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["credit_hours"] == 4.0

    # 3. Update topics
    topics_payload = [
        {"topic_name": "Raft & Paxos Consensus"},
        {"topic_name": "Service Meshes & Envoy"},
        {"topic_name": "Event-Driven Microservices"}
    ]
    topic_resp = client.post("/admin/courses/CSE 495/topics", json=topics_payload, headers=admin_auth_headers)
    assert topic_resp.status_code == 200
    topics = topic_resp.json()
    assert len(topics) == 3
    assert topics[0]["topic_name"] == "Raft & Paxos Consensus"

    # 4. Update outcomes (COs)
    outcomes_payload = [
        {"outcome_code": "CO1", "description": "Understand distributed consensus and replication."},
        {"outcome_code": "CO2", "description": "Implement microservices using gRPC and Docker."}
    ]
    outcome_resp = client.post("/admin/courses/CSE 495/outcomes", json=outcomes_payload, headers=admin_auth_headers)
    assert outcome_resp.status_code == 200
    outcomes = outcome_resp.json()
    assert len(outcomes) == 2
    assert outcomes[0]["outcome_code"] == "CO1"

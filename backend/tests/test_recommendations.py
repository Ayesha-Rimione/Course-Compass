import uuid
from app.models.skills import Skill
from app.models.careers import CareerRole
from app.models.recommendations import LearningResource, ProjectRecommendation, Certification, JobListing


def test_learning_resources_endpoints(client, auth_headers, db_session):
    """Test public resources catalog and personalized student resources."""
    s = Skill(id=str(uuid.uuid4()), name="Rust", category="Programming")
    db_session.add(s)
    db_session.flush()

    res = LearningResource(
        id=str(uuid.uuid4()),
        title="The Rust Programming Language",
        provider="Rust Foundation",
        url="https://doc.rust-lang.org/book/",
        resource_type="DOCUMENTATION",
        difficulty="Beginner",
        skill_id=s.id,
    )
    db_session.add(res)
    db_session.commit()

    # Public catalog
    resp = client.get("/resources")
    assert resp.status_code == 200
    data = resp.json()
    assert any(r["title"] == "The Rust Programming Language" for r in data)

    # Filter by difficulty
    resp = client.get("/resources?difficulty=Beginner")
    assert resp.status_code == 200

    # Student personalized
    resp = client.get("/students/me/resources", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_project_recommendations_endpoints(client, auth_headers, db_session):
    """Test project catalog and personalized project recommendations."""
    proj = ProjectRecommendation(
        id=str(uuid.uuid4()),
        title="Custom Compiler",
        description="Write a toy compiler in C++.",
        difficulty="Advanced",
        project_type="System Tool",
        skills_demonstrated='["C++", "Algorithms"]',
        technologies='["C++", "LLVM"]',
    )
    db_session.add(proj)
    db_session.commit()

    # Public catalog
    resp = client.get("/projects")
    assert resp.status_code == 200
    data = resp.json()
    assert any(p["title"] == "Custom Compiler" for p in data)

    # Student personalized
    resp = client.get("/students/me/projects", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_certifications_endpoints(client, auth_headers, db_session):
    """Test certification catalog and personalized certifications."""
    cert = Certification(
        id=str(uuid.uuid4()),
        name="Test Professional Certificate",
        provider="Test Provider",
        description="Comprehensive certificate test.",
        url="https://example.com/cert",
        difficulty="Intermediate",
        skills_learned='["Python", "SQL"]',
    )
    db_session.add(cert)
    db_session.commit()

    resp = client.get("/certifications")
    assert resp.status_code == 200
    data = resp.json()
    assert any(c["name"] == "Test Professional Certificate" for c in data)

    resp = client.get("/students/me/certifications", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)


def test_jobs_endpoints(client, auth_headers, db_session):
    """Test sample job listings with is_sample=True check."""
    job = JobListing(
        id=str(uuid.uuid4()),
        role="Junior Systems Engineer",
        company_name="Test Tech BD",
        location="Dhaka",
        employment_type="Full-time",
        experience_level="Junior",
        salary_formatted="৳50,000 / month",
        is_sample=True,
    )
    db_session.add(job)
    db_session.commit()

    resp = client.get("/jobs")
    assert resp.status_code == 200
    data = resp.json()
    assert any(j["role"] == "Junior Systems Engineer" for j in data)
    assert all("is_sample" in j and j["is_sample"] is True for j in data)

    resp = client.get("/students/me/jobs", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.json(), list)

import os
import sys
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base, get_db
from app.main import app
from app.models import Course, User, StudentProfile
from app.models.skills import Skill, VerificationStatus
from app.models.careers import CareerRole
from app.utils.security import create_access_token

TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Pre-populate basic test courses if not present
    c1 = session.query(Course).filter(Course.course_code == "CSC 101").first()
    if not c1:
        session.add_all([
            Course(
                course_code="CSC 101",
                course_name="Introduction to Computer Studies",
                credit_hours=3.0,
                semester=1,
                description="Foundational course in computing.",
                department="Department of Computer Science & Engineering",
                program="B.Sc. in Computer Science & Engineering"
            ),
            Course(
                course_code="ENG 101",
                course_name="Basic English Composition",
                credit_hours=3.0,
                semester=1,
                description="Basic writing and composition.",
                department="Department of Computer Science & Engineering",
                program="B.Sc. in Computer Science & Engineering"
            )
        ])
        session.flush()

    # Pre-populate Phase 3 catalog data if not present
    python_skill = session.query(Skill).filter(Skill.name == "Python").first()
    if not python_skill:
        skills = [
            Skill(id=str(uuid.uuid4()), name="Python", category="Programming"),
            Skill(id=str(uuid.uuid4()), name="JavaScript", category="Programming"),
            Skill(id=str(uuid.uuid4()), name="SQL", category="Database"),
        ]
        session.add_all(skills)
        session.flush()

    backend_role = session.query(CareerRole).filter(CareerRole.name == "Backend Engineer").first()
    if not backend_role:
        roles = [
            CareerRole(id=str(uuid.uuid4()), name="Backend Engineer", description="Build server-side systems."),
            CareerRole(id=str(uuid.uuid4()), name="Data Scientist", description="Analyze data and build models."),
        ]
        session.add_all(roles)
        session.flush()

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(db_session):
    user = db_session.query(User).filter(User.email == "student@iubat.edu").first()
    if not user:
        user = User(email="student@iubat.edu", is_active=True)
        db_session.add(user)
        db_session.flush()

    profile = db_session.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(
            user_id=user.id,
            university="IUBAT",
            department="Department of Computer Science & Engineering",
            program="B.Sc. in Computer Science & Engineering"
        )
        db_session.add(profile)
        db_session.flush()

    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def auth_headers_b(db_session):
    """Second isolated student for ownership/isolation tests."""
    user = db_session.query(User).filter(User.email == "student_b@iubat.edu").first()
    if not user:
        user = User(email="student_b@iubat.edu", is_active=True)
        db_session.add(user)
        db_session.flush()

    profile = db_session.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    if not profile:
        profile = StudentProfile(
            user_id=user.id,
            university="IUBAT",
            department="Department of Computer Science & Engineering",
            program="B.Sc. in Computer Science & Engineering"
        )
        db_session.add(profile)
        db_session.flush()

    token = create_access_token(data={"sub": user.id, "email": user.email})
    return {"Authorization": f"Bearer {token}"}

from app.models.users import OTPCode
from app.utils.security import hash_otp


def test_request_otp_success(client):
    response = client.post("/auth/request-otp", json={"email": "newstudent@iubat.edu"})
    assert response.status_code == 200
    data = response.json()
    assert "OTP code generated" in data["message"]
    assert data["email"] == "newstudent@iubat.edu"


def test_request_otp_invalid_domain(client):
    response = client.post("/auth/request-otp", json={"email": "hacker@unauthorized.com"})
    assert response.status_code == 400
    assert "not allowed" in response.json()["detail"]


def test_verify_otp_invalid_code(client, db_session):
    client.post("/auth/request-otp", json={"email": "verifytest@iubat.edu"})
    response = client.post("/auth/verify-otp", json={"email": "verifytest@iubat.edu", "code": "000000"})
    assert response.status_code == 400
    assert "Invalid OTP code" in response.json()["detail"]


def test_verify_otp_success(client, db_session):
    client.post("/auth/request-otp", json={"email": "successuser@iubat.edu"})

    # Manually extract OTP code hash or override code in test db
    otp = (
        db_session.query(OTPCode)
        .filter(OTPCode.email == "successuser@iubat.edu")
        .order_by(OTPCode.created_at.desc())
        .first()
    )
    test_code = "123456"
    otp.code_hash = hash_otp(test_code)
    db_session.commit()

    response = client.post("/auth/verify-otp", json={"email": "successuser@iubat.edu", "code": test_code})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["email"] == "successuser@iubat.edu"


def test_register_and_login_success(client):
    # Test sign up
    reg_resp = client.post("/auth/register", json={
        "email": "freshman@iubat.edu",
        "password": "pass",
        "full_name": "Freshman Student"
    })
    assert reg_resp.status_code == 201
    reg_data = reg_resp.json()
    assert "access_token" in reg_data
    assert reg_data["email"] == "freshman@iubat.edu"

    # Test login
    login_resp = client.post("/auth/login", json={
        "email": "freshman@iubat.edu",
        "password": "pass"
    })
    assert login_resp.status_code == 200
    login_data = login_resp.json()
    assert "access_token" in login_data
    assert login_data["email"] == "freshman@iubat.edu"


def test_register_invalid_domain(client):
    reg_resp = client.post("/auth/register", json={
        "email": "intruder@gmail.com",
        "password": "pass"
    })
    assert reg_resp.status_code == 400
    assert "not allowed" in reg_resp.json()["detail"]


def test_login_invalid_credentials(client):
    login_resp = client.post("/auth/login", json={
        "email": "freshman@iubat.edu",
        "password": "wrongpassword"
    })
    assert login_resp.status_code == 401


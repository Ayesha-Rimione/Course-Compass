import json


def test_ai_context_contract_and_security(client, auth_headers):
    """
    Verify GET /students/me/ai-context produces the full expected contract
    and NEVER leaks passwords, OTP hashes, JWT secrets, or private tokens.
    """
    resp = client.get("/students/me/ai-context", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    # 1. Structure Verification
    assert "student" in data
    assert "academic" in data
    assert "skills" in data
    assert "career" in data
    assert "readiness" in data
    assert "planning" in data
    assert "recommendations" in data

    # 2. Student Info Checks
    assert data["student"]["email"] == "student@iubat.edu"
    assert data["student"]["university"] == "IUBAT"

    # 3. CRITICAL SECURITY VERIFICATION: No sensitive secrets leaked
    serialized = json.dumps(data).lower()
    forbidden_tokens = [
        "code_hash",
        "otp_code",
        "password",
        "jwt_secret",
        "secret_key",
        "secretkey",
        "bearer ",
    ]
    for token in forbidden_tokens:
        assert token not in serialized, f"CRITICAL SECURITY LEAK: Found forbidden token '{token}' in AI context!"


def test_ai_context_without_auth(client):
    """Unauthenticated request to AI context must return 401."""
    resp = client.get("/students/me/ai-context")
    assert resp.status_code == 401

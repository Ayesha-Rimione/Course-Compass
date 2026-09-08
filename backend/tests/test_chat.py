from unittest.mock import patch
from app.services import ai_bhai_service, ai_context_service
from app.models.students import StudentProfile, StudentCourseProgress, ProgressStatus
from app.models.skills import Skill, StudentSkill, VerificationStatus
from app.models.careers import CareerRole, StudentCareerInterest
from app.models.courses import Course
from app.models.users import User


def test_chat_conversation_lifecycle(client, auth_headers):
    """Test creating a conversation, posting a message, and receiving an AI Bhai response."""
    with patch("app.services.ai_bhai_service.call_groq_llm", return_value="Assalamu Alaikum! I am AI Bhai. I see you are making great progress in your CSE studies."):
        # 1. Create conversation
        resp = client.post(
            "/chat/conversations",
            headers=auth_headers,
            json={"title": "Academic Advising Session 1"},
        )
        assert resp.status_code == 201
        conv = resp.json()
        conv_id = conv["id"]
        assert conv["title"] == "Academic Advising Session 1"

        # 2. List conversations
        resp = client.get("/chat/conversations", headers=auth_headers)
        assert resp.status_code == 200
        conv_list = resp.json()
        assert any(c["id"] == conv_id for c in conv_list)

        # 3. Post a message
        msg_resp = client.post(
            f"/chat/conversations/{conv_id}/messages",
            headers=auth_headers,
            json={"content": "What courses should I take next semester for Backend Engineering?"},
        )
        assert msg_resp.status_code == 201
        msg_data = msg_resp.json()
        assert msg_data["user_message"]["content"] == "What courses should I take next semester for Backend Engineering?"
        assert msg_data["user_message"]["role"] == "user"
        assert msg_data["assistant_message"] is not None
        assert msg_data["assistant_message"]["role"] == "assistant"
        assert "AI Bhai" in msg_data["assistant_message"]["content"]
        assert msg_data["ai_status"] == "AI Bhai responded successfully."

        # 4. Get conversation detail (should contain both user and assistant messages)
        detail_resp = client.get(f"/chat/conversations/{conv_id}", headers=auth_headers)
        assert detail_resp.status_code == 200
        detail_data = detail_resp.json()
        assert len(detail_data["messages"]) == 2
        assert detail_data["messages"][0]["role"] == "user"
        assert detail_data["messages"][1]["role"] == "assistant"


def test_chat_conversation_ownership_isolation(client, auth_headers, auth_headers_b):
    """Student B must NEVER be able to read or post messages into Student A's conversation."""
    # Student A creates conversation
    resp_a = client.post(
        "/chat/conversations",
        headers=auth_headers,
        json={"title": "Student A Private Session"},
    )
    assert resp_a.status_code == 201
    conv_id_a = resp_a.json()["id"]

    # Student B attempts to read Student A's conversation
    resp_b_read = client.get(f"/chat/conversations/{conv_id_a}", headers=auth_headers_b)
    assert resp_b_read.status_code in (403, 404), "Security vulnerability: Student B accessed Student A's conversation!"

    # Student B attempts to post message to Student A's conversation
    resp_b_post = client.post(
        f"/chat/conversations/{conv_id_a}/messages",
        headers=auth_headers_b,
        json={"content": "Malicious injected message"},
    )
    assert resp_b_post.status_code in (403, 404), "Security vulnerability: Student B injected message into Student A's conversation!"


def test_ai_bhai_system_prompt_builder_includes_student_context(db_session, auth_headers):
    """Verify that system prompt accurately embeds student's academic and skills context."""
    user = db_session.query(User).filter(User.email == "student@iubat.edu").first()
    profile = db_session.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()
    profile.full_name = "Tariqul Islam"
    profile.student_id = "20201045"
    profile.current_semester = 4
    profile.cgpa = 3.75
    db_session.flush()

    # Set career role
    backend_role = db_session.query(CareerRole).filter(CareerRole.name == "Backend Engineer").first()
    career_interest = StudentCareerInterest(
        student_profile_id=profile.id,
        career_role_id=backend_role.id,
        is_still_exploring=False,
    )
    db_session.add(career_interest)

    # Add a verified skill
    python_skill = db_session.query(Skill).filter(Skill.name == "Python").first()
    student_skill = StudentSkill(
        student_profile_id=profile.id,
        skill_id=python_skill.id,
        self_rating=4,
        verified_rating=4,
        verification_status=VerificationStatus.VERIFIED,
    )
    db_session.add(student_skill)
    db_session.flush()

    # Retrieve AI context and build system prompt
    ai_ctx = ai_context_service.get_ai_context(db_session, user)
    prompt = ai_bhai_service.build_ai_bhai_system_prompt(ai_ctx)

    assert "Tariqul Islam" in prompt
    assert "20201045" in prompt
    assert "Current Semester: 4" in prompt
    assert "CGPA: 3.75" in prompt
    assert "Backend Engineer" in prompt
    assert "Python" in prompt
    assert "Verified Rating: 4/5" in prompt


def test_ai_bhai_still_exploring_handling(db_session, auth_headers_b):
    """Verify that students with STILL_EXPLORING career interest are correctly formatted."""
    user = db_session.query(User).filter(User.email == "student_b@iubat.edu").first()
    profile = db_session.query(StudentProfile).filter(StudentProfile.user_id == user.id).first()

    # Set STILL_EXPLORING
    career_interest = StudentCareerInterest(
        student_profile_id=profile.id,
        career_role_id=None,
        is_still_exploring=True,
    )
    db_session.add(career_interest)
    db_session.flush()

    ai_ctx = ai_context_service.get_ai_context(db_session, user)
    prompt = ai_bhai_service.build_ai_bhai_system_prompt(ai_ctx)

    assert "STILL_EXPLORING" in prompt
    assert "actively exploring domains" in prompt


def test_ai_bhai_prompt_does_not_expose_credentials(db_session, auth_headers):
    """Verify that no sensitive credentials, secrets, or OTPs leak into AI system prompt."""
    user = db_session.query(User).filter(User.email == "student@iubat.edu").first()
    user.hashed_otp = "super_secret_otp_hash_12345"

    ai_ctx = ai_context_service.get_ai_context(db_session, user)
    prompt = ai_bhai_service.build_ai_bhai_system_prompt(ai_ctx)

    assert "super_secret_otp_hash_12345" not in prompt
    assert "development_super_secret_jwt_key" not in prompt
    assert "postgresql://" not in prompt
    assert "sqlite:///" not in prompt
    assert "GROQ_API_KEY" not in prompt


def test_ai_bhai_multi_turn_history_preservation(client, auth_headers):
    """Verify that multi-turn conversations send history and accumulate messages correctly."""
    with patch("app.services.ai_bhai_service.call_groq_llm") as mock_groq:
        mock_groq.side_effect = [
            "Turn 1 response from AI Bhai.",
            "Turn 2 response with memory from AI Bhai.",
        ]

        # 1. Create conversation
        resp = client.post(
            "/chat/conversations",
            headers=auth_headers,
            json={"title": "Multi-turn Advising"},
        )
        conv_id = resp.json()["id"]

        # 2. First message
        resp1 = client.post(
            f"/chat/conversations/{conv_id}/messages",
            headers=auth_headers,
            json={"content": "Hello AI Bhai, what should I study first?"},
        )
        assert resp1.status_code == 201
        assert resp1.json()["assistant_message"]["content"] == "Turn 1 response from AI Bhai."

        # 3. Second message
        resp2 = client.post(
            f"/chat/conversations/{conv_id}/messages",
            headers=auth_headers,
            json={"content": "How long will that take?"},
        )
        assert resp2.status_code == 201
        assert resp2.json()["assistant_message"]["content"] == "Turn 2 response with memory from AI Bhai."

        # Verify second LLM call received system prompt + 3 previous messages + current prompt
        assert mock_groq.call_count == 2
        last_call_messages = mock_groq.call_args[0][0]
        # Roles should include system, user, assistant, user
        roles = [m["role"] for m in last_call_messages]
        assert roles == ["system", "user", "assistant", "user"]
        assert last_call_messages[1]["content"] == "Hello AI Bhai, what should I study first?"
        assert last_call_messages[2]["content"] == "Turn 1 response from AI Bhai."
        assert last_call_messages[3]["content"] == "How long will that take?"


def test_ai_bhai_strict_context_isolation(client, db_session, auth_headers, auth_headers_b):
    """Verify that Student A's AI prompt contains only Student A's data, never Student B's."""
    user_a = db_session.query(User).filter(User.email == "student@iubat.edu").first()
    profile_a = db_session.query(StudentProfile).filter(StudentProfile.user_id == user_a.id).first()
    profile_a.full_name = "Student Alpha"
    profile_a.student_id = "20201001"

    user_b = db_session.query(User).filter(User.email == "student_b@iubat.edu").first()
    profile_b = db_session.query(StudentProfile).filter(StudentProfile.user_id == user_b.id).first()
    profile_b.full_name = "Student Beta"
    profile_b.student_id = "20201002"
    db_session.flush()

    captured_prompts = []

    def mock_call(messages, model=None):
        captured_prompts.append(messages[0]["content"])
        return "AI Bhai response."

    with patch("app.services.ai_bhai_service.call_groq_llm", side_effect=mock_call):
        # Student A creates conversation and posts message
        conv_a = client.post("/chat/conversations", headers=auth_headers, json={"title": "Session A"}).json()
        client.post(f"/chat/conversations/{conv_a['id']}/messages", headers=auth_headers, json={"content": "Alpha question"})

        # Student B creates conversation and posts message
        conv_b = client.post("/chat/conversations", headers=auth_headers_b, json={"title": "Session B"}).json()
        client.post(f"/chat/conversations/{conv_b['id']}/messages", headers=auth_headers_b, json={"content": "Beta question"})

        assert len(captured_prompts) == 2
        prompt_a, prompt_b = captured_prompts[0], captured_prompts[1]

        # Student A prompt verification
        assert "Student Alpha" in prompt_a
        assert "20201001" in prompt_a
        assert "Student Beta" not in prompt_a
        assert "20201002" not in prompt_a

        # Student B prompt verification
        assert "Student Beta" in prompt_b
        assert "20201002" in prompt_b
        assert "Student Alpha" not in prompt_b
        assert "20201001" not in prompt_b


def test_ai_bhai_call_groq_missing_key_fallback():
    """Verify fallback message when GROQ_API_KEY is not configured."""
    with patch.object(ai_bhai_service.settings, "GROQ_API_KEY", ""):
        resp = ai_bhai_service.call_groq_llm([{"role": "user", "content": "Hi"}])
        assert "not configured" in resp

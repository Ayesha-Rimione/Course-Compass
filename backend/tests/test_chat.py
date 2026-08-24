def test_chat_conversation_lifecycle(client, auth_headers):
    """Test creating a conversation, posting a message, and reading back history."""
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
    assert "disabled until Phase 7" in msg_data["ai_status"]

    # 4. Get conversation detail
    detail_resp = client.get(f"/chat/conversations/{conv_id}", headers=auth_headers)
    assert detail_resp.status_code == 200
    detail_data = detail_resp.json()
    assert len(detail_data["messages"]) == 1
    assert detail_data["messages"][0]["content"] == "What courses should I take next semester for Backend Engineering?"


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

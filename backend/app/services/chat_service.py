"""
chat_service.py

Chat conversation and message persistence service.
Establishes the conversation storage foundation for the upcoming AI Bhai phase.

STRICT SECURITY & OWNERSHIP:
A student may ONLY access and append messages to conversations belonging
to their own StudentProfile. Unauthorized access raises HTTP 404 or 403.
"""
from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.users import User
from app.models.chat import ChatConversation, ChatMessage
from app.schemas.chat import (
    ConversationCreate,
    MessageCreate,
    ChatConversationResponse,
    ChatConversationDetailResponse,
    ChatMessageResponse,
    MessagePostResponse,
)
from app.services.student_service import get_or_create_profile


def create_conversation(
    db: Session, user: User, data: ConversationCreate
) -> ChatConversationResponse:
    """Create a new chat conversation for the authenticated student."""
    profile = get_or_create_profile(db, user)

    conversation = ChatConversation(
        student_profile_id=profile.id,
        title=data.title or "New Advising Session",
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return ChatConversationResponse.model_validate(conversation)


def list_conversations(db: Session, user: User) -> List[ChatConversationResponse]:
    """List all chat conversations belonging to the authenticated student."""
    profile = get_or_create_profile(db, user)

    conversations = (
        db.query(ChatConversation)
        .filter(ChatConversation.student_profile_id == profile.id)
        .order_by(ChatConversation.updated_at.desc())
        .all()
    )
    return [ChatConversationResponse.model_validate(c) for c in conversations]


def get_conversation_detail(
    db: Session, user: User, conversation_id: str
) -> ChatConversationDetailResponse:
    """
    Retrieve conversation with all messages.
    Enforces strict student ownership.
    """
    profile = get_or_create_profile(db, user)

    conversation = (
        db.query(ChatConversation)
        .filter(ChatConversation.id == conversation_id)
        .first()
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found.",
        )

    if conversation.student_profile_id != profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not own this conversation.",
        )

    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.conversation_id == conversation.id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return ChatConversationDetailResponse(
        id=conversation.id,
        student_profile_id=conversation.student_profile_id,
        title=conversation.title,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        messages=[ChatMessageResponse.model_validate(m) for m in messages],
    )


def post_message(
    db: Session, user: User, conversation_id: str, data: MessageCreate
) -> MessagePostResponse:
    """
    Persist a new user message to a conversation.
    Does NOT call an LLM (reserved for Phase 7).
    Returns persisted user message and clear status.
    """
    profile = get_or_create_profile(db, user)

    conversation = (
        db.query(ChatConversation)
        .filter(ChatConversation.id == conversation_id)
        .first()
    )
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation '{conversation_id}' not found.",
        )

    if conversation.student_profile_id != profile.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not own this conversation.",
        )

    # 1. Persist User Message
    user_msg = ChatMessage(
        conversation_id=conversation.id,
        role="user",
        content=data.content,
    )
    db.add(user_msg)

    # Update conversation updated_at
    conversation.title = data.content[:40] + ("..." if len(data.content) > 40 else "") if conversation.title == "New Advising Session" else conversation.title

    db.commit()
    db.refresh(user_msg)

    return MessagePostResponse(
        user_message=ChatMessageResponse.model_validate(user_msg),
        assistant_message=None,
        ai_status="AI generation disabled until Phase 7. Message persisted successfully in conversation history.",
    )

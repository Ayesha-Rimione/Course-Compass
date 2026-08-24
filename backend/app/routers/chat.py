from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.users import User
from app.utils.security import get_current_user
from app.schemas.chat import (
    ConversationCreate,
    MessageCreate,
    ChatConversationResponse,
    ChatConversationDetailResponse,
    MessagePostResponse,
)
from app.services import chat_service

router = APIRouter(prefix="/chat", tags=["AI Chat Persistence Foundation"])


@router.post(
    "/conversations",
    response_model=ChatConversationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new chat conversation session",
)
def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return chat_service.create_conversation(db, current_user, data)


@router.get(
    "/conversations",
    response_model=List[ChatConversationResponse],
    status_code=status.HTTP_200_OK,
    summary="List student's chat conversations",
)
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return chat_service.list_conversations(db, current_user)


@router.get(
    "/conversations/{conversation_id}",
    response_model=ChatConversationDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Get conversation detail with full message history",
)
def get_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return chat_service.get_conversation_detail(db, current_user, conversation_id)


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=MessagePostResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Persist a user message to conversation history",
)
def post_message(
    conversation_id: str,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return chat_service.post_message(db, current_user, conversation_id, data)

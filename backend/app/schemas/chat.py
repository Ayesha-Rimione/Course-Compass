import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


class ConversationCreate(BaseModel):
    title: Optional[str] = Field("New Advising Session", max_length=255)


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=10000, description="Message content sent by student")


class ChatMessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str  # 'user', 'assistant', 'system'
    content: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ChatConversationResponse(BaseModel):
    id: str
    student_profile_id: str
    title: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ChatConversationDetailResponse(ChatConversationResponse):
    messages: List[ChatMessageResponse] = []


class MessagePostResponse(BaseModel):
    user_message: ChatMessageResponse
    assistant_message: Optional[ChatMessageResponse] = None
    ai_status: str = "AI generation disabled until Phase 7. Message persisted successfully."

    model_config = ConfigDict(from_attributes=True)

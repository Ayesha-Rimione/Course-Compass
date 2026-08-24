import uuid
import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
from app.models.base import TimestampMixin

if TYPE_CHECKING:
    from app.models.students import StudentProfile


class ChatConversation(Base, TimestampMixin):
    """
    Persistence model for student conversations with the future AI Bhai.
    Enforces strict student ownership.
    """
    __tablename__ = "chat_conversations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    student_profile_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(
        String(255), default="New Advising Session", nullable=False
    )

    student_profile: Mapped["StudentProfile"] = relationship("StudentProfile")
    messages: Mapped[List["ChatMessage"]] = relationship(
        "ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at"
    )


class ChatMessage(Base):
    """
    Single message in a conversation.
    Allowed roles: 'user', 'assistant', 'system'.
    """
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    conversation_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False  # 'user', 'assistant', 'system'
    )
    content: Mapped[str] = mapped_column(
        Text, nullable=False
    )
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    conversation: Mapped["ChatConversation"] = relationship("ChatConversation", back_populates="messages")

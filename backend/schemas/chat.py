from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

# -----------------------------
# Вхідні дані при створенні повідомлення
# -----------------------------
class MessageCreate(BaseModel):
    text: str
    is_file: bool = False
    file_url: Optional[str] = None


# -----------------------------
# Вихідні дані для фронтенду
# -----------------------------
class MessageOut(BaseModel):
    id: int
    text: str
    author_id: int
    created_at: datetime
    file_url: Optional[str]
    is_read: bool
    is_file: bool

    class Config:
        from_attributes = True


# -----------------------------
# DTO для чату
# -----------------------------
class ChatOut(BaseModel):
    id: int
    client_id: int
    master_id: int
    last_message: Optional[MessageOut]
    unread_count: int

    class Config:
        from_attributes = True


class CreateChat(BaseModel):
    client_id: int = Field(..., description="Client ID")
    master_id: int = Field(..., description="Master ID")
    ticket_id: int = Field(..., description="Ticket ID")

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    id: int
    client_id: int
    master_id: int
    ticket_id: int

    class Config:
        from_attributes = True
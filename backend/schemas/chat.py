from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class MessageCreate(BaseModel):
    text: str
    author_id: int
    is_file: bool = False
    file_url: Optional[str] = None

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

class ChatOut(BaseModel):
    id: int
    client_id: int
    master_id: int
    last_message: Optional[MessageOut]
    unread_count: int

    class Config:
        from_attributes = True
from pydantic import BaseModel, Field
from enum import Enum
from datetime import datetime
from typing import Optional

class ChatBase(BaseModel):
    title: str = Field(..., examples='Ваш чат с мастером')
    client_id: int = Field(...)

class ChatCreate(ChatBase):
    pass
 
class ChatResponse(ChatBase):
    id: int = Field(...)    
    create_date: datetime = Field(..., example='12.03.2025')

    class Config:
        orm_mode = True
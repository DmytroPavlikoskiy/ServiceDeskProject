from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Днепр офисы и Одесса Мама делают! daaaaa:)

class TicketStatus(str, Enum):
    open = 'open'
    in_progress = 'in_progress'
    closed = 'closed'

class TicketPriority(str, Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'

class TicketBase(BaseModel):
    title: str = Field(..., description="заголовок", example="не работает айфон")
    description: Optional[str] = Field(..., example='Айфон не грузится, доходит до значка яблока и выключается')
    status: TicketStatus = TicketStatus.open
    priority: TicketPriority = TicketPriority.medium
    user_id: int 
    

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: TicketStatus = Field(..., description="new path's status")
    
class TicketResponse(TicketBase):
    id: int
    user_id: int
    title: str
    status: TicketStatus
    created_date: datetime  

    class Config:
        orm_mode = True
    
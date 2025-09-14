from pydantic import BaseModel, Field
from typing import List
from enum import Enum
from backend.schemas.file import FileResponse

class TicketStatus(str, Enum):
    open = 'open'
    in_progress = 'in_progress'
    closed = 'closed'

class TicketPriority(str, Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'

class TicketBase(BaseModel):
    title: str = Field(..., description="заголовок", example="не працює айфон")
    description: str = Field(..., example="Айфон не грузиться, доходит до значка яблука і вимикається")
    status: TicketStatus = TicketStatus.open
    priority: TicketPriority = TicketPriority.medium
    client_id: int

class TicketCreate(TicketBase):
    pass

class TicketUpdate(BaseModel):
    status: TicketStatus = Field(..., description="new path's status")

class TicketResponse(BaseModel):
    id: int
    title: str
    description: str
    status: TicketStatus
    files: List[FileResponse] = []

    class Config:
        from_attributes = True
from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    sender: str
    conten: str

class MessageOut(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True
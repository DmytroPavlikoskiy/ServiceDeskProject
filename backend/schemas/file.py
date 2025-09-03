
from pydantic import BaseModel

class File(BaseModel):
    id: int
    ticket_id: int
    filename: str
    url: str
    uploaded_at: str #xx-xx-xxxx xx:xx
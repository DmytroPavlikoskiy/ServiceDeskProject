from pydantic import BaseModel

class File(BaseModel):
    id: int
    ticket_id: int
    filename: str
    url: str
    uploaded_at: str  # формат: xx-xx-xxxx xx:xx

    class Config:
        from_attributes = True

class FileResponse(BaseModel):
    id: int
    filename: str
    url: str

    class Config:
        from_attributes = True
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, UploadFile, File, Form
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List
from sqlalchemy.orm import joinedload
import shutil
import os
import redis
import json

from backend.schemas.file import File as FileSchema
from backend.database.models import File as  FileModel, Ticket, User
from backend.database.dependencies import get_db, get_current_user
from backend.schemas.ticket import TicketCreate, TicketPriority, TicketUpdate, TicketResponse
from backend.settings.settings import settings



ticket_router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)


@ticket_router.post("/file/upload", response_model=FileSchema)
async def upload_ticket_file(
    ticket_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    # Перевіряємо чи існує такий тікет
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Тікет не знайдено")
    
    if user.role != "admin" and ticket.client_id != user.id:
        raise HTTPException(status_code=403, detail="Ви не маєте доступу до цього тікета")

    # Папка для збереження
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    # Унікальне ім’я файлу
    filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}"
    file_path = os.path.join(upload_dir, filename)

    # Збереження файлу на диск
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # URL для доступу (наприклад, через StaticFiles)
    file_url = f"/{file_path}"

    # Запис у базу
    new_file = FileModel(
        ticket_id=ticket_id,
        filename=file.filename,
        url=file_url
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return FileSchema(
        id=new_file.id,
        ticket_id=new_file.ticket_id,
        filename=new_file.filename,
        url=new_file.url,
        uploaded_at=new_file.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")
    )

@ticket_router.get("/get_tickets/")
async def get_tickets(db: Session = Depends(get_db),
                      user: User = Depends(get_current_user)):
    if user.role == "admin":
        return db.query(Ticket).all()
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: only admins can view all tickets"
        )


@ticket_router.post("/create/ticket", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate,
                        db: Session = Depends(get_db),
                        user: User = Depends(get_current_user)):
    if user.role != "admin" and ticket.client_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="Ви не можете створювати тікети для інших користувачів"
        )
    new_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
        client_id=ticket.client_id,
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    r.publish("new_ticket_channel", json.dumps({
        "ticket_id": new_ticket.id,
        "title": new_ticket.title,
        "description": new_ticket.description,
        "client_id": new_ticket.client_id
    }))

    return new_ticket
    


@ticket_router.get("/get_ticket/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: int,
                     db: Session = Depends(get_db),
                     user: User = Depends(get_current_user)):
    ticket = db.query(Ticket).filter_by(id=ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    if user.role != "admin" and ticket.client_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Відмовленно у доступі!"
        )
    return ticket


@ticket_router.get("/user/get_tickets/")
async def get_tickets(db: Session = Depends(get_db),
                      user: User = Depends(get_current_user)):
    query = db.query(Ticket).options(joinedload(Ticket.files))
    if user.role != "admin":
        query = query.filter(Ticket.client_id == user.id)

    tickets = query.all()

    result = []
    for ticket in tickets:
        result.append({
            "id": ticket.id,
            "title": ticket.title,
            "description": ticket.description,
            "status": ticket.status,
            "photos": [file.url for file in ticket.files]
        })

    return {"data": {"status": 200, "tickets": result}}
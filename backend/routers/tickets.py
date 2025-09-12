from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import List

from backend.database.models import Ticket
from backend.database.dependencies import get_db
from backend.schemas.ticket import TicketCreate, TicketPriority, TicketUpdate, TicketResponse
from backend.settings.settings import settings



ticket_router = APIRouter(prefix="/api/tickets", tags=["Tickets"])


@ticket_router.get("/api/get_tickets/")
async def get_tickets(db: Session = Depends(get_db)):
    return db.query(Ticket).all()

@ticket_router.post("/create/ticket", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    new_ticket = Ticket(
        title=ticket.title,
        description=ticket.description,
        status=ticket.status,
        priority=ticket.priority,
        user_id=ticket.user_id,
        created_date=datetime.utcnow()
    )

    db.add(new_ticket)
    db.commit()
    db.refresh(new_ticket)

    return new_ticket
    


@ticket_router.get("/get_ticket/{ticket_id}", response_model=TicketResponse)
async def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter_by(id=ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket



@ticket_router.get("/user/get_tickets/{client_id}")
async def get_tickets(client_id: int, db: Session = Depends(get_db), response_model=List[TicketResponse]):
    tickets = db.query(Ticket).filter_by(client_id=client_id).all()
    if not tickets:
        return {"data": {"status": 404, "message": "Tickets not found!!!"}}
    return tickets
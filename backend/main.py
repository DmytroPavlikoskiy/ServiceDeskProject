import logging
from fastapi import FastAPI, Depends, APIRouter, HTTPException
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database.models import Ticket  # імпортуємо конкретну модель
from database.dependencies import get_db
from settings.settings import settings
from schemas.ticket import TicketUpdate
from schemas.user import User


logging.basicConfig(
    level = logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    filename="logs/tickets.log",
    filemode="a"
)
logger = logging.getLogger("tickets")


app = FastAPI(title=settings.APP_NAME)
router  = APIRouter(prefix="/tickets", tags=["Tickets"])

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOW_METHODS,
    allow_headers=settings.ALLOW_HEADERS,
)

@app.get("/api/hello")
def hello():
    return {"message": "Hello from backend!"}

# Приклади маршрутів для Ticket
@app.get("/api/get_tickets/", tags=["Ticket"])
async def get_tickets(db: Session = Depends(get_db)):
    return db.query(Ticket).all()

@app.post("/api/create_ticket/", tags=["Ticket"])
async def create_ticket(db: Session = Depends(get_db)):
    pass

# masha and vika
@router.get("/{ticket_id}")
def get_ticket(ticket_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail='Заявка не найдена')
    return ticket

@router.patch("/{ticket_id}")
def update_ticket(
    ticket_id: int,
    update: TicketUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends()
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admin can update")
    
    old_status = ticket.status
    ticket.status = update.status
    db.commit()
    db.refresh(ticket)
    
    logger.info(f'Статус заявки {ticket_id} изменен: {old_status} -> {update.status}')

    return {"message": "Ticket updated", "ticket": ticket}


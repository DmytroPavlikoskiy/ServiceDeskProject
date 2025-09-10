from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database.models import Ticket
from database.dependencies import get_db
from settings.settings import settings

app = FastAPI(title=settings.APP_NAME)

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

@app.post("/api/create/ticket", tags=["Ticket"])
async def create_ticket(db: Session = Depends(get_db)):
    pass


@app.get("/api/ticket/{client_id}", tags=["Ticket"])
async def set_ticket(ticket_id: int, client_id: int, db: Session = Depends(get_db)):
    ticket = db.query(Ticket).filter_by(client_id=client_id).first()
    if ticket:
        return {
            "data": {
                "status": 200,
                "ticket": ticket,
                "message": "Ticket has found success!!!"
            }
        }
    else:
        return {
            "data": {
                "status": 404,
                "message": "Ticket not found!!!"
            }
        }



@app.get("/api/tickets/{client_id}", tags=["Ticket"])
async def set_tickets(client_id: int, db: Session = Depends(get_db)):
    tickets = db.query(Ticket).filter_by(client_id=client_id).all()
    if tickets:
        return {
            "data": {
                "status": 200,
                "ticket": tickets,
                "message": "Ticket has found success!!!"
            }
        }
    else:
        return {
            "data": {
                "status": 404,
                "message": "Tickets not found!!!",
            }
        }


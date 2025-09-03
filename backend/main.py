from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database.models.models import Ticket  # імпортуємо конкретну модель
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

@app.post("/api/create_ticket/", tags=["Ticket"])
async def create_ticket(db: Session = Depends(get_db)):
    pass
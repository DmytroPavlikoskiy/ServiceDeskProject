from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from backend.database.models import Ticket
from backend.database.dependencies import get_db
from backend.settings.settings import settings
from backend.routers import auth, tickets, chat
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title=settings.APP_NAME)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOW_ORIGINS,
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=settings.ALLOW_METHODS,
    allow_headers=settings.ALLOW_HEADERS,
)

app.include_router(auth.auth_router)
app.include_router(tickets.ticket_router)
app.include_router(chat.chat_router)
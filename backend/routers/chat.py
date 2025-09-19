from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import shutil, os

from backend.database.dependencies import get_db,get_current_user
from backend.database.models import Chat, Message, User
from backend.schemas.chat import MessageCreate, MessageOut, ChatOut, CreateChat, ChatResponse
from backend.routers.auth import verify_bot_token
from backend.ws_manager import websocket_manager

chat_router = APIRouter(prefix="/api/chats", tags=["Chats"])

# -----------------------------
# Create chat
# -----------------------------
@chat_router.post("/create_chat", tags=["Chats"], response_model=ChatResponse)
async def create_chat(chat: CreateChat,
                      db: Session = Depends(get_db),
                      source: str = Depends(verify_bot_token)
                    ):
    existing = db.query(Chat).filter(Chat.ticket_id == chat.ticket_id).first()
    if existing:
        await websocket_manager.notify_users(
            [chat.client_id, chat.master_id],
            {
                "type": "chat_created",
                "chat_id": existing.id,
                "ticket_id": existing.ticket_id,
                "client_id": existing.client_id,
                "master_id": existing.master_id
            }
        )
        return existing
    if source == "bot":
        new_chat = Chat(
            ticket_id=chat.ticket_id,
            client_id=chat.client_id,
            master_id=chat.master_id
        )
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        await websocket_manager.notify_users(
            [chat.client_id, chat.master_id],
            {
                "type": "chat_created",
                "chat_id": new_chat.id,
                "ticket_id": new_chat.ticket_id,
                "client_id": new_chat.client_id,
                "master_id": new_chat.master_id
            }
        )
        return new_chat
    else:
        raise HTTPException(status_code=403, detail="Forbidden")


# -----------------------------
# Список чатів користувача
# -----------------------------

@chat_router.get("/user/chats", response_model=List[ChatOut])
async def get_user_chats(user: User = Depends(get_current_user),
                         db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(
        (Chat.client_id == user.id) | (Chat.master_id == user.id)
    ).all()

    result = []
    for chat in chats:
        last_message = db.query(Message).filter(Message.chat_id == chat.id)\
                        .order_by(Message.created_at.desc()).first()
        unread_count = db.query(Message).filter(
            Message.chat_id == chat.id,
            Message.author_id != user.id,
            Message.is_read == False
        ).count()

        result.append(ChatOut(
            id=chat.id,
            client_id=chat.client_id,
            master_id=chat.master_id,
            last_message=last_message,
            unread_count=unread_count
        ))

    return result

# -----------------------------
# Завантаження файлу у чат
# -----------------------------
@chat_router.post("/{chat_id}/upload", response_model=MessageOut)
async def upload_file(chat_id: int,
                      user: User = Depends(get_current_user),
                      file: UploadFile = File(...),
                      db: Session = Depends(get_db)):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Створюємо повідомлення з файлом
    new_message = Message(
        chat_id=chat_id,
        author_id=user.id,
        text="📎 Файл",
        file_url=f"/{file_path}",
        is_file=True,
        is_read=False
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return MessageOut.model_validate(new_message)

# -----------------------------
# REST для повідомлень (отримати та відмітити прочитані)
# -----------------------------
@chat_router.get("/{chat_id}/messages", response_model=List[MessageOut])
async def get_messages(chat_id: int,
                       user: User = Depends(get_current_user),
                       db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()
    if not messages:
        return []

    # Відмічаємо як прочитані всі повідомлення іншого автора
    db.query(Message).filter(
        Message.chat_id == chat_id,
        Message.author_id != user.id,
        Message.is_read == False
    ).update({Message.is_read: True})
    db.commit()

    return [MessageOut.model_validate(m) for m in messages]
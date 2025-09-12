from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List
import shutil, os

from backend.database.dependencies import get_db
from backend.database.models import Chat, Message, User
from backend.schemas.chat import MessageCreate, MessageOut, ChatOut

chat_router = APIRouter(prefix="/api/chats", tags=["Chats"])

# -----------------------------
# Список чатів користувача
# -----------------------------
@chat_router.get("/{user_id}", response_model=List[ChatOut])
async def get_user_chats(user_id: int, db: Session = Depends(get_db)):
    chats = db.query(Chat).filter(
        (Chat.client_id == user_id) | (Chat.master_id == user_id)
    ).all()

    result = []
    for chat in chats:
        last_message = db.query(Message).filter(Message.chat_id == chat.id)\
                        .order_by(Message.created_at.desc()).first()
        unread_count = db.query(Message).filter(
            Message.chat_id == chat.id,
            Message.author_id != user_id,
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
async def upload_file(chat_id: int, author_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    upload_dir = "uploads"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Створюємо повідомлення з файлом
    new_message = Message(
        chat_id=chat_id,
        author_id=author_id,
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
async def get_messages(chat_id: int, user_id: int, db: Session = Depends(get_db)):
    messages = db.query(Message).filter(Message.chat_id == chat_id).order_by(Message.created_at.asc()).all()
    if not messages:
        return []

    # Відмічаємо як прочитані всі повідомлення іншого автора
    db.query(Message).filter(
        Message.chat_id == chat_id,
        Message.author_id != user_id,
        Message.is_read == False
    ).update({Message.is_read: True})
    db.commit()

    return [MessageOut.model_validate(m) for m in messages]

# -----------------------------
# WebSocket чат
# -----------------------------
connections: dict[int, List[WebSocket]] = {}  # chat_id -> [sockets]

@chat_router.websocket("/ws/{chat_id}/{user_id}")
async def websocket_endpoint(websocket: WebSocket, chat_id: int, user_id: int, db: Session = Depends(get_db)):
    await websocket.accept()
    if chat_id not in connections:
        connections[chat_id] = []
    connections[chat_id].append(websocket)

    try:
        while True:
            data = await websocket.receive_json()
            message_in = MessageCreate(**data)

            new_message = Message(
                chat_id=chat_id,
                author_id=message_in.author_id,
                text=message_in.text,
                is_file=message_in.is_file,
                file_url=message_in.file_url if message_in.is_file else None,
                is_read=False
            )
            db.add(new_message)
            db.commit()
            db.refresh(new_message)

            message_out = MessageOut.model_validate(new_message)

            # розсилка всім у чаті
            for conn in connections[chat_id]:
                await conn.send_json(message_out.model_dump())

    except WebSocketDisconnect:
        connections[chat_id].remove(websocket)
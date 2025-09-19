# # backend/routers/ws_router.py

# from fastapi import (APIRouter, WebSocket, WebSocketDisconnect,
#                      Depends, Query, Cookie, HTTPException)
# from sqlalchemy.orm import Session
# from backend.database.dependencies import get_db, get_current_user_from_token
# from backend.schemas.chat import MessageCreate, MessageOut
# from backend.database.models import Message, Chat
# from datetime import datetime, timedelta
# from backend.settings.settings import settings
# from jose import jwt
# import logging
# from backend.ws_manager import websocket_manager

# ws_router = APIRouter(prefix="/api/ws")

# logger = logging.getLogger("websocket log")
# logger.setLevel(logging.INFO)
# ch = logging.StreamHandler()
# formatter = logging.Formatter("%(asctime)s | %(levelname)s | %(message)s")
# ch.setFormatter(formatter)
# logger.addHandler(ch)

# # -----------------------------
# # Notifications для користувачів
# # -----------------------------
# @ws_router.websocket("/notifications")
# async def notifications_ws(
#     websocket: WebSocket,
#     access_token: str = Cookie(None),  # читаємо HttpOnly cookie
#     db: Session = Depends(get_db)
# ):
#     logger.info(msg=f"ACCESS_TOKEN: {access_token}) 111111")
#     if not access_token:
#         logger.info(msg=f"ACCESS_TOKEN: {access_token})222222")
#         await websocket.close(code=1008)
#         return

#     user = get_current_user_from_token(access_token, db)
#     if not user:
#         await websocket.close(code=1008)
#         return

#     await websocket_manager.connect_user(user.id, websocket)
#     try:
#         while True:
#             await websocket.receive_text()
#     except WebSocketDisconnect:
#         websocket_manager.disconnect_user(user.id, websocket)


# # -----------------------------
# # GET ws chat token
# # -----------------------------

# @ws_router.get("/ws_token")
# async def get_ws_token(
#     access_token: str = Cookie(None), 
#     db: Session = Depends(get_db)
# ):
#     if not access_token:
#         raise HTTPException(status_code=401, detail="No access token")

#     # Перевіряємо основний access_token
#     user = get_current_user_from_token(access_token, db)
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid access token")

#     # payload містить user_id і час життя токена
#     payload = {
#         "user_id": user.id,
#         "exp": datetime.utcnow() + timedelta(seconds=settings.WS_TOKEN_EXPIRE_SECONDS)
#     }

#     ws_token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

#     return {"ws_token": ws_token}

# # -----------------------------
# # Chat
# # -----------------------------
# @ws_router.websocket("/chat/{chat_id}")
# async def chat_ws(
#     websocket: WebSocket,
#     chat_id: int,
#     ws_token: str = Query(...),
#     db: Session = Depends(get_db)
# ):
#     logger.info(msg=f"ACCESS_TOKEN: {ws_token})")
#     if not ws_token:
#         await websocket.close(code=1008)
#         return

#     user = get_current_user_from_token(ws_token, db)
#     if not user:
#         await websocket.close(code=1008)
#         return

#     chat = db.query(Chat).filter(Chat.id == chat_id).first()
#     if not chat or user.id not in [chat.client_id, chat.master_id]:
#         await websocket.close(code=1008)
#         return

#     await websocket_manager.connect_chat(chat_id, websocket)
#     try:
#         while True:
#             data = await websocket.receive_json()
#             message_in = MessageCreate(**data)

#             new_message = Message(
#                 chat_id=chat_id,
#                 author_id=user.id,
#                 text=message_in.text,
#                 is_file=message_in.is_file,
#                 file_url=message_in.file_url if message_in.is_file else None,
#                 is_read=False
#             )
#             db.add(new_message)
#             db.commit()
#             db.refresh(new_message)

#             message_out = MessageOut.model_validate(new_message)
#             await websocket_manager.send_chat_message(chat_id, message_out.model_dump())

#     except WebSocketDisconnect:
#         websocket_manager.disconnect_chat(chat_id, websocket)

# backend/routers/ws_router.py

from fastapi import (
    APIRouter, WebSocket, WebSocketDisconnect,
    Depends, Query, Cookie, HTTPException, status
)
from sqlalchemy.orm import Session
from backend.database.dependencies import get_db, get_current_user_from_token
from backend.database.models import Message, Chat, User
from backend.schemas.chat import MessageCreate, MessageOut
from backend.settings.settings import settings
from backend.ws_manager import websocket_manager
from datetime import datetime, timedelta
from jose import jwt, JWTError
import logging

ws_router = APIRouter(prefix="/api/ws")

logger = logging.getLogger("websocket")
logger.setLevel(logging.INFO)


# -----------------------------
# Notifications для користувачів
# -----------------------------
@ws_router.websocket("/notifications")
async def notifications_ws(
    websocket: WebSocket,
    access_token: str = Cookie(None),  # читаємо HttpOnly cookie
    db: Session = Depends(get_db)
):
    logger.info(msg=f"ACCESS_TOKEN: {access_token}) 111111")
    if not access_token:
        logger.info(msg=f"ACCESS_TOKEN: {access_token})222222")
        await websocket.close(code=1008)
        return

    user = get_current_user_from_token(access_token, db)
    if not user:
        await websocket.close(code=1008)
        return

    await websocket_manager.connect_user(user.id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect_user(user.id, websocket)


# -----------------------------
# GET ws chat token (короткий)
# -----------------------------
@ws_router.get("/ws_token")
async def get_ws_token(
    access_token: str = Cookie(None),
    db: Session = Depends(get_db)
):
    if not access_token:
        raise HTTPException(status_code=401, detail="No access token")

    # Перевірка користувача
    user = get_current_user_from_token(access_token, db)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid access token")

    payload = {
        "sub": user.email,  # важливо: однаковий формат, як у JWT
        "user_id": user.id,
        "exp": datetime.utcnow() + timedelta(seconds=settings.WS_TOKEN_EXPIRE_SECONDS),
    }

    ws_token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return {"ws_token": ws_token}


# -----------------------------
# CHAT WS
# -----------------------------
@ws_router.websocket("/chat/{chat_id}")
async def chat_ws(
    websocket: WebSocket,
    chat_id: int,
    ws_token: str = Query(...),
    db: Session = Depends(get_db)
):
    # Валідація токена
    try:
        payload = jwt.decode(ws_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            await websocket.close(code=1008)
            return
    except JWTError:
        await websocket.close(code=1008)
        return

    user = db.query(User).filter(User.email == email).first()
    if not user:
        await websocket.close(code=1008)
        return

    chat = db.query(Chat).filter(Chat.id == chat_id).first()
    if not chat or user.id not in [chat.client_id, chat.master_id]:
        await websocket.close(code=1008)
        return

    # Підключення
    await websocket_manager.connect_chat(chat_id, websocket)
    logger.info(f"user {user.id} joined chat {chat_id}; total={(len(websocket_manager.chat_connections.get(chat_id, [])))}")
    try:
        while True:
            try:
                data = await websocket.receive_json()
            except Exception as e:
                logger.exception("Failed to receive json from websocket, closing connection")
                break

            # Валідуємо payload
            try:
                message_in = MessageCreate(**data)
            except Exception:
                logger.exception("Invalid MessageCreate payload")
                continue

            # Створюємо і зберігаємо повідомлення
            try:
                new_message = Message(
                    chat_id=chat_id,
                    author_id=user.id,  # беремо з токена, не з фронта
                    text=message_in.text,
                    is_file=message_in.is_file,
                    file_url=message_in.file_url if message_in.is_file else None,
                    is_read=False,
                )
                db.add(new_message)
                db.commit()
                db.refresh(new_message)
            except Exception:
                db.rollback()
                logger.exception("DB error when saving message")
                continue

            # Формуємо dict для відправки
            message_out = MessageOut.model_validate(new_message)
            message_dict = message_out.model_dump()

            # created_at → ISO
            if "created_at" in message_dict and message_dict["created_at"] is not None:
                try:
                    message_dict["created_at"] = message_dict["created_at"].isoformat()
                except Exception:
                    message_dict["created_at"] = str(message_dict["created_at"])

            logger.info(f"Broadcasting message {message_dict.get('id')} to chat {chat_id}")
            await websocket_manager.send_chat_message(chat_id, message_dict)

    except WebSocketDisconnect:
        logger.info(f"user {user.id} disconnected from chat {chat_id}")
        websocket_manager.disconnect_chat(chat_id, websocket)
    finally:
        websocket_manager.disconnect_chat(chat_id, websocket)

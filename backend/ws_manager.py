# # backend/ws_manager.py

# from fastapi import WebSocket, WebSocketDisconnect
# from typing import Dict, List

# class ConnectionManager:
#     def __init__(self):
#         # user_id -> List[WebSocket]
#         self.user_connections: Dict[int, List[WebSocket]] = {}
#         # chat_id -> List[WebSocket]
#         self.chat_connections: Dict[int, List[WebSocket]] = {}

#     # --- Notifications для користувачів ---
#     async def connect_user(self, user_id: int, websocket: WebSocket):
#         await websocket.accept()
#         if user_id not in self.user_connections:
#             self.user_connections[user_id] = []
#         self.user_connections[user_id].append(websocket)

#     def disconnect_user(self, user_id: int, websocket: WebSocket = None):
#         if user_id in self.user_connections:
#             if websocket:
#                 if websocket in self.user_connections[user_id]:
#                     self.user_connections[user_id].remove(websocket)
#             else:
#                 self.user_connections.pop(user_id, None)

#     async def notify_user(self, user_id: int, data: dict):
#         """
#         Надсилає нотифікацію всім WebSocket підключенням користувача
#         data: dict, наприклад:
#             {
#                 "type": "chat_created",
#                 "chat_id": ...,
#                 "ticket_id": ...,
#                 "client_id": ...,
#                 "master_id": ...
#             }
#         """
#         connections = self.user_connections.get(user_id, [])
#         for ws in connections.copy():
#             try:
#                 await ws.send_json(data)
#             except Exception:
#                 self.disconnect_user(user_id, ws)
                
#     async def notify_users(self, user_ids: list[int], data: dict):
#         for uid in user_ids:
#             await self.notify_user(uid, data)

#     # --- Чати ---
#     async def connect_chat(self, chat_id: int, websocket: WebSocket):
#         await websocket.accept()
#         if chat_id not in self.chat_connections:
#             self.chat_connections[chat_id] = []
#         self.chat_connections[chat_id].append(websocket)

#     def disconnect_chat(self, chat_id: int, websocket: WebSocket):
#         if chat_id in self.chat_connections and websocket in self.chat_connections[chat_id]:
#             self.chat_connections[chat_id].remove(websocket)
#             if not self.chat_connections[chat_id]:
#                 self.chat_connections.pop(chat_id)

#     async def send_chat_message(self, chat_id: int, message: dict):
#         """
#         Надсилає повідомлення всім підключенням до конкретного чату
#         message: dict
#         """
#         connections = self.chat_connections.get(chat_id, [])
#         for ws in connections.copy():
#             try:
#                 await ws.send_json(message)
#             except Exception:
#                 self.disconnect_chat(chat_id, ws)


# # глобальний менеджер
# websocket_manager = ConnectionManager()

# backend/ws_manager.py (оновлений)
from fastapi import WebSocket
from typing import Dict, List
import logging

logger = logging.getLogger("websocket")
logger.setLevel(logging.INFO)

class ConnectionManager:
    def __init__(self):
        self.user_connections: Dict[int, List[WebSocket]] = {}
        self.chat_connections: Dict[int, List[WebSocket]] = {}

    # --- Notifications ---
    async def connect_user(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.user_connections.setdefault(user_id, []).append(websocket)
        logger.info(f"User {user_id} connected to notifications. total={len(self.user_connections[user_id])}")

    def disconnect_user(self, user_id: int, websocket: WebSocket = None):
        if user_id in self.user_connections:
            if websocket and websocket in self.user_connections[user_id]:
                self.user_connections[user_id].remove(websocket)
            if not websocket or not self.user_connections[user_id]:
                self.user_connections.pop(user_id, None)

    async def notify_user(self, user_id: int, data: dict):
        connections = list(self.user_connections.get(user_id, []))
        logger.info(f"Notify user {user_id}, conns={len(connections)}")
        for ws in connections:
            try:
                await ws.send_json(data)
            except Exception:
                logger.exception(f"notify_user: error sending to user {user_id}")
                self.disconnect_user(user_id, ws)

    async def notify_users(self, user_ids: list[int], data: dict):
        for uid in user_ids:
            await self.notify_user(uid, data)

    # --- Chats ---
    async def connect_chat(self, chat_id: int, websocket: WebSocket):
        await websocket.accept()
        self.chat_connections.setdefault(chat_id, []).append(websocket)
        logger.info(f"Socket joined chat {chat_id}. total={len(self.chat_connections[chat_id])}")

    def disconnect_chat(self, chat_id: int, websocket: WebSocket):
        if chat_id in self.chat_connections and websocket in self.chat_connections[chat_id]:
            self.chat_connections[chat_id].remove(websocket)
            logger.info(f"Socket removed from chat {chat_id}. total={len(self.chat_connections.get(chat_id, []))}")
            if not self.chat_connections[chat_id]:
                self.chat_connections.pop(chat_id, None)

    async def send_chat_message(self, chat_id: int, message: dict):
        connections = list(self.chat_connections.get(chat_id, []))
        logger.info(f"Broadcast to chat {chat_id}, connections={len(connections)} message_id={message.get('id')}")
        dead = []
        for ws in connections:
            try:
                await ws.send_json(message)
            except Exception:
                logger.exception(f"send_chat_message: error sending to chat {chat_id}")
                dead.append(ws)
        for ws in dead:
            self.disconnect_chat(chat_id, ws)


websocket_manager = ConnectionManager()
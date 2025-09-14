from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        self.active_connections.pop(user_id, None)

    async def notify_user(self, user_id: int, data: dict):
        ws = self.active_connections.get(user_id)
        if ws:
            try:
                await ws.send_json(data)
            except Exception:
                # optionally disconnect
                self.disconnect(user_id)

websocket_manager = ConnectionManager()

# WebSocket router (can be mounted in your routers)
# from fastapi import APIRouter
# router = APIRouter()

# @router.websocket('/api/ws/notifications/{user_id}')
# async def notifications_ws(websocket: WebSocket, user_id: int):
#     await websocket_manager.connect(user_id, websocket)
#     try:
#         while True:
#             await websocket.receive_text()
#     except WebSocketDisconnect:
#         websocket_manager.disconnect(user_id)
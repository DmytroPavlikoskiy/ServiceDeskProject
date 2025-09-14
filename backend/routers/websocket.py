from fastapi import APIRouter, WebSocketDisconnect, WebSocket
from backend.ws_manager import websocket_manager
ws_router = APIRouter()


@ws_router.websocket('/api/ws/notifications/{user_id}')
async def notifications_ws(websocket: WebSocket, user_id: int):
    await websocket_manager.connect(user_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(user_id)
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List
import json
import asyncio

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        # Fire and forget messages to all clients
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass # Client disconnected abruptly

manager = ConnectionManager()

@router.websocket("/leaderboard")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't expect much incoming data from clients, just ping/pong usually
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Helper function to trigger a leaderboard update event from other routes
async def trigger_leaderboard_update(user_id: int, username: str, new_xp: int):
    event = {
        "type": "xp_update",
        "data": {
            "user_id": user_id,
            "username": username,
            "xp": new_xp
        }
    }
    await manager.broadcast(event)

"""Socket.IO server for real-time event broadcasting."""
import socketio

# Create Socket.IO server (async mode for FastAPI)
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)


@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


@sio.event
async def subscribe_incidents(sid, data):
    """Client subscribes to incident updates."""
    await sio.enter_room(sid, "incidents")


@sio.event
async def subscribe_voice(sid, data):
    """Client subscribes to voice agent updates."""
    await sio.enter_room(sid, "voice")


# Helper functions for broadcasting events
async def emit_new_incident(incident_data: dict):
    """Broadcast new incident to all subscribers."""
    await sio.emit("incident:new", incident_data, room="incidents")


async def emit_incident_update(incident_data: dict):
    """Broadcast incident update."""
    await sio.emit("incident:update", incident_data, room="incidents")


async def emit_voice_event(event_type: str, data: dict):
    """Broadcast voice agent event."""
    await sio.emit(f"voice:{event_type}", data, room="voice")

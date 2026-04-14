"""Additional Socket.IO event handlers."""
from api.websocket.manager import sio


@sio.event
async def subscribe_camera(sid, data):
    """Client subscribes to a specific camera's events."""
    camera_id = data.get("camera_id", "")
    if camera_id:
        await sio.enter_room(sid, f"camera:{camera_id}")


@sio.event
async def subscribe_simulation(sid, data):
    """Client subscribes to simulation events."""
    await sio.enter_room(sid, "simulation")


@sio.event
async def action_incident(sid, data):
    """Client takes an action on an incident."""
    # This event is received from the dashboard when an operator clicks an action button.
    # Broadcast the action to all incident subscribers so other operators see it.
    await sio.emit("incident:action_taken", data, room="incidents")

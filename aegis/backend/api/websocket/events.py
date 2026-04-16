"""Additional Socket.IO event handlers.

IMPORTANT: handlers defined with `@sio.event` register under the function name,
which only works when the frontend emit uses the same identifier. Frontend
events that contain colons (e.g. `action:incident`) MUST be registered with
`@sio.on('action:incident')` — otherwise the handler never fires.

This module is imported for its side-effects (handler registration) from
`main.py`; the import alone is what wires these handlers onto `sio`.
"""
from api.websocket.manager import sio


@sio.on("subscribe_camera")
async def subscribe_camera(sid, data):
    """Client subscribes to a specific camera's events."""
    camera_id = (data or {}).get("camera_id", "")
    if camera_id:
        await sio.enter_room(sid, f"camera:{camera_id}")


@sio.on("subscribe_simulation")
async def subscribe_simulation(sid, data):
    """Client subscribes to simulation events."""
    await sio.enter_room(sid, "simulation")


@sio.on("action:incident")
async def action_incident(sid, data):
    """Client takes an action on an incident.

    Received from the dashboard when an operator clicks an ACT button on the
    Recommendations panel. We rebroadcast on `incident:action_taken` so other
    operators watching the same incident room see the action in real time.
    """
    await sio.emit("incident:action_taken", data, room="incidents")

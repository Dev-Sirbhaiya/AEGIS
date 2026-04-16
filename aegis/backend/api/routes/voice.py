"""Voice agent API endpoints."""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


def get_call_manager():
    """Dependency to get the shared CallManager instance."""
    from main import call_manager
    return call_manager


class StartCallRequest(BaseModel):
    source_id: str
    location_id: str
    call_type: str = "distress"   # "distress" | "patrol"


class ProcessTurnRequest(BaseModel):
    call_id: str
    audio_path: str


@router.post("/start")
async def start_call(
    body: StartCallRequest,
    manager=Depends(get_call_manager),
):
    """Start a new voice agent call session."""
    call = await manager.start_call(
        source_id=body.source_id,
        location_id=body.location_id,
        call_type=body.call_type,
    )
    return {
        "call_id": call.call_id,
        "call_type": call.call_type,
        "status": call.status,
        "location_id": call.location_id,
        "source_id": call.source_id,
        "started_at": call.started_at.isoformat(),
    }


@router.post("/turn")
async def process_turn(
    body: ProcessTurnRequest,
    manager=Depends(get_call_manager),
):
    """Process one audio turn in an active call (STT → LLM → TTS)."""
    result = await manager.process_turn(body.call_id, body.audio_path)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    # Don't return raw audio_bytes in JSON — callers should use WebSocket
    result.pop("audio_bytes", None)
    return result


@router.post("/takeover/{call_id}")
async def takeover_call(
    call_id: str,
    manager=Depends(get_call_manager),
):
    """SOC operator takes over an active voice agent call."""
    result = await manager.takeover(call_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.post("/end/{call_id}")
async def end_call(
    call_id: str,
    manager=Depends(get_call_manager),
):
    """End a call session."""
    result = await manager.end_call(call_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/active")
async def list_active_calls(manager=Depends(get_call_manager)):
    """List all currently active voice agent calls."""
    calls = manager.get_active_calls()
    return {
        "count": len(calls),
        "calls": [
            {
                "call_id": c.call_id,
                "source_id": c.source_id,
                "location_id": c.location_id,
                "started_at": c.started_at.isoformat(),
                "urgency_score": c.urgency_score,
                "alert_raised": c.alert_raised,
                "status": c.status,
            }
            for c in calls
        ],
    }


@router.get("/{call_id}")
async def get_call(
    call_id: str,
    manager=Depends(get_call_manager),
):
    """Get full context for a specific call."""
    context = manager.get_full_context(call_id)
    if not context:
        raise HTTPException(status_code=404, detail="Call not found")
    return context

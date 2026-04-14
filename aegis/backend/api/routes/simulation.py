"""Training simulation endpoints."""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


def get_sim_engine():
    from main import sim_engine
    return sim_engine


class StartSimRequest(BaseModel):
    scenario_id: str
    user_id: str = "anonymous"


class ActionRequest(BaseModel):
    session_id: str
    action_type: str
    details: str = ""


class EndSimRequest(BaseModel):
    session_id: str


@router.get("/scenarios")
async def list_scenarios():
    """List all available training scenarios."""
    engine = get_sim_engine()
    if not engine:
        return {"scenarios": []}
    return {"scenarios": engine.list_scenarios()}


@router.get("/scenarios/{scenario_id}")
async def get_scenario(scenario_id: str):
    """Get full scenario details including event timeline."""
    engine = get_sim_engine()
    scenario = engine.get_scenario(scenario_id) if engine else None
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario


@router.post("/start")
async def start_simulation(body: StartSimRequest):
    """Start a new simulation session."""
    engine = get_sim_engine()
    if not engine:
        raise HTTPException(status_code=503, detail="Simulation engine not available")

    try:
        session = await engine.start_session(body.scenario_id, body.user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return {
        "session_id": session.session_id,
        "scenario_id": session.scenario_id,
        "started_at": session.started_at.isoformat(),
        "status": session.status,
    }


@router.post("/action")
async def submit_action(body: ActionRequest):
    """Record an officer action during an active simulation."""
    engine = get_sim_engine()
    if not engine:
        raise HTTPException(status_code=503, detail="Simulation engine not available")

    session = engine.record_action(body.session_id, body.action_type, body.details)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or not active")

    return {
        "session_id": session.session_id,
        "actions_recorded": len(session.actions),
        "status": "recorded",
    }


@router.post("/end")
async def end_simulation(body: EndSimRequest):
    """End simulation and return score + debrief."""
    engine = get_sim_engine()
    if not engine:
        raise HTTPException(status_code=503, detail="Simulation engine not available")

    session = await engine.end_session(body.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session.session_id,
        "scenario_id": session.scenario_id,
        "total_score": session.total_score,
        "score_breakdown": session.score_breakdown,
        "response_time_seconds": session.response_time_seconds,
        "debrief": session.debrief,
        "actions_taken": len(session.actions),
        "completed_at": session.completed_at.isoformat() if session.completed_at else None,
    }


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get current state of a simulation session."""
    engine = get_sim_engine()
    session = engine.get_session(session_id) if engine else None
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session.session_id,
        "scenario_id": session.scenario_id,
        "started_at": session.started_at.isoformat(),
        "status": session.status,
        "events_delivered": session.events_delivered,
        "actions_count": len(session.actions),
        "response_time_seconds": session.response_time_seconds,
    }

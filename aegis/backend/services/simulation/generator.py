"""
Simulation engine for AEGIS training scenarios.

Manages session lifecycle, event delivery, and scoring.
"""
import asyncio
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional, Any

from services.simulation.evaluator import calculate_score
from services.simulation.scenario_loader import load_scenarios


@dataclass
class SimulationAction:
    timestamp: datetime
    action_type: str
    details: str
    time_from_start_seconds: float


@dataclass
class SimulationSession:
    session_id: str
    user_id: str
    scenario_id: str
    scenario_data: Dict
    started_at: datetime
    status: str  # active | completed
    actions: List[SimulationAction] = field(default_factory=list)
    events_delivered: int = 0
    total_score: int = 0
    response_time_seconds: Optional[int] = None
    debrief: Optional[str] = None
    score_breakdown: Optional[Dict] = None
    completed_at: Optional[datetime] = None


class SimulationEngine:
    def __init__(self, llm_client=None):
        self._sessions: Dict[str, SimulationSession] = {}
        self._scenarios: List[Dict] = []
        self.llm = llm_client

    def load_scenarios(self, scenarios_dir: str = None):
        """Load scenario JSON files from disk."""
        self._scenarios = load_scenarios(scenarios_dir)
        print(f"Simulation engine loaded {len(self._scenarios)} scenarios")

    def list_scenarios(self) -> List[Dict]:
        """Return list of all available scenarios (without full event data)."""
        return [
            {
                "scenario_id": s["scenario_id"],
                "title": s["title"],
                "difficulty": s["difficulty"],
                "severity_level": s["severity_level"],
                "duration_minutes": s.get("duration_minutes", 5),
                "description": s.get("description", ""),
            }
            for s in self._scenarios
        ]

    def get_scenario(self, scenario_id: str) -> Optional[Dict]:
        for s in self._scenarios:
            if s["scenario_id"] == scenario_id:
                return s
        return None

    def _compress_event_timeline(self, events: List[Dict]) -> List[Dict]:
        """Compress authored timelines into a 3-5 second demo cadence."""
        if not events:
            return []

        compressed: List[Dict] = []
        offset = 0

        for index, event in enumerate(events):
            cloned = dict(event)
            if index == 0:
                cloned["time_offset_seconds"] = 0
            else:
                offset += 3 + ((index - 1) % 3)
                cloned["time_offset_seconds"] = offset
            compressed.append(cloned)

        return compressed

    async def start_session(self, scenario_id: str, user_id: str) -> SimulationSession:
        """Start a new simulation session and begin delivering events."""
        scenario = self.get_scenario(scenario_id)
        if not scenario:
            raise ValueError(f"Scenario not found: {scenario_id}")

        scenario_data = dict(scenario)
        scenario_data["events_timeline"] = self._compress_event_timeline(
            scenario.get("events_timeline", [])
        )

        session = SimulationSession(
            session_id=str(uuid.uuid4()),
            user_id=user_id,
            scenario_id=scenario_id,
            scenario_data=scenario_data,
            started_at=datetime.utcnow(),
            status="active",
        )
        self._sessions[session.session_id] = session

        # Deliver events in background
        asyncio.create_task(self._deliver_events(session))

        return session

    def record_action(self, session_id: str, action_type: str, details: str) -> Optional[SimulationSession]:
        """Record an officer action during a session."""
        session = self._sessions.get(session_id)
        if not session or session.status != "active":
            return None

        elapsed = (datetime.utcnow() - session.started_at).total_seconds()

        # Track first response time
        if not session.actions:
            session.response_time_seconds = int(elapsed)

        session.actions.append(SimulationAction(
            timestamp=datetime.utcnow(),
            action_type=action_type,
            details=details,
            time_from_start_seconds=elapsed,
        ))
        return session

    async def end_session(self, session_id: str) -> Optional[SimulationSession]:
        """End a session and generate score + LLM debrief."""
        session = self._sessions.get(session_id)
        if not session:
            return None

        session.status = "completed"
        session.completed_at = datetime.utcnow()

        # Calculate score
        actions_data = [
            {"action_type": a.action_type, "details": a.details, "time": a.time_from_start_seconds}
            for a in session.actions
        ]
        optimal = session.scenario_data.get("optimal_response", {})
        rubric = session.scenario_data.get("scoring_rubric", {})
        first_response = session.response_time_seconds or 999

        breakdown = calculate_score(
            actions=actions_data,
            optimal_response=optimal,
            first_response_time_seconds=first_response,
            scoring_rubric=rubric,
        )
        session.total_score = breakdown["total"]
        session.score_breakdown = breakdown

        # Generate LLM debrief
        session.debrief = await self._generate_debrief(session)

        return session

    def get_session(self, session_id: str) -> Optional[SimulationSession]:
        return self._sessions.get(session_id)

    async def _deliver_events(self, session: SimulationSession):
        """Deliver scenario events on their timeline via WebSocket."""
        events = session.scenario_data.get("events_timeline", [])

        for event in events:
            if session.status != "active":
                break

            time_offset = event.get("time_offset_seconds", 0)
            await asyncio.sleep(time_offset if session.events_delivered == 0 else
                                time_offset - events[max(0, session.events_delivered - 1)].get("time_offset_seconds", 0))

            try:
                from api.websocket.manager import sio
                await sio.emit("simulation:event", {
                    "session_id": session.session_id,
                    "event": event,
                    "time_offset_seconds": time_offset,
                })
            except Exception as e:
                print(f"Simulation event emit failed: {e}")

            session.events_delivered += 1

    async def _generate_debrief(self, session: SimulationSession) -> str:
        """Generate LLM debrief for a completed session."""
        if not self.llm:
            return self._default_debrief(session)

        try:
            from services.intelligence.prompts import TRAINING_DEBRIEF_PROMPT
            import json

            actions_text = "\n".join(
                f"- {a.action_type}: {a.details} (at {int(a.time_from_start_seconds)}s)"
                for a in session.actions
            ) or "No actions taken"

            optimal = session.scenario_data.get("optimal_response", {})
            prompt = TRAINING_DEBRIEF_PROMPT.format(
                scenario_description=session.scenario_data.get("description", session.scenario_id),
                optimal_response=json.dumps(optimal, indent=2),
                officer_actions=actions_text,
                score_breakdown=json.dumps(session.score_breakdown, indent=2),
            )

            response = await self.llm.chat(
                system_prompt="You are a security training evaluator. Respond with valid JSON only.",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=1000,
            )
            return response
        except Exception as e:
            print(f"Debrief generation failed: {e}")
            return self._default_debrief(session)

    def _default_debrief(self, session: SimulationSession) -> str:
        score = session.total_score
        if score >= 80:
            assessment = "Good performance. You responded effectively to the scenario."
        elif score >= 55:
            assessment = "Adequate performance. Some key actions were taken but improvements are needed."
        else:
            assessment = "Below expectations. Review the SOPs for this incident type and retrain."

        return f'{{"overall_assessment": "{assessment}", "what_went_well": [], "areas_for_improvement": [], "key_learnings": ["Review the relevant SOP for this incident type"], "readiness_level": "Developing"}}'

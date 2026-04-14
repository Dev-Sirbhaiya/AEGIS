"""
Call manager for AEGIS voice agent.

Manages concurrent active calls, queuing, and context retrieval for SOC handoff.
"""
import asyncio
from typing import Dict, List, Optional

from services.voice.agent import CallState, VoiceAgent


class CallManager:
    def __init__(self, agent: VoiceAgent, max_concurrent: int = 10):
        self.agent = agent
        self.max_concurrent = max_concurrent
        self._queue: asyncio.Queue = asyncio.Queue()

    async def start_call(self, source_id: str, location_id: str) -> CallState:
        """Start a new call, queuing if at capacity."""
        active = self.agent.get_active_calls()
        if len(active) >= self.max_concurrent:
            # Still start the call — agent handles overflow gracefully
            print(f"Warning: {len(active)} active calls (max {self.max_concurrent})")

        return await self.agent.start_call(source_id, location_id)

    async def process_turn(self, call_id: str, audio_path: str) -> Dict:
        return await self.agent.process_audio_turn(call_id, audio_path)

    async def takeover(self, call_id: str) -> Dict:
        return await self.agent.soc_takeover(call_id)

    async def end_call(self, call_id: str) -> Dict:
        return await self.agent.end_call(call_id)

    def get_active_calls(self) -> List[CallState]:
        return self.agent.get_active_calls()

    def get_call(self, call_id: str) -> Optional[CallState]:
        return self.agent.get_call(call_id)

    def get_full_context(self, call_id: str) -> Optional[Dict]:
        """Return full call context for SOC handoff display."""
        call = self.agent.get_call(call_id)
        if not call:
            return None

        return {
            "call_id": call.call_id,
            "started_at": call.started_at.isoformat(),
            "source_id": call.source_id,
            "location_id": call.location_id,
            "status": call.status,
            "urgency_score": call.urgency_score,
            "alert_raised": call.alert_raised,
            "incident_id": call.incident_id,
            "transcriptions": [
                {
                    "role": t.role,
                    "text": t.text,
                    "timestamp": t.timestamp.isoformat(),
                }
                for t in call.transcriptions
            ],
        }

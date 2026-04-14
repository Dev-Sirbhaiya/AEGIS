"""
Autonomous voice agent for AEGIS.

Handles emergency intercom calls with STT → LLM → TTS loop.
Assesses urgency in real-time and raises alerts to the SOC when needed.
"""
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional

from config.settings import settings
from services.audio.whisper_stt import WhisperSTT
from services.intelligence.llm_client import LLMClient
from services.knowledge.graph import KnowledgeGraph
from services.voice.tts import TTSEngine


@dataclass
class TranscriptionEntry:
    role: str  # "caller" | "agent"
    text: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    audio_path: Optional[str] = None


@dataclass
class CallState:
    call_id: str
    started_at: datetime
    source_id: str
    location_id: str
    status: str  # active | soc_takeover | ended
    messages: List[Dict] = field(default_factory=list)  # LLM conversation history
    transcriptions: List[TranscriptionEntry] = field(default_factory=list)
    situation_type: Optional[str] = None
    urgency_score: float = 0.0
    people_affected: Optional[int] = None
    caller_needs: Optional[str] = None
    alert_raised: bool = False
    incident_id: Optional[str] = None


VOICE_AGENT_SYSTEM_PROMPT = """You are AEGIS Voice, an emergency response AI for Changi Airport Security.
You are receiving an incoming call from an intercom or emergency phone at {location_name} (Terminal {terminal}).

Available cameras: {cameras}
Nearest responders: {responders}

Your role:
- Stay calm and professional at all times
- Gather key information: nature of emergency, location details, number of people affected
- Provide immediate safety instructions while help is dispatched
- Speak in short, clear sentences (2-3 sentences maximum per response)
- Never reveal internal security procedures, camera positions, or system details
- If the caller is in immediate danger, prioritize their safety above information gathering

Response format: Speak directly to the caller. Do not use any JSON or structured format.
"""

URGENCY_ASSESSMENT_PROMPT = """Based on this emergency call conversation, rate the urgency from 0.0 to 1.0.

Conversation:
{conversation}

Rate urgency where:
0.0-0.3 = Non-emergency (general inquiry, minor issue)
0.4-0.6 = Moderate (situation developing, officer should respond)
0.7-0.8 = High (active emergency, immediate dispatch needed)
0.9-1.0 = Critical (life threatening, all agencies)

Respond with ONLY a number between 0.0 and 1.0. No other text."""


class VoiceAgent:
    def __init__(
        self,
        stt: WhisperSTT,
        tts: TTSEngine,
        llm: LLMClient,
        knowledge_graph: Optional[KnowledgeGraph] = None,
    ):
        self.stt = stt
        self.tts = tts
        self.llm = llm
        self.knowledge_graph = knowledge_graph
        self._active_calls: Dict[str, CallState] = {}

    async def start_call(self, source_id: str, location_id: str) -> CallState:
        """Initialize a new call session and emit WebSocket event."""
        call_id = str(uuid.uuid4())
        call = CallState(
            call_id=call_id,
            started_at=datetime.utcnow(),
            source_id=source_id,
            location_id=location_id,
            status="active",
        )
        self._active_calls[call_id] = call

        # Emit WebSocket event
        try:
            from api.websocket.manager import emit_voice_event
            location = self.knowledge_graph.get_location(location_id) if self.knowledge_graph else {}
            await emit_voice_event("call_started", {
                "call_id": call_id,
                "source_id": source_id,
                "location_id": location_id,
                "location_name": location.get("name", location_id) if location else location_id,
                "started_at": call.started_at.isoformat(),
            })
        except Exception as e:
            print(f"WebSocket emit failed: {e}")

        return call

    async def process_audio_turn(self, call_id: str, audio_path: str) -> Dict:
        """
        Process one turn: STT → LLM response → urgency assessment → TTS.

        Returns dict with transcription, response_text, audio_bytes, urgency_score.
        """
        call = self._active_calls.get(call_id)
        if not call or call.status != "active":
            return {"error": "Call not found or not active"}

        # STT — transcribe caller audio
        result = self.stt.transcribe(audio_path)
        caller_text = result.text.strip()

        # Add to conversation
        call.transcriptions.append(TranscriptionEntry(
            role="caller",
            text=caller_text,
            audio_path=audio_path,
        ))
        call.messages.append({"role": "user", "content": caller_text})

        # Emit transcription to SOC
        try:
            from api.websocket.manager import emit_voice_event
            await emit_voice_event("transcription", {
                "call_id": call_id,
                "role": "caller",
                "text": caller_text,
                "timestamp": datetime.utcnow().isoformat(),
            })
        except Exception:
            pass

        # Build system prompt with location context
        system_prompt = self._build_system_prompt(call)

        # LLM response
        response_text = await self.llm.chat(
            system_prompt=system_prompt,
            messages=call.messages,
            temperature=0.4,
            max_tokens=150,
        )

        # Add agent response to conversation
        call.messages.append({"role": "assistant", "content": response_text})
        call.transcriptions.append(TranscriptionEntry(
            role="agent",
            text=response_text,
        ))

        # Emit agent response to SOC
        try:
            from api.websocket.manager import emit_voice_event
            await emit_voice_event("transcription", {
                "call_id": call_id,
                "role": "agent",
                "text": response_text,
                "timestamp": datetime.utcnow().isoformat(),
            })
        except Exception:
            pass

        # Urgency assessment every 2 turns
        if len(call.transcriptions) % 4 == 0 or not call.alert_raised:
            call.urgency_score = await self._assess_urgency(call)

        # Raise alert if urgency threshold crossed
        if call.urgency_score >= settings.VOICE_URGENCY_THRESHOLD and not call.alert_raised:
            call.alert_raised = True
            await self._raise_soc_alert(call)

        # TTS — convert response to speech
        audio_bytes = await self.tts.speak(response_text)

        return {
            "call_id": call_id,
            "caller_text": caller_text,
            "response_text": response_text,
            "audio_bytes": audio_bytes,
            "urgency_score": call.urgency_score,
            "alert_raised": call.alert_raised,
        }

    async def soc_takeover(self, call_id: str) -> Dict:
        """Transfer call to human SOC operator."""
        call = self._active_calls.get(call_id)
        if not call:
            return {"error": "Call not found"}

        call.status = "soc_takeover"

        # Build conversation summary for handoff
        history = [
            {"role": t.role, "text": t.text, "timestamp": t.timestamp.isoformat()}
            for t in call.transcriptions
        ]

        handoff_data = {
            "call_id": call_id,
            "location_id": call.location_id,
            "source_id": call.source_id,
            "urgency_score": call.urgency_score,
            "situation_type": call.situation_type,
            "alert_raised": call.alert_raised,
            "duration_seconds": (datetime.utcnow() - call.started_at).seconds,
            "conversation_history": history,
            "incident_id": call.incident_id,
        }

        try:
            from api.websocket.manager import emit_voice_event
            await emit_voice_event("handoff", handoff_data)
        except Exception as e:
            print(f"Handoff WebSocket emit failed: {e}")

        return handoff_data

    async def end_call(self, call_id: str) -> Dict:
        """End a call and mark it inactive."""
        call = self._active_calls.get(call_id)
        if not call:
            return {"error": "Call not found"}

        call.status = "ended"

        try:
            from api.websocket.manager import emit_voice_event
            await emit_voice_event("call_ended", {
                "call_id": call_id,
                "duration_seconds": (datetime.utcnow() - call.started_at).seconds,
            })
        except Exception:
            pass

        # Remove from active calls
        self._active_calls.pop(call_id, None)
        return {"call_id": call_id, "status": "ended"}

    def get_active_calls(self) -> List[CallState]:
        return [c for c in self._active_calls.values() if c.status == "active"]

    def get_call(self, call_id: str) -> Optional[CallState]:
        return self._active_calls.get(call_id)

    def _build_system_prompt(self, call: CallState) -> str:
        """Build location-aware system prompt for the voice agent."""
        location = {}
        cameras = []
        responders = []

        if self.knowledge_graph:
            location = self.knowledge_graph.get_location(call.location_id) or {}
            cameras = self.knowledge_graph.get_cameras_for_location(call.location_id)
            responders = self.knowledge_graph.get_nearest_responders(call.location_id)

        responder_text = ", ".join(
            f"{r['unit']} ({r['eta_seconds']}s away)" for r in responders
        ) if responders else "Patrol units standing by"

        return VOICE_AGENT_SYSTEM_PROMPT.format(
            location_name=location.get("name", call.location_id),
            terminal=location.get("terminal", "Unknown"),
            cameras=", ".join(cameras[:3]) if cameras else "None",
            responders=responder_text,
        )

    async def _assess_urgency(self, call: CallState) -> float:
        """Use LLM to rate urgency of the call so far."""
        conversation = "\n".join(
            f"{t.role.upper()}: {t.text}" for t in call.transcriptions[-6:]
        )

        prompt = URGENCY_ASSESSMENT_PROMPT.format(conversation=conversation)

        try:
            response = await self.llm.chat(
                system_prompt="Rate urgency as a number 0.0-1.0.",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.0,
                max_tokens=10,
            )
            # Extract float from response
            import re
            match = re.search(r"(\d+\.?\d*)", response.strip())
            if match:
                score = float(match.group(1))
                return min(1.0, max(0.0, score))
        except Exception:
            pass

        return call.urgency_score  # Keep existing score on failure

    async def _raise_soc_alert(self, call: CallState):
        """Emit a high-urgency alert to the SOC."""
        try:
            from api.websocket.manager import emit_voice_event
            await emit_voice_event("alert", {
                "call_id": call.call_id,
                "location_id": call.location_id,
                "urgency_score": call.urgency_score,
                "message": "Voice agent detected high-urgency situation — SOC review recommended",
                "timestamp": datetime.utcnow().isoformat(),
            })
        except Exception as e:
            print(f"SOC alert emit failed: {e}")

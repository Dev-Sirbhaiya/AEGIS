"""
Multimodal fusion engine for AEGIS.

Correlates raw events from video, audio, sensor, and log modalities
into unified incidents with severity scoring and confidence levels.

Multimodal boost:
  1 modality  → 1.00x multiplier, LOW confidence
  2 modalities → 1.15x multiplier, MEDIUM confidence
  3+ modalities → 1.30x multiplier, HIGH confidence
"""
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Set

from services.fusion.severity import score_to_level
from services.knowledge.graph import KnowledgeGraph


@dataclass
class RawEvent:
    event_id: str
    timestamp: datetime
    modality: str  # video | audio | sensor | log
    source_id: str
    event_type: str
    anomaly_score: float
    location_id: str
    data: Dict
    audio_path: Optional[str] = None
    frame_path: Optional[str] = None
    heatmap_path: Optional[str] = None


@dataclass
class Incident:
    incident_id: str
    created_at: datetime
    status: str  # active | investigating | resolved
    severity_level: int  # 1-5
    severity_score: float  # 0.0-1.0
    confidence: str  # LOW | MEDIUM | HIGH
    terminal: Optional[str]
    zone: Optional[str]
    location_id: str
    events: List[RawEvent] = field(default_factory=list)
    modalities: Set[str] = field(default_factory=set)
    explanation: str = ""
    recommendations: List[Dict] = field(default_factory=list)
    contacts: List[Dict] = field(default_factory=list)
    has_video: bool = False
    has_audio: bool = False
    has_log: bool = False
    has_sensor: bool = False
    updated_at: Optional[datetime] = None


class FusionEngine:
    TIME_WINDOW = timedelta(seconds=60)

    def __init__(self, knowledge_graph: Optional[KnowledgeGraph] = None):
        self._incidents: Dict[str, Incident] = {}
        self.knowledge_graph = knowledge_graph or KnowledgeGraph()

    def process_event(self, event: RawEvent) -> Incident:
        """Process a raw event — merge into existing incident or create new one."""
        existing = self._find_matching_incident(event)

        if existing:
            existing.events.append(event)
            existing.modalities.add(event.modality)
            existing.updated_at = datetime.utcnow()
            self._update_modality_flags(existing, event)
            self._recalculate_severity(existing)
            return existing
        else:
            incident = self._create_incident(event)
            self._incidents[incident.incident_id] = incident
            return incident

    def get_incident(self, incident_id: str) -> Optional[Incident]:
        return self._incidents.get(incident_id)

    def get_active_incidents(self) -> List[Incident]:
        return [i for i in self._incidents.values() if i.status == "active"]

    def resolve_incident(self, incident_id: str):
        if incident_id in self._incidents:
            self._incidents[incident_id].status = "resolved"

    def _find_matching_incident(self, event: RawEvent) -> Optional[Incident]:
        """Find an active incident that is recent enough and spatially related."""
        cutoff = event.timestamp - self.TIME_WINDOW

        for incident in self._incidents.values():
            if incident.status != "active":
                continue
            if incident.created_at < cutoff:
                continue

            if incident.location_id == event.location_id:
                return incident

            if self.knowledge_graph.are_locations_adjacent(incident.location_id, event.location_id):
                return incident

        return None

    def _create_incident(self, event: RawEvent) -> Incident:
        """Create a new incident from the first triggering event."""
        location = self.knowledge_graph.get_location(event.location_id) or {}
        terminal = location.get("terminal")
        zone = location.get("zone")

        incident = Incident(
            incident_id=str(uuid.uuid4()),
            created_at=event.timestamp,
            status="active",
            severity_level=score_to_level(event.anomaly_score),
            severity_score=event.anomaly_score,
            confidence="LOW",
            terminal=terminal,
            zone=zone,
            location_id=event.location_id,
            events=[event],
            modalities={event.modality},
            updated_at=event.timestamp,
        )
        self._update_modality_flags(incident, event)
        return incident

    def _recalculate_severity(self, incident: Incident):
        """Recalculate severity score with multimodal confidence boost."""
        base_score = max(e.anomaly_score for e in incident.events)
        modality_count = len(incident.modalities)

        if modality_count >= 3:
            multiplier = 1.30
            incident.confidence = "HIGH"
        elif modality_count == 2:
            multiplier = 1.15
            incident.confidence = "MEDIUM"
        else:
            multiplier = 1.00
            incident.confidence = "LOW"

        incident.severity_score = min(1.0, base_score * multiplier)
        incident.severity_level = score_to_level(incident.severity_score)

    def _update_modality_flags(self, incident: Incident, event: RawEvent):
        """Set boolean flags for each modality present."""
        if event.modality == "video":
            incident.has_video = True
        elif event.modality == "audio":
            incident.has_audio = True
        elif event.modality == "log":
            incident.has_log = True
        elif event.modality == "sensor":
            incident.has_sensor = True

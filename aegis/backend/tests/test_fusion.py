"""Tests for the multimodal fusion engine."""
import pytest
from datetime import datetime
from services.fusion.engine import FusionEngine, RawEvent
from services.fusion.severity import score_to_level


def make_event(
    modality: str = "video",
    location: str = "T2_GATE_B4",
    score: float = 0.8,
    event_id: str = None,
):
    return RawEvent(
        event_id=event_id or f"test_{modality}",
        timestamp=datetime.utcnow(),
        modality=modality,
        source_id=f"SRC_{modality.upper()}",
        event_type="anomaly",
        anomaly_score=score,
        location_id=location,
        data={},
    )


class TestSeverityScoring:
    def test_score_to_level_critical(self):
        assert score_to_level(0.95) == 5

    def test_score_to_level_high(self):
        assert score_to_level(0.80) == 4

    def test_score_to_level_moderate(self):
        assert score_to_level(0.60) == 3

    def test_score_to_level_low(self):
        assert score_to_level(0.30) == 2

    def test_score_to_level_minimal(self):
        assert score_to_level(0.10) == 1


class TestFusionEngine:
    def test_single_event_creates_incident(self):
        engine = FusionEngine()
        event = make_event(score=0.8)
        incident = engine.process_event(event)
        assert incident.incident_id is not None
        assert incident.severity_level == 4
        assert incident.confidence == "LOW"
        assert len(incident.events) == 1

    def test_two_events_same_location_merge(self):
        engine = FusionEngine()
        e1 = make_event(modality="video", score=0.8)
        e2 = make_event(modality="audio", score=0.7)
        i1 = engine.process_event(e1)
        i2 = engine.process_event(e2)
        assert i1.incident_id == i2.incident_id
        assert len(i2.events) == 2

    def test_multimodal_boost_medium(self):
        engine = FusionEngine()
        e1 = make_event(modality="video", score=0.6)
        e2 = make_event(modality="audio", score=0.6)
        engine.process_event(e1)
        incident = engine.process_event(e2)
        assert incident.confidence == "MEDIUM"
        assert incident.severity_score == pytest.approx(0.6 * 1.15, abs=0.01)

    def test_multimodal_boost_high(self):
        engine = FusionEngine()
        for modality in ["video", "audio", "sensor"]:
            e = make_event(modality=modality, score=0.6, event_id=f"id_{modality}")
            incident = engine.process_event(e)
        assert incident.confidence == "HIGH"
        assert incident.severity_score == pytest.approx(min(1.0, 0.6 * 1.30), abs=0.01)

    def test_different_location_creates_separate_incident(self):
        engine = FusionEngine()
        e1 = make_event(location="T2_GATE_B4", score=0.8)
        e2 = make_event(location="T3_ARRIVAL_HALL", score=0.7)
        i1 = engine.process_event(e1)
        i2 = engine.process_event(e2)
        assert i1.incident_id != i2.incident_id

    def test_modality_flags_set_correctly(self):
        engine = FusionEngine()
        e1 = make_event(modality="video", score=0.7)
        e2 = make_event(modality="audio", score=0.6)
        engine.process_event(e1)
        incident = engine.process_event(e2)
        assert incident.has_video is True
        assert incident.has_audio is True
        assert incident.has_sensor is False

    def test_score_capped_at_1(self):
        engine = FusionEngine()
        for modality in ["video", "audio", "sensor", "log"]:
            e = make_event(modality=modality, score=0.99, event_id=f"id_{modality}")
            incident = engine.process_event(e)
        assert incident.severity_score <= 1.0

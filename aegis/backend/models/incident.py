"""Incident model — a unified security incident composed of correlated events."""
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.session import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(20), default="active")  # active | investigating | resolved | false_alarm

    # Severity
    severity_level: Mapped[int] = mapped_column(Integer, default=1)  # 1-5
    confidence: Mapped[str] = mapped_column(String(10), default="LOW")  # LOW | MEDIUM | HIGH
    severity_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Location
    terminal: Mapped[str] = mapped_column(String(10), default="")
    zone: Mapped[str] = mapped_column(String(100), default="")
    location_id: Mapped[str] = mapped_column(String(50), default="")

    # AI Assessment
    explanation: Mapped[str] = mapped_column(Text, default="")
    recommendations: Mapped[dict] = mapped_column(JSON, default=list)
    contacts: Mapped[dict] = mapped_column(JSON, default=list)

    # Modalities involved
    has_video: Mapped[bool] = mapped_column(Boolean, default=False)
    has_audio: Mapped[bool] = mapped_column(Boolean, default=False)
    has_log: Mapped[bool] = mapped_column(Boolean, default=False)
    has_sensor: Mapped[bool] = mapped_column(Boolean, default=False)

    # Resolution
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    response_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    actions_taken: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    resolved_by: Mapped[str | None] = mapped_column(String(36), nullable=True)

    # Relations
    events = relationship("Event", back_populates="incident", lazy="selectin")

    def to_dict(self):
        return {
            "id": self.id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "status": self.status,
            "severity_level": self.severity_level,
            "confidence": self.confidence,
            "severity_score": self.severity_score,
            "terminal": self.terminal,
            "zone": self.zone,
            "location_id": self.location_id,
            "explanation": self.explanation,
            "recommendations": self.recommendations,
            "contacts": self.contacts,
            "has_video": self.has_video,
            "has_audio": self.has_audio,
            "has_log": self.has_log,
            "has_sensor": self.has_sensor,
            "modalities": [m for m, v in [("video", self.has_video), ("audio", self.has_audio), ("log", self.has_log), ("sensor", self.has_sensor)] if v],
            "events": [e.to_dict() for e in self.events] if self.events else [],
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolution_notes": self.resolution_notes,
            "response_time_seconds": self.response_time_seconds,
        }

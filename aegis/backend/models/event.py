"""Event model — a single raw detection from any modality."""
import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.session import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("incidents.id"), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    modality: Mapped[str] = mapped_column(String(20))  # video | audio | log | sensor
    source_id: Mapped[str] = mapped_column(String(50))  # Camera ID, mic ID, door ID, etc.
    event_type: Mapped[str] = mapped_column(String(50))  # visual_anomaly, scream, door_alarm, etc.
    anomaly_score: Mapped[float] = mapped_column(Float, default=0.0)

    # Modality-specific data
    data: Mapped[dict] = mapped_column(JSON, default=dict)

    # File references
    frame_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    heatmap_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    audio_path: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Relations
    incident = relationship("Incident", back_populates="events")

    def to_dict(self):
        return {
            "id": self.id,
            "incident_id": self.incident_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "modality": self.modality,
            "source_id": self.source_id,
            "event_type": self.event_type,
            "anomaly_score": self.anomaly_score,
            "data": self.data,
            "frame_path": self.frame_path,
            "heatmap_path": self.heatmap_path,
            "audio_path": self.audio_path,
        }

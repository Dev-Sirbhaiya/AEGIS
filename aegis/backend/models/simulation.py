"""Simulation session model — training exercise records and scores."""
import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from db.session import Base


class SimulationSession(Base):
    __tablename__ = "simulation_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"))
    scenario_id: Mapped[str] = mapped_column(String(50))
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # Scoring
    total_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_time_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    actions_taken: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    debrief: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Difficulty
    difficulty: Mapped[str] = mapped_column(String(20), default="intermediate")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "scenario_id": self.scenario_id,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "total_score": self.total_score,
            "response_time_seconds": self.response_time_seconds,
            "actions_taken": self.actions_taken,
            "debrief": self.debrief,
            "difficulty": self.difficulty,
        }

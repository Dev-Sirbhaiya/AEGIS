"""Report model — daily and monthly intelligence reports."""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, JSON
from sqlalchemy.orm import Mapped, mapped_column
from db.session import Base


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_type: Mapped[str] = mapped_column(String(20))  # daily | monthly
    period: Mapped[str] = mapped_column(String(20))  # date string (2026-04-08) or month (2026-04)
    content: Mapped[str] = mapped_column(Text, default="")  # LLM-generated report text
    data: Mapped[dict] = mapped_column(JSON, default=dict)  # Raw statistics
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "report_type": self.report_type,
            "period": self.period,
            "content": self.content,
            "data": self.data,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

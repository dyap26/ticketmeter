import uuid
from datetime import datetime
from sqlalchemy import String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class TrackedEvent(Base):
    __tablename__ = "tracked_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    event_id: Mapped[str] = mapped_column(String, ForeignKey("events.id"), nullable=False, index=True)
    target_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    notify_cheapest: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_flash_sale: Mapped[bool] = mapped_column(Boolean, default=True)
    notify_last_minute: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="tracked_events")
    event: Mapped["Event"] = relationship(back_populates="tracked_by")

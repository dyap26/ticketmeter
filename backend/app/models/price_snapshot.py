import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class Platform(str, enum.Enum):
    seatgeek = "seatgeek"
    ticketmaster = "ticketmaster"
    gametime = "gametime"
    mock = "mock"


class PriceSnapshot(Base):
    __tablename__ = "price_snapshots"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    event_id: Mapped[str] = mapped_column(String, ForeignKey("events.id"), nullable=False, index=True)
    platform: Mapped[Platform] = mapped_column(SAEnum(Platform), nullable=False)
    snapshot_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
    min_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    avg_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_price: Mapped[float | None] = mapped_column(Float, nullable=True)
    listing_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    buy_url: Mapped[str | None] = mapped_column(String, nullable=True)

    event: Mapped["Event"] = relationship(back_populates="price_snapshots")

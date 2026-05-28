import uuid
from datetime import datetime
from sqlalchemy import String, Float, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class EventType(str, enum.Enum):
    concert = "concert"
    sport = "sport"


class EventMagnitude(str, enum.Enum):
    preseason = "preseason"
    regular = "regular"
    postseason = "postseason"
    championship = "championship"


class EventSource(str, enum.Enum):
    seatgeek = "seatgeek"
    ticketmaster = "ticketmaster"
    mock = "mock"


class Event(Base):
    __tablename__ = "events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    external_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    source: Mapped[EventSource] = mapped_column(SAEnum(EventSource), default=EventSource.mock)
    title: Mapped[str] = mapped_column(String, nullable=False)
    event_type: Mapped[EventType] = mapped_column(SAEnum(EventType), nullable=False)
    sport_type: Mapped[str | None] = mapped_column(String, nullable=True)
    magnitude: Mapped[EventMagnitude] = mapped_column(SAEnum(EventMagnitude), default=EventMagnitude.regular)
    venue_name: Mapped[str | None] = mapped_column(String, nullable=True)
    venue_city: Mapped[str | None] = mapped_column(String, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    event_datetime: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    home_entity_id: Mapped[str | None] = mapped_column(String, ForeignKey("entities.id"), nullable=True)
    away_entity_id: Mapped[str | None] = mapped_column(String, ForeignKey("entities.id"), nullable=True)
    performer_id: Mapped[str | None] = mapped_column(String, ForeignKey("entities.id"), nullable=True)
    popularity_score: Mapped[float] = mapped_column(Float, default=50.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    price_snapshots: Mapped[list["PriceSnapshot"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    tracked_by: Mapped[list["TrackedEvent"]] = relationship(back_populates="event", cascade="all, delete-orphan")
    notifications: Mapped[list["Notification"]] = relationship(back_populates="event", cascade="all, delete-orphan")

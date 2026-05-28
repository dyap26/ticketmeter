import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class EntityType(str, enum.Enum):
    team = "team"
    artist = "artist"


class Entity(Base):
    __tablename__ = "entities"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String, nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    entity_type: Mapped[EntityType] = mapped_column(SAEnum(EntityType), nullable=False)
    sport_genre: Mapped[str | None] = mapped_column(String, nullable=True)
    popularity_score: Mapped[float] = mapped_column(Float, default=50.0)
    win_streak: Mapped[int] = mapped_column(Integer, default=0)
    recent_form: Mapped[str | None] = mapped_column(String, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    tracked_by: Mapped[list["UserTrackedEntity"]] = relationship(back_populates="entity", cascade="all, delete-orphan")


class UserTrackedEntity(Base):
    __tablename__ = "user_tracked_entities"

    user_id: Mapped[str] = mapped_column(String, primary_key=True)
    entity_id: Mapped[str] = mapped_column(String, primary_key=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="tracked_entities")
    entity: Mapped[Entity] = relationship(back_populates="tracked_by")

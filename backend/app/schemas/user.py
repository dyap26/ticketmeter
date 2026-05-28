from pydantic import BaseModel, EmailStr
from typing import Optional


class UpdateUserRequest(BaseModel):
    display_name: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    notification_email: Optional[bool] = None
    notification_push: Optional[bool] = None
    push_subscription: Optional[str] = None


class TrackEventRequest(BaseModel):
    event_id: str
    target_price: Optional[float] = None
    notify_cheapest: bool = True
    notify_flash_sale: bool = True
    notify_last_minute: bool = True


class TrackedEventOut(BaseModel):
    id: str
    event_id: str
    target_price: Optional[float]
    notify_cheapest: bool
    notify_flash_sale: bool
    notify_last_minute: bool

    class Config:
        from_attributes = True


class EntityOut(BaseModel):
    id: str
    name: str
    slug: str
    entity_type: str
    sport_genre: Optional[str]
    popularity_score: float
    win_streak: int
    recent_form: Optional[str]

    class Config:
        from_attributes = True


class TrackEntityRequest(BaseModel):
    entity_id: str


class PushSubscriptionRequest(BaseModel):
    subscription: str

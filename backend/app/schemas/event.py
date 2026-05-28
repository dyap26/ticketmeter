from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class EventSummary(BaseModel):
    id: str
    title: str
    event_type: str
    magnitude: str
    venue_name: Optional[str]
    venue_city: Optional[str]
    event_datetime: datetime
    image_url: Optional[str]
    popularity_score: float
    min_price: Optional[float] = None
    avg_price: Optional[float] = None
    buy_score: Optional[int] = None
    recommendation: Optional[str] = None
    distance_miles: Optional[float] = None

    class Config:
        from_attributes = True


class EventDetail(EventSummary):
    external_id: Optional[str]
    source: str
    sport_type: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]


class PriceHistoryPoint(BaseModel):
    date: str
    min: Optional[float]
    avg: Optional[float]
    platform: str


class PredictedPoint(BaseModel):
    date: str
    min_est: float
    avg_est: float
    confidence: float


class PriceHistoryResponse(BaseModel):
    historical: list[PriceHistoryPoint]
    predicted: list[PredictedPoint]


class PredictionResponse(BaseModel):
    score: int
    recommendation: str
    confidence: float
    reasoning: list[str]
    best_window_start: Optional[str]
    best_window_end: Optional[str]


class BuyLink(BaseModel):
    platform: str
    url: str
    min_price: Optional[float]
    display_name: str


class NewsArticle(BaseModel):
    title: str
    url: str
    published_at: str
    source: Optional[str]
    sentiment_score: Optional[float]

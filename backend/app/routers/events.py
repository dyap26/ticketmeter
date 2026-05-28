from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
from app.database import get_db
from app.deps import get_optional_user
from app.models.event import Event
from app.models.price_snapshot import PriceSnapshot
from app.models.entity import Entity
from app.schemas.event import (
    EventSummary, EventDetail, PriceHistoryResponse,
    PriceHistoryPoint, PredictedPoint, PredictionResponse,
    BuyLink, NewsArticle
)
from app.services.ticket_apis import get_events_mock, get_event_prices
from app.services.price_prediction import compute_prediction, generate_price_prediction_series
from app.services.news_scraper import fetch_news, average_sentiment
import asyncio

router = APIRouter()


@router.get("/", response_model=List[EventSummary])
async def list_events(
    lat: float = Query(34.05),
    lon: float = Query(-118.24),
    radius_miles: float = Query(50.0),
    q: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    raw = get_events_mock(lat, lon, radius_miles, q, category)
    results = []
    for ev in raw:
        pred = compute_prediction(
            event_datetime=datetime.fromisoformat(ev["event_datetime"]),
            magnitude=ev.get("magnitude", "regular"),
            popularity_score=ev.get("popularity_score", 50),
        )
        results.append(EventSummary(
            id=ev["id"],
            title=ev["title"],
            event_type=ev["event_type"],
            magnitude=ev.get("magnitude", "regular"),
            venue_name=ev.get("venue_name"),
            venue_city=ev.get("venue_city"),
            event_datetime=datetime.fromisoformat(ev["event_datetime"]),
            image_url=ev.get("image_url"),
            popularity_score=ev.get("popularity_score", 50),
            min_price=ev.get("min_price"),
            avg_price=ev.get("avg_price"),
            buy_score=pred["score"],
            recommendation=pred["recommendation"],
            distance_miles=ev.get("distance_miles"),
        ))
    return results


@router.get("/{event_id}", response_model=EventDetail)
async def get_event(event_id: str, db: Session = Depends(get_db)):
    from app.services.ticket_apis import MOCK_EVENTS
    ev = next((e for e in MOCK_EVENTS if e["id"] == event_id), None)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    pred = compute_prediction(
        event_datetime=datetime.fromisoformat(ev["event_datetime"]),
        magnitude=ev.get("magnitude", "regular"),
        popularity_score=ev.get("popularity_score", 50),
    )
    return EventDetail(
        id=ev["id"],
        external_id=ev.get("external_id"),
        source=ev.get("source", "mock"),
        title=ev["title"],
        event_type=ev["event_type"],
        sport_type=ev.get("sport_type"),
        magnitude=ev.get("magnitude", "regular"),
        venue_name=ev.get("venue_name"),
        venue_city=ev.get("venue_city"),
        latitude=ev.get("latitude"),
        longitude=ev.get("longitude"),
        event_datetime=datetime.fromisoformat(ev["event_datetime"]),
        image_url=ev.get("image_url"),
        popularity_score=ev.get("popularity_score", 50),
        min_price=ev.get("min_price"),
        avg_price=ev.get("avg_price"),
        buy_score=pred["score"],
        recommendation=pred["recommendation"],
    )


@router.get("/{event_id}/price-history", response_model=PriceHistoryResponse)
async def get_price_history(event_id: str, db: Session = Depends(get_db)):
    from app.services.ticket_apis import MOCK_EVENTS
    from datetime import timedelta
    import random, math

    ev = next((e for e in MOCK_EVENTS if e["id"] == event_id), None)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    event_dt = datetime.fromisoformat(ev["event_datetime"])
    base_min = ev.get("min_price", 80)
    base_avg = ev.get("avg_price", 160)

    # Generate 30 days of historical mock snapshots
    historical = []
    for i in range(29, -1, -1):
        date = datetime.utcnow() - timedelta(days=i)
        days_remaining = (event_dt - date).days
        factor = 1.0 + (1.0 - min(days_remaining, 90) / 90.0) * 0.4
        noise = math.sin(i * 1.1) * 0.05
        historical.append(PriceHistoryPoint(
            date=date.strftime("%Y-%m-%d"),
            min=round(base_min * (factor + noise), 2),
            avg=round(base_avg * (factor + noise * 0.7), 2),
            platform="combined",
        ))

    predicted = [
        PredictedPoint(**p)
        for p in generate_price_prediction_series(base_min, base_avg, event_dt, ev.get("magnitude", "regular"), 30)
    ]

    return PriceHistoryResponse(historical=historical, predicted=predicted)


@router.get("/{event_id}/prediction", response_model=PredictionResponse)
async def get_prediction(event_id: str):
    from app.services.ticket_apis import MOCK_EVENTS
    ev = next((e for e in MOCK_EVENTS if e["id"] == event_id), None)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    news = await fetch_news(ev["title"])
    sentiment = average_sentiment(news)

    result = compute_prediction(
        event_datetime=datetime.fromisoformat(ev["event_datetime"]),
        magnitude=ev.get("magnitude", "regular"),
        popularity_score=ev.get("popularity_score", 50),
        recent_news_sentiment=sentiment,
    )
    return PredictionResponse(**result)


@router.get("/{event_id}/buy-links", response_model=List[BuyLink])
async def get_buy_links(event_id: str):
    from app.services.ticket_apis import MOCK_EVENTS
    ev = next((e for e in MOCK_EVENTS if e["id"] == event_id), None)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")

    prices = await get_event_prices(event_id, ev.get("source", "mock"))
    links = []
    platform_names = {"seatgeek": "SeatGeek", "ticketmaster": "Ticketmaster", "gametime": "GameTime"}
    for platform, data in prices.items():
        links.append(BuyLink(
            platform=platform,
            url=data["buy_url"],
            min_price=data.get("min_price"),
            display_name=platform_names.get(platform, platform.title()),
        ))
    links.sort(key=lambda x: x.min_price or float("inf"))
    return links


@router.get("/{event_id}/news", response_model=List[NewsArticle])
async def get_event_news(event_id: str):
    from app.services.ticket_apis import MOCK_EVENTS
    ev = next((e for e in MOCK_EVENTS if e["id"] == event_id), None)
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    articles = await fetch_news(ev["title"])
    return [NewsArticle(**a) for a in articles]

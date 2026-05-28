"""
Adapters for SeatGeek and Ticketmaster APIs.
Falls back to realistic mock data when USE_MOCK_DATA=true or keys are missing.
"""
import math
import uuid
import random
from datetime import datetime, timedelta
from typing import Optional
import httpx
from app.config import settings


MOCK_EVENTS = [
    {
        "id": "mock-001",
        "external_id": "sg-001",
        "source": "mock",
        "title": "Lakers vs Celtics",
        "event_type": "sport",
        "sport_type": "NBA",
        "magnitude": "regular",
        "venue_name": "Crypto.com Arena",
        "venue_city": "Los Angeles",
        "latitude": 34.0430,
        "longitude": -118.2673,
        "event_datetime": (datetime.utcnow() + timedelta(days=12)).isoformat(),
        "image_url": "https://images.unsplash.com/photo-1546519638405-a9f55d2fb13a?w=800",
        "popularity_score": 88.0,
        "min_price": 85.0,
        "avg_price": 175.0,
    },
    {
        "id": "mock-002",
        "external_id": "sg-002",
        "source": "mock",
        "title": "Taylor Swift — The Eras Tour",
        "event_type": "concert",
        "sport_type": None,
        "magnitude": "championship",
        "venue_name": "SoFi Stadium",
        "venue_city": "Inglewood",
        "latitude": 33.9534,
        "longitude": -118.3392,
        "event_datetime": (datetime.utcnow() + timedelta(days=45)).isoformat(),
        "image_url": "https://images.unsplash.com/photo-1501386761578-eaa54b9a6b0a?w=800",
        "popularity_score": 99.0,
        "min_price": 350.0,
        "avg_price": 850.0,
    },
    {
        "id": "mock-003",
        "external_id": "sg-003",
        "source": "mock",
        "title": "Dodgers vs Giants",
        "event_type": "sport",
        "sport_type": "MLB",
        "magnitude": "postseason",
        "venue_name": "Dodger Stadium",
        "venue_city": "Los Angeles",
        "latitude": 34.0739,
        "longitude": -118.2400,
        "event_datetime": (datetime.utcnow() + timedelta(days=7)).isoformat(),
        "image_url": "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800",
        "popularity_score": 91.0,
        "min_price": 65.0,
        "avg_price": 145.0,
    },
    {
        "id": "mock-004",
        "external_id": "sg-004",
        "source": "mock",
        "title": "Bad Bunny World's Hottest Tour",
        "event_type": "concert",
        "sport_type": None,
        "magnitude": "regular",
        "venue_name": "Kia Forum",
        "venue_city": "Inglewood",
        "latitude": 33.9583,
        "longitude": -118.3416,
        "event_datetime": (datetime.utcnow() + timedelta(days=28)).isoformat(),
        "image_url": "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        "popularity_score": 82.0,
        "min_price": 120.0,
        "avg_price": 285.0,
    },
    {
        "id": "mock-005",
        "external_id": "sg-005",
        "source": "mock",
        "title": "Rams vs 49ers",
        "event_type": "sport",
        "sport_type": "NFL",
        "magnitude": "postseason",
        "venue_name": "SoFi Stadium",
        "venue_city": "Inglewood",
        "latitude": 33.9534,
        "longitude": -118.3392,
        "event_datetime": (datetime.utcnow() + timedelta(days=21)).isoformat(),
        "image_url": "https://images.unsplash.com/photo-1508098682722-e99c643e7f0b?w=800",
        "popularity_score": 87.0,
        "min_price": 195.0,
        "avg_price": 390.0,
    },
    {
        "id": "mock-006",
        "external_id": "sg-006",
        "source": "mock",
        "title": "Kendrick Lamar — Grand National Tour",
        "event_type": "concert",
        "sport_type": None,
        "magnitude": "regular",
        "venue_name": "Banc of California Stadium",
        "venue_city": "Los Angeles",
        "latitude": 34.0138,
        "longitude": -118.2843,
        "event_datetime": (datetime.utcnow() + timedelta(days=35)).isoformat(),
        "image_url": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
        "popularity_score": 93.0,
        "min_price": 98.0,
        "avg_price": 220.0,
    },
    {
        "id": "mock-007",
        "external_id": "sg-007",
        "source": "mock",
        "title": "Kings vs Sharks",
        "event_type": "sport",
        "sport_type": "NHL",
        "magnitude": "regular",
        "venue_name": "Crypto.com Arena",
        "venue_city": "Los Angeles",
        "latitude": 34.0430,
        "longitude": -118.2673,
        "event_datetime": (datetime.utcnow() + timedelta(days=5)).isoformat(),
        "image_url": "https://images.unsplash.com/photo-1515703407324-5f753afd8be8?w=800",
        "popularity_score": 71.0,
        "min_price": 45.0,
        "avg_price": 105.0,
    },
    {
        "id": "mock-008",
        "external_id": "sg-008",
        "source": "mock",
        "title": "Olivia Rodrigo — GUTS World Tour",
        "event_type": "concert",
        "sport_type": None,
        "magnitude": "regular",
        "venue_name": "Hollywood Bowl",
        "venue_city": "Los Angeles",
        "latitude": 34.1122,
        "longitude": -118.3391,
        "event_datetime": (datetime.utcnow() + timedelta(days=18)).isoformat(),
        "image_url": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
        "popularity_score": 85.0,
        "min_price": 75.0,
        "avg_price": 165.0,
    },
]


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 3958.8
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def get_events_mock(
    lat: float = 34.05,
    lon: float = -118.24,
    radius_miles: float = 50,
    q: Optional[str] = None,
    category: Optional[str] = None,
) -> list[dict]:
    results = []
    for ev in MOCK_EVENTS:
        dist = _haversine(lat, lon, ev["latitude"], ev["longitude"])
        if dist > radius_miles:
            continue
        if q and q.lower() not in ev["title"].lower():
            continue
        if category and ev["event_type"] != category:
            continue
        results.append({**ev, "distance_miles": round(dist, 1)})
    return sorted(results, key=lambda e: e["event_datetime"])


async def get_events_seatgeek(
    lat: float, lon: float, radius_miles: float = 50, q: Optional[str] = None
) -> list[dict]:
    if not settings.SEATGEEK_CLIENT_ID or settings.USE_MOCK_DATA:
        return get_events_mock(lat, lon, radius_miles, q)
    async with httpx.AsyncClient() as client:
        params = {
            "client_id": settings.SEATGEEK_CLIENT_ID,
            "client_secret": settings.SEATGEEK_SECRET,
            "lat": lat,
            "lon": lon,
            "range": f"{int(radius_miles)}mi",
            "per_page": 20,
        }
        if q:
            params["q"] = q
        resp = await client.get("https://api.seatgeek.com/2/events", params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return [_normalize_seatgeek(ev) for ev in data.get("events", [])]


def _normalize_seatgeek(ev: dict) -> dict:
    venue = ev.get("venue", {})
    stats = ev.get("stats", {})
    return {
        "id": str(uuid.uuid4()),
        "external_id": str(ev.get("id")),
        "source": "seatgeek",
        "title": ev.get("title", ""),
        "event_type": "concert" if ev.get("type") == "concert" else "sport",
        "sport_type": ev.get("type"),
        "magnitude": "regular",
        "venue_name": venue.get("name"),
        "venue_city": venue.get("city"),
        "latitude": venue.get("location", {}).get("lat"),
        "longitude": venue.get("location", {}).get("lon"),
        "event_datetime": ev.get("datetime_utc"),
        "image_url": ev.get("performers", [{}])[0].get("image") if ev.get("performers") else None,
        "popularity_score": ev.get("score", 0) * 100,
        "min_price": stats.get("lowest_price"),
        "avg_price": stats.get("average_price"),
    }


async def get_event_prices(event_external_id: str, source: str) -> dict:
    if settings.USE_MOCK_DATA or source == "mock":
        mock = next((e for e in MOCK_EVENTS if e["id"] == event_external_id), MOCK_EVENTS[0])
        base_min = mock["min_price"]
        base_avg = mock["avg_price"]
        jitter = random.uniform(0.95, 1.05)
        return {
            "seatgeek": {
                "min_price": round(base_min * jitter, 2),
                "avg_price": round(base_avg * jitter, 2),
                "listing_count": random.randint(40, 250),
                "buy_url": f"https://seatgeek.com/events/{event_external_id}",
            },
            "ticketmaster": {
                "min_price": round(base_min * random.uniform(1.02, 1.15), 2),
                "avg_price": round(base_avg * random.uniform(1.05, 1.20), 2),
                "listing_count": random.randint(20, 150),
                "buy_url": f"https://ticketmaster.com/event/{event_external_id}",
            },
            "gametime": {
                "min_price": round(base_min * random.uniform(0.90, 1.05), 2),
                "avg_price": round(base_avg * random.uniform(0.95, 1.10), 2),
                "listing_count": random.randint(15, 100),
                "buy_url": f"https://gametime.co/events/{event_external_id}",
            },
        }
    return {}

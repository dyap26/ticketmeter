"""
Fetch news articles relevant to an event. Uses NewsAPI when key is available,
falls back to mock articles for development.
"""
import httpx
from datetime import datetime, timedelta
from app.config import settings

MOCK_NEWS = {
    "Lakers": [
        {"title": "Lakers clinch playoff spot with dominant win", "url": "https://example.com/1", "published_at": (datetime.utcnow() - timedelta(hours=6)).isoformat(), "source": "ESPN", "sentiment_score": 0.7},
        {"title": "LeBron James expected to play despite minor injury", "url": "https://example.com/2", "published_at": (datetime.utcnow() - timedelta(days=1)).isoformat(), "source": "Bleacher Report", "sentiment_score": 0.2},
    ],
    "Taylor Swift": [
        {"title": "Taylor Swift breaks Spotify streaming record ahead of tour", "url": "https://example.com/3", "published_at": (datetime.utcnow() - timedelta(hours=12)).isoformat(), "source": "Billboard", "sentiment_score": 0.9},
        {"title": "Eras Tour tickets selling out in minutes — fans frustrated", "url": "https://example.com/4", "published_at": (datetime.utcnow() - timedelta(days=2)).isoformat(), "source": "Variety", "sentiment_score": 0.1},
    ],
    "Dodgers": [
        {"title": "Dodgers sweep Giants in dramatic three-game series", "url": "https://example.com/5", "published_at": (datetime.utcnow() - timedelta(hours=3)).isoformat(), "source": "LA Times", "sentiment_score": 0.85},
    ],
    "default": [
        {"title": "Live event ticket demand hits all-time high this season", "url": "https://example.com/6", "published_at": (datetime.utcnow() - timedelta(days=1)).isoformat(), "source": "Pollstar", "sentiment_score": 0.5},
        {"title": "Secondary market prices surge for top-tier events", "url": "https://example.com/7", "published_at": (datetime.utcnow() - timedelta(days=3)).isoformat(), "source": "StubHub Blog", "sentiment_score": 0.3},
    ],
}


async def fetch_news(query: str, max_articles: int = 5) -> list[dict]:
    if not settings.NEWSAPI_KEY or settings.USE_MOCK_DATA:
        return _mock_news(query, max_articles)

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": query,
                    "sortBy": "publishedAt",
                    "pageSize": max_articles,
                    "language": "en",
                    "apiKey": settings.NEWSAPI_KEY,
                },
                timeout=8,
            )
            resp.raise_for_status()
            articles = resp.json().get("articles", [])
            return [
                {
                    "title": a["title"],
                    "url": a["url"],
                    "published_at": a["publishedAt"],
                    "source": a.get("source", {}).get("name"),
                    "sentiment_score": _simple_sentiment(a.get("title", "") + " " + (a.get("description") or "")),
                }
                for a in articles
            ]
    except Exception:
        return _mock_news(query, max_articles)


def _mock_news(query: str, limit: int) -> list[dict]:
    for key, articles in MOCK_NEWS.items():
        if key.lower() in query.lower():
            return articles[:limit]
    return MOCK_NEWS["default"][:limit]


def _simple_sentiment(text: str) -> float:
    positive = ["win", "record", "dominat", "sold out", "best", "great", "clinch", "sweep", "surge"]
    negative = ["injur", "loss", "cancel", "disappoint", "frustrat", "slump"]
    score = 0
    t = text.lower()
    for w in positive:
        if w in t:
            score += 0.2
    for w in negative:
        if w in t:
            score -= 0.2
    return round(max(-1.0, min(1.0, score)), 2)


def average_sentiment(articles: list[dict]) -> float:
    if not articles:
        return 0.0
    scores = [a.get("sentiment_score", 0.0) or 0.0 for a in articles]
    return round(sum(scores) / len(scores), 2)

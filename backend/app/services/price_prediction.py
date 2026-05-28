"""
When-to-Buy heuristic engine.
Score 0 = Buy Right Now, 100 = Prices will drop — Wait.
"""
from datetime import datetime, timedelta
from typing import Optional
import math


MAGNITUDE_WEIGHTS = {
    "preseason": 0.5,
    "regular": 1.0,
    "postseason": 1.5,
    "championship": 2.5,
}

# Base "wait score" by days until event.
# High score = prices likely to fall, low = buy now (prices rising or event imminent)
BASE_CURVE: list[tuple[int, int]] = [
    (120, 70),   # 4+ months: high supply, good time to wait
    (90,  65),   # 3 months: slight dip, wait
    (60,  55),   # 2 months: neutral-ish
    (45,  50),   # 6 weeks: prices start climbing
    (30,  40),   # 1 month: rising demand
    (21,  35),   # 3 weeks: notable rise
    (14,  28),   # 2 weeks: rapid rise
    (7,   20),   # 1 week: high urgency (except day-of dump)
    (3,   15),   # 3 days: near peak
    (1,   25),   # day before: some dump
    (0,   35),   # day of: last-minute dump (except championships)
]


def _base_score(days: int) -> int:
    for threshold, score in BASE_CURVE:
        if days >= threshold:
            return score
    return 35


def compute_prediction(
    event_datetime: datetime,
    magnitude: str = "regular",
    popularity_score: float = 50.0,
    win_streak: int = 0,
    recent_news_sentiment: float = 0.0,
    listing_count_trend: str = "stable",
    price_trend_7d_pct: float = 0.0,
) -> dict:
    now = datetime.utcnow()
    days = max(0, (event_datetime - now).days)

    base = _base_score(days)

    mag = MAGNITUDE_WEIGHTS.get(magnitude, 1.0)
    magnitude_adj = min(mag * 12, 28)

    popularity_adj = (popularity_score / 100.0) * 8

    supply_adj = -10 if listing_count_trend == "decreasing" else (5 if listing_count_trend == "increasing" else 0)

    news_adj = recent_news_sentiment * 7

    streak_adj = min(win_streak * 1.5, 12)

    trend_adj = -price_trend_7d_pct * 0.5

    raw = base - magnitude_adj - popularity_adj + supply_adj - news_adj - streak_adj + trend_adj
    score = int(max(0, min(100, raw)))

    if score < 30:
        recommendation = "Buy Now"
        reasoning_score = "Prices are at or near a low point — buy soon before they rise."
    elif score > 65:
        recommendation = "Wait"
        reasoning_score = "Prices are likely to drop closer to the event."
    else:
        recommendation = "Neutral"
        reasoning_score = "Prices are stable — monitor and buy when comfortable."

    reasoning = [reasoning_score]
    if magnitude_adj > 15:
        reasoning.append(f"High-magnitude event ({magnitude}) — prices spike late.")
    if popularity_adj > 5:
        reasoning.append("Popular performer/team drives sustained demand.")
    if win_streak > 2:
        reasoning.append(f"Team on a {win_streak}-game win streak — demand is elevated.")
    if recent_news_sentiment > 0.3:
        reasoning.append("Positive recent news is boosting demand.")
    if listing_count_trend == "decreasing":
        reasoning.append("Ticket supply is shrinking — act soon.")
    if price_trend_7d_pct > 5:
        reasoning.append(f"Prices rose ~{price_trend_7d_pct:.0f}% over the last 7 days.")

    confidence = _confidence(days, len(reasoning))

    best_start, best_end = _best_window(event_datetime, magnitude, days)

    return {
        "score": score,
        "recommendation": recommendation,
        "confidence": confidence,
        "reasoning": reasoning,
        "best_window_start": best_start,
        "best_window_end": best_end,
    }


def _confidence(days: int, signal_count: int) -> float:
    if days > 90:
        base = 0.45
    elif days > 30:
        base = 0.60
    elif days > 7:
        base = 0.75
    else:
        base = 0.85
    bonus = min(signal_count * 0.04, 0.15)
    return round(min(base + bonus, 0.95), 2)


def _best_window(event_datetime: datetime, magnitude: str, days_until: int) -> tuple[Optional[str], Optional[str]]:
    if magnitude == "championship":
        if days_until > 30:
            start = event_datetime - timedelta(days=30)
            end = event_datetime - timedelta(days=20)
        else:
            return None, None
    elif days_until <= 3:
        return (datetime.utcnow()).strftime("%Y-%m-%d"), event_datetime.strftime("%Y-%m-%d")
    elif days_until > 60:
        start = datetime.utcnow() + timedelta(days=int(days_until * 0.4))
        end = start + timedelta(days=14)
    else:
        start = datetime.utcnow()
        end = datetime.utcnow() + timedelta(days=max(1, int(days_until * 0.3)))

    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


def generate_price_prediction_series(
    base_min: float,
    base_avg: float,
    event_datetime: datetime,
    magnitude: str = "regular",
    days_ahead: int = 30,
) -> list[dict]:
    now = datetime.utcnow()
    series = []
    mag = MAGNITUDE_WEIGHTS.get(magnitude, 1.0)

    for i in range(days_ahead):
        future_date = now + timedelta(days=i)
        if future_date >= event_datetime:
            break
        days_remaining = (event_datetime - future_date).days
        curve = _base_score(days_remaining) / 100.0
        price_factor = 1.0 + (1.0 - curve) * 0.6 * mag
        noise = math.sin(i * 0.7) * 0.03
        min_est = round(base_min * (price_factor + noise), 2)
        avg_est = round(base_avg * (price_factor + noise * 0.8), 2)
        confidence = _confidence(days_remaining, 2)
        series.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "min_est": min_est,
            "avg_est": avg_est,
            "confidence": confidence,
        })
    return series

"""
Background task: polls ticket prices and triggers notifications.
"""
import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.event import Event
from app.models.price_snapshot import PriceSnapshot, Platform
from app.models.tracked_event import TrackedEvent
from app.models.notification import Notification, NotificationType
from app.services.notification_service import notify_user
import asyncio

logger = logging.getLogger(__name__)


def poll_prices():
    db: Session = SessionLocal()
    try:
        events = db.query(Event).all()
        for event in events:
            try:
                _process_event(db, event)
            except Exception as e:
                logger.error(f"Error polling event {event.id}: {e}")
        db.commit()
    finally:
        db.close()


def _process_event(db: Session, event: Event):
    from app.services.ticket_apis import get_event_prices
    prices = asyncio.run(get_event_prices(event.id, event.source.value))

    for platform_name, data in prices.items():
        snapshot = PriceSnapshot(
            event_id=event.id,
            platform=Platform(platform_name),
            min_price=data.get("min_price"),
            avg_price=data.get("avg_price"),
            max_price=data.get("max_price"),
            listing_count=data.get("listing_count"),
            buy_url=data.get("buy_url"),
        )
        db.add(snapshot)

    _check_alerts(db, event)


def _check_alerts(db: Session, event: Event):
    now = datetime.utcnow()
    recent = (
        db.query(PriceSnapshot)
        .filter(PriceSnapshot.event_id == event.id)
        .order_by(PriceSnapshot.snapshot_at.desc())
        .limit(10)
        .all()
    )
    if len(recent) < 2:
        return

    current_min = min((s.min_price for s in recent[:2] if s.min_price), default=None)
    prev_min = min((s.min_price for s in recent[2:] if s.min_price), default=None)

    if not current_min or not prev_min:
        return

    week_ago_min = min((s.min_price for s in recent if s.min_price), default=current_min)

    trackers = db.query(TrackedEvent).filter(TrackedEvent.event_id == event.id).all()

    for tracker in trackers:
        user = tracker.user

        if tracker.notify_cheapest and current_min < week_ago_min:
            _send_notification(db, user, event, NotificationType.cheapest,
                               f"New low price ${current_min:.0f} for {event.title}!")

        drop_pct = (prev_min - current_min) / prev_min * 100 if prev_min else 0
        if tracker.notify_flash_sale and drop_pct >= 15:
            _send_notification(db, user, event, NotificationType.flash_sale,
                               f"Flash sale! {event.title} tickets dropped {drop_pct:.0f}% to ${current_min:.0f}")

        if tracker.notify_last_minute:
            hours_until = (event.event_datetime - now).total_seconds() / 3600
            for threshold in [24, 2, 0.5]:
                if abs(hours_until - threshold) < 0.5:
                    _send_notification(db, user, event, NotificationType.last_minute,
                                       f"Last chance! {event.title} starts in {threshold:.0f}h. Min price: ${current_min:.0f}")


def _send_notification(db: Session, user, event: Event, notif_type: NotificationType, message: str):
    already_sent = db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.event_id == event.id,
        Notification.type == notif_type,
    ).first()
    if already_sent:
        return
    notif = Notification(user_id=user.id, event_id=event.id, type=notif_type, message=message)
    db.add(notif)
    notify_user(user, event.title, notif_type.value, message, event.id)

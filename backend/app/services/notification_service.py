"""
Dispatch Web Push and email notifications.
"""
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)


def send_push(subscription_json: str, title: str, body: str, url: str = "/") -> bool:
    if not settings.VAPID_PRIVATE_KEY:
        logger.info(f"[PUSH MOCK] {title}: {body}")
        return True
    try:
        from pywebpush import webpush, WebPushException
        subscription = json.loads(subscription_json)
        webpush(
            subscription_info=subscription,
            data=json.dumps({"title": title, "body": body, "url": url}),
            vapid_private_key=settings.VAPID_PRIVATE_KEY,
            vapid_claims={"sub": f"mailto:{settings.VAPID_CLAIMS_EMAIL}"},
        )
        return True
    except Exception as e:
        logger.error(f"Push failed: {e}")
        return False


def send_email(to_email: str, subject: str, html: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.info(f"[EMAIL MOCK] To: {to_email} | {subject}")
        return True
    try:
        import resend
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": "TicketMeter <noreply@ticketmeter.app>",
            "to": to_email,
            "subject": subject,
            "html": html,
        })
        return True
    except Exception as e:
        logger.error(f"Email failed: {e}")
        return False


def notify_user(user, event_title: str, notif_type: str, message: str, event_id: str):
    url = f"/events/{event_id}"
    if user.notification_push and user.push_subscription:
        title_map = {
            "cheapest": "Cheapest Ticket Alert",
            "flash_sale": "Flash Sale!",
            "last_minute": "Last Minute Tickets Available",
            "target_price": "Your Price Target Hit",
        }
        send_push(user.push_subscription, title_map.get(notif_type, "TicketMeter Alert"), message, url)
    if user.notification_email:
        send_email(
            user.email,
            f"TicketMeter: {event_title}",
            f"<p>{message}</p><p><a href='https://ticketmeter.app{url}'>View Event</a></p>",
        )

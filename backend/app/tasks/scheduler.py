from apscheduler.schedulers.background import BackgroundScheduler
from app.tasks.price_poller import poll_prices
import logging

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def start_scheduler():
    scheduler.add_job(poll_prices, "interval", minutes=60, id="price_poller", replace_existing=True)
    scheduler.start()
    logger.info("APScheduler started — price polling every 60 minutes")


def stop_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped")

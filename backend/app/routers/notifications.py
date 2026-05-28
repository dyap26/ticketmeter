from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.notification import Notification
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class NotificationOut(BaseModel):
    id: str
    event_id: str
    type: str
    message: str
    sent_at: str
    read_at: Optional[str]

    class Config:
        from_attributes = True


@router.get("/", response_model=List[NotificationOut])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notifs = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.sent_at.desc())
        .limit(50)
        .all()
    )
    return [
        NotificationOut(
            id=n.id,
            event_id=n.event_id,
            type=n.type,
            message=n.message,
            sent_at=n.sent_at.isoformat(),
            read_at=n.read_at.isoformat() if n.read_at else None,
        )
        for n in notifs
    ]


@router.patch("/{notif_id}/read")
def mark_read(notif_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.read_at = datetime.utcnow()
        db.commit()
    return {"message": "Marked read"}

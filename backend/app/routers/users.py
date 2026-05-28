from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.deps import get_current_user
from app.models.user import User
from app.models.tracked_event import TrackedEvent
from app.models.entity import Entity, UserTrackedEntity
from app.models.event import Event
from app.schemas.auth import UserOut
from app.schemas.user import (
    UpdateUserRequest, TrackEventRequest, TrackedEventOut,
    EntityOut, TrackEntityRequest, PushSubscriptionRequest
)
from app.schemas.event import EventSummary
from typing import List

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserOut)
def update_me(body: UpdateUserRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/me/tracked", response_model=List[TrackedEventOut])
def get_tracked_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(TrackedEvent).filter(TrackedEvent.user_id == current_user.id).all()


@router.post("/me/tracked", response_model=TrackedEventOut, status_code=201)
def track_event(body: TrackEventRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    event = db.query(Event).filter(Event.id == body.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    existing = db.query(TrackedEvent).filter(
        TrackedEvent.user_id == current_user.id,
        TrackedEvent.event_id == body.event_id
    ).first()
    if existing:
        return existing
    tracked = TrackedEvent(user_id=current_user.id, **body.model_dump())
    db.add(tracked)
    db.commit()
    db.refresh(tracked)
    return tracked


@router.delete("/me/tracked/{event_id}", status_code=204)
def untrack_event(event_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    tracked = db.query(TrackedEvent).filter(
        TrackedEvent.user_id == current_user.id,
        TrackedEvent.event_id == event_id
    ).first()
    if tracked:
        db.delete(tracked)
        db.commit()


@router.get("/me/entities", response_model=List[EntityOut])
def get_tracked_entities(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    links = db.query(UserTrackedEntity).filter(UserTrackedEntity.user_id == current_user.id).all()
    return [db.query(Entity).get(link.entity_id) for link in links]


@router.post("/me/entities", response_model=EntityOut, status_code=201)
def track_entity(body: TrackEntityRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entity = db.query(Entity).filter(Entity.id == body.entity_id).first()
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")
    existing = db.query(UserTrackedEntity).filter(
        UserTrackedEntity.user_id == current_user.id,
        UserTrackedEntity.entity_id == body.entity_id
    ).first()
    if not existing:
        link = UserTrackedEntity(user_id=current_user.id, entity_id=body.entity_id)
        db.add(link)
        db.commit()
    return entity


@router.delete("/me/entities/{entity_id}", status_code=204)
def untrack_entity(entity_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    link = db.query(UserTrackedEntity).filter(
        UserTrackedEntity.user_id == current_user.id,
        UserTrackedEntity.entity_id == entity_id
    ).first()
    if link:
        db.delete(link)
        db.commit()


@router.post("/me/push-subscription")
def register_push(body: PushSubscriptionRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.push_subscription = body.subscription
    db.commit()
    return {"message": "Push subscription registered"}

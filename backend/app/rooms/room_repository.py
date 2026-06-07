# File path: backend/app/rooms/room_repository.py

"""
Room database operations module.

This module provides database operations for room management.
"""

import uuid

from sqlalchemy.orm import Session

from .room_model import Room, RoomStatusEnum


def create_room(db: Session, room_data: dict):
    """Create new room with unique number validation."""
    new_room = Room(**room_data)

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room


def get_room_by_id(db: Session, room_id: uuid.UUID):
    """Retrieve room by primary key."""
    return (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )


def get_room_by_number(db: Session, room_number: str):
    """Retrieve room by human-readable room number."""
    return (
        db.query(Room)
        .filter(Room.room_number == room_number)
        .first()
    )


def get_all_rooms(db: Session):
    """Return only active rooms for booking availability."""
    return (
        db.query(Room)
        .filter(Room.is_active == True)
        .all()
    )


def update_room_information(db: Session, room: Room, update_data: dict):
    """Update room attributes with partial data."""
    for key, value in update_data.items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)

    return room


def delete_room(db: Session, room: Room):
    """Soft delete room by setting is_active to False."""
    setattr(room, "is_active", False)

    db.commit()
    db.refresh(room)

    return room


def update_room_status(db: Session, room: Room, new_status: RoomStatusEnum):
    """Update operational status for availability tracking."""
    setattr(room, "status", new_status)

    db.commit()
    db.refresh(room)

    return room

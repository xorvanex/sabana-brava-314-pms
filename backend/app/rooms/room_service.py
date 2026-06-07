# File path: backend/app/rooms/room_service.py

"""
Room business logic module.

This module contains validation rules and business operations
related to room management.
"""

import uuid

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from . import room_repository
from .room_scheme import (
    RoomCreate,
    RoomUpdate,
    RoomStatusUpdate
)


def create_room_service(db: Session, room_data: RoomCreate):
    """Create new room with duplicate number validation."""
    existing_room = room_repository.get_room_by_number(
        db,
        room_data.room_number
    )

    if existing_room:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Room number already exists"
        )

    return room_repository.create_room(
        db,
        room_data.model_dump()
    )


def get_all_rooms_service(db: Session):
    """Retrieve all active rooms for booking display."""
    return room_repository.get_all_rooms(db)


def get_room_by_id_service(db: Session, room_id: uuid.UUID):
    """Retrieve room by ID with not found exception."""
    room = room_repository.get_room_by_id(db, room_id)

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    return room


def update_room_service(
    db: Session,
    room_id: uuid.UUID,
    room_data: RoomUpdate
):
    """Update room with conflict detection for duplicate numbers."""
    room = room_repository.get_room_by_id(db, room_id)

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    if room_data.room_number:
        existing_room = room_repository.get_room_by_number(
            db,
            room_data.room_number
        )

        if existing_room is not None and str(existing_room.id) != str(room.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Room number already exists"
            )

    update_data = room_data.model_dump(exclude_unset=True)

    return room_repository.update_room_information(
        db,
        room,
        update_data
    )


def update_room_status_service(
    db: Session,
    room_id: uuid.UUID,
    status_data: RoomStatusUpdate
):
    """Update room operational status for check-in/check-out."""
    room = room_repository.get_room_by_id(db, room_id)

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    return room_repository.update_room_information(
        db,
        room,
        status_data.model_dump()
    )


def delete_room_service(
    db: Session,
    room_id: uuid.UUID
):
    """Soft delete room by deactivating."""
    room = room_repository.get_room_by_id(db, room_id)

    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )

    return room_repository.delete_room(
        db,
        room
    )

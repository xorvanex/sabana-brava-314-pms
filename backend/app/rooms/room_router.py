# File path: backend/app/rooms/room_router.py

# Router Layer:
# - Defines room API endpoints
# - Connects HTTP requests with services
# - Handles dependency injection
# - Organizes room routes

# Start file:

import uuid

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.sessions import get_db

from app.rooms.room_scheme import (
    RoomCreate,
    RoomUpdate,
    RoomStatusUpdate,
    RoomResponse
)

from app.rooms.room_service import (
    create_room_service,
    get_all_rooms_service,
    get_room_by_id_service,
    update_room_service,
    update_room_status_service,
    delete_room_service
)


router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


# Create room endpoint
@router.post(
    "/",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED
)
def create_room(
    room_data: RoomCreate,
    db: Session = Depends(get_db)
):
    return create_room_service(
        db,
        room_data
    )


# Get all rooms endpoint
@router.get(
    "/",
    response_model=list[RoomResponse]
)
def get_all_rooms(
    db: Session = Depends(get_db)
):
    return get_all_rooms_service(db)


# Get room by ID endpoint
@router.get(
    "/{room_id}",
    response_model=RoomResponse
)
def get_room_by_id(
    room_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    return get_room_by_id_service(
        db,
        room_id
    )


# Update room endpoint
@router.put(
    "/{room_id}",
    response_model=RoomResponse
)
def update_room(
    room_id: uuid.UUID,
    room_data: RoomUpdate,
    db: Session = Depends(get_db)
):
    return update_room_service(
        db,
        room_id,
        room_data
    )


# Update room status endpoint
@router.patch(
    "/{room_id}/status",
    response_model=RoomResponse
)
def update_room_status(
    room_id: uuid.UUID,
    status_data: RoomStatusUpdate,
    db: Session = Depends(get_db)
):
    return update_room_status_service(
        db,
        room_id,
        status_data
    )


# Soft delete room endpoint
@router.delete(
    "/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    delete_room_service(
        db,
        room_id
    )
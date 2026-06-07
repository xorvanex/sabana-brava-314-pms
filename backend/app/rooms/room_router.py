# File path: backend/app/rooms/room_router.py

"""
Room API routes module.

This module provides RESTful endpoints for room management.
"""

import uuid

from fastapi import APIRouter, Depends, status, Form
from sqlalchemy.orm import Session

from app.database.sessions import get_db

from app.auth.dependencies import require_admin_owner_or_receptionist
from app.auth.jwt_handler import verify_token

from .room_scheme import (
    RoomCreate,
    RoomUpdate,
    RoomStatusUpdate,
    RoomResponse
)

from .room_model import RoomStatusEnum

from .room_service import (
    create_room_service,
    get_all_rooms_service,
    get_room_by_id_service,
    update_room_service,
    update_room_status_service,
    delete_room_service
)


# Room management endpoints
router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


# Create new room
@router.post(
    "/",
    response_model=RoomResponse,
    status_code=status.HTTP_201_CREATED
)
def create_room(
    room_number: str = Form(...),
    description: str = Form(None),
    room_status: RoomStatusEnum = Form(RoomStatusEnum.AVAILABLE, alias="status"),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):
    room_data = RoomCreate(
        room_number=room_number,
        description=description,
        status=room_status
    )
    return create_room_service(db, room_data)


# Get all rooms
@router.get(
    "/",
    response_model=list[RoomResponse]
)
def get_all_rooms(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(verify_token)
):
    return get_all_rooms_service(db)


# Get room by ID
@router.get(
    "/{room_id}",
    response_model=RoomResponse
)
def get_room_by_id(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(verify_token)
):
    return get_room_by_id_service(
        db,
        room_id
    )


# Update room information
@router.put(
    "/{room_id}",
    response_model=RoomResponse
)
def update_room(
    room_id: uuid.UUID,

    room_number: str = Form(None),
    description: str = Form(None),
    room_status: RoomStatusEnum = Form(None, alias="status"),
    is_active: bool = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):
    room_data = RoomUpdate(
        room_number=room_number,
        description=description,
        status=room_status,
        is_active=is_active
    )
    return update_room_service(db, room_id, room_data)


# Update room status
@router.patch(
    "/{room_id}/status",
    response_model=RoomResponse
)
def update_room_status(
    room_id: uuid.UUID,
    room_status: RoomStatusEnum = Form(..., alias="status"),
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):
    status_data = RoomStatusUpdate(
        status=room_status
    )
    return update_room_status_service(db, room_id, status_data)


# Soft delete room
@router.delete(
    "/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):
    delete_room_service(db, room_id)

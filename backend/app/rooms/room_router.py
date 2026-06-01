# File path: backend/app/rooms/room_router.py

# Start file:

import uuid

from fastapi import APIRouter, Depends, status, Form
from sqlalchemy.orm import Session

from app.database.sessions import get_db

from app.auth.dependencies import require_admin_or_owner
from app.auth.jwt_handler import verify_token

from app.rooms.room_scheme import (
    RoomCreate,
    RoomUpdate,
    RoomStatusUpdate,
    RoomResponse
)

from app.rooms.room_model import RoomStatusEnum

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
    room_number: str = Form(...),
    description: str = Form(None),
    room_status: RoomStatusEnum = Form(RoomStatusEnum.AVAILABLE, alias="status"),
    
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    # Build the Pydantic schema from form data
    room_data = RoomCreate(
        room_number=room_number,
        description=description,
        status=room_status
    )
    return create_room_service(db, room_data)


# Get all rooms endpoint
@router.get(
    "/",
    response_model=list[RoomResponse]
)
def get_all_rooms(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(verify_token)
):
    return get_all_rooms_service(db)


# Get room by ID endpoint
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


# Update room endpoint
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
    token_payload: dict = Depends(require_admin_or_owner)
):
    # Build the update schema with optional values
    room_data = RoomUpdate(
        room_number=room_number,
        description=description,
        status=room_status,
        is_active=is_active
    )
    return update_room_service(db, room_id, room_data)


# Update room status endpoint
@router.patch(
    "/{room_id}/status",
    response_model=RoomResponse
)
def update_room_status(
    room_id: uuid.UUID,
    room_status: RoomStatusEnum = Form(..., alias="status"),
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    status_data = RoomStatusUpdate(
        status=room_status
    )
    return update_room_status_service(db, room_id, status_data)


# Soft delete room endpoint
@router.delete(
    "/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT
)
def delete_room(
    room_id: uuid.UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    delete_room_service(db, room_id)

# End file:

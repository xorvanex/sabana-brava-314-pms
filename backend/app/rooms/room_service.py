# File path: backend/app/rooms/room_service.py

# Start file:

# start file:

import uuid 

from fastapi import HTTPException, status
from sqlalchemy.orm import Session 

from app.rooms import room_repository
from app.rooms.room_scheme import (
    
    RoomCreate,
    RoomUpdate,
    RoomStatusUpdate
)

# Create a new room
def create_room_service(db: Session, room_data: RoomCreate):
    
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

# Get all rooms
def get_all_rooms_service(db: Session):
    return room_repository.get_all_rooms(db)

# Get room by ID
def get_room_by_id_service(db: Session, room_id: uuid.UUID):
    
    room = room_repository.get_room_by_id(db, room_id)
    
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    return room

# Update room information
def update_room_service(
    db: Session, 
    room_id: uuid.UUID,
    room_data: RoomUpdate
):
    
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
        
        if (existing_room is not None and str(existing_room.id) != str(room.id)):
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

# Update room status
def update_room_status_service(
    db: Session,
    room_id: uuid.UUID,
    status_data: RoomStatusUpdate
):
    
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

# Soft delete room
def delete_room_service(
    db: Session,
    room_id: uuid.UUID
):
    
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

# End file:

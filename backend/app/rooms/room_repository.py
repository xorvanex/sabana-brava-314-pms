# File path: bakend/app/rooms/room_repository.py


# Start file:

import uuid

from sqlalchemy.orm import Session

from app.rooms.room_model import Room

# Create a new room
def create_room(db: Session, room_data: dict):
    
    new_room = Room(**room_data)
    
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    
    return new_room

# Get room by ID
def get_room_by_id(db: Session, room_id: uuid.UUID):
    return (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )

# Get room by number 
def get_room_by_number(db: Session, room_number: str):
    return (
        db.query(Room)
        .filter(Room.room_number == room_number)
        .first()
    )

# Get all active rooms
def get_all_rooms(db: Session):
    return (
        db.query(Room)
        .filter(Room.is_active == True)
        .all()
    )

# Update room information
def update_room_information(db: Session, room: Room, update_data: dict):
    for key, value in update_data.items():
        setattr(room, key, value)
    
    db.commit()
    db.refresh(room)
    
    return room

# Soft delete Room
def delete_room(db: Session, room: Room):
    
    setattr(room, "is_active", False)
    
    db.commit()
    db.refresh(room)
    
    return room

# End file:
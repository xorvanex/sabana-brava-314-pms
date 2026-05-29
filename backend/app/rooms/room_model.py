# File path: bakend/app/rooms/room_model.py


# Start file:

import uuid
import enum

from datetime import datetime

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum
from sqlalchemy.types import Uuid 

from app.database.base import Base

# Room state enumeration
class RoomStatusEnum(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    BLOCKED = "BLOCKED"
    MAINTENANCE = "MAINTENANCE"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"

# Rooms ORM model definition
class Room(Base):
    __tablename__ = "rooms"
    
    # Primary key UUID
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Room number identifier
    room_number = Column(String(20), unique=True, nullable=False, index=True)
    
    # Room Description
    description = Column(String(500), nullable=True)
    
    # Room capacity
    capacity = Column(Integer, nullable=False, default=2)
    
    # Current Room state
    status = Column(
        Enum(RoomStatusEnum, name="room_status_enum", create_type=False),
        nullable=False,
        default=RoomStatusEnum.AVAILABLE
    )
    
    # Room Status Flag
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestam fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

# End file:
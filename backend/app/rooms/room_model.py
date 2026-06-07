# File path: backend/app/rooms/room_model.py

"""
Room ORM model module.

This module defines the Room model and status enumeration
for hotel room management.
"""

import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


# Room operational status for availability tracking
class RoomStatusEnum(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    OCCUPIED = "OCCUPIED"
    BLOCKED = "BLOCKED"
    MAINTENANCE = "MAINTENANCE"
    OUT_OF_SERVICE = "OUT_OF_SERVICE"


class Room(Base):
    __tablename__ = "rooms"

    # Primary key with UUID for distributed systems
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # Unique room identifier for booking systems
    room_number = Column(String(20), unique=True, nullable=False, index=True)

    description = Column(String(500), nullable=True)

    # Guest capacity per room
    capacity = Column(Integer, nullable=False, default=2)

    # Availability status for reservation assignment
    status = Column(
        Enum(RoomStatusEnum, name="room_status_enum", create_type=False),
        nullable=False,
        default=RoomStatusEnum.AVAILABLE
    )

    # Soft delete for business continuity
    is_active = Column(Boolean, default=True, nullable=False)

    # Audit timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    contract_rooms = relationship(
        "ContractRoom",
        back_populates="room"
    )

    contracts = relationship(
        "Contract",
        secondary="contract_rooms",
        back_populates="rooms",
        viewonly=True
    )

    reservation_rooms = relationship(
        "ReservationRoom",
        back_populates="room"
    )

    reservations = relationship(
        "Reservation",
        secondary="reservation_rooms",
        back_populates="rooms",
        viewonly=True
    )

    room_assignments = relationship(
        "RoomAssignment",
        back_populates="room",
        cascade="all, delete-orphan"
    )

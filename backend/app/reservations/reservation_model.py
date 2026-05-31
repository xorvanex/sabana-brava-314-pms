# File path: backend/app/reservations/reservation_model.py

# Start file:

import uuid
import enum

from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
    Enum
)

from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


# Reservation status enumeration
class ReservationStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"

BLOCKING_STATUSES = {ReservationStatusEnum.PENDING, ReservationStatusEnum.CONFIRMED}

# Reservation ORM model definition
class Reservation(Base):
    __tablename__ = "reservations"

    # Primary key UUID
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # Foreign key relationship:
    # Every reservation must belong to one company
    company_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("companies.id"),
        nullable=False
    )

    # Foreign key relationship:
    # Every reservation must belong to one contract
    contract_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("contracts.id"),
        nullable=False
    )

    # Reservation dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Number of guests
    guest_count = Column(Integer, nullable=False)

    # Reservation status
    status = Column(
        Enum(
            ReservationStatusEnum,
            name="reservation_status_enum",
            create_type=False
        ),
        nullable=False,
        default=ReservationStatusEnum.PENDING
    )

    # Reservation notes
    notes = Column(Text, nullable=True)

    # User who created the reservation
    created_by = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    # Audit timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=True
    )

    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=True
    )

    # ORM relationship with Company model
    company = relationship(
        "Company",
        back_populates="reservations",
        foreign_keys=[company_id]
    )

    # ORM relationship with Contract model
    contract = relationship(
        "Contract",
        back_populates="reservations",
        foreign_keys=[contract_id]
    )

    # ORM relationship with User model
    user = relationship(
        "User",
        foreign_keys=[created_by]
    )

    # Rooms assigned to this reservation through the association table
    reservation_rooms = relationship(
        "ReservationRoom",
        back_populates="reservation",
        cascade="all, delete-orphan"
    )

    rooms = relationship(
        "Room",
        secondary="reservation_rooms",
        back_populates="reservations",
        viewonly=True
    )

# Reference to the reservation_rooms table that exists in the
# relationship between reservations and rooms
class ReservationRoom(Base):
    __tablename__ = "reservation_rooms"
    __table_args__ = (
        UniqueConstraint("reservation_id", "room_id", name="uq_reservation_room"),
    )

    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    reservation_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("reservations.id"),
        nullable=False
    )

    room_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("rooms.id"),
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=True
    )

    reservation = relationship(
        "Reservation",
        back_populates="reservation_rooms",
        foreign_keys=[reservation_id]
    )

    room = relationship(
        "Room",
        back_populates="reservation_rooms",
        foreign_keys=[room_id]
    )

# End file:

# File path: backend/app/reservations/reservation_model.py

"""
Reservation ORM model module.

This module defines the Reservation model and associated enumerations
for hotel reservation management.
"""

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


# =============================================================================
# Enumerations
# =============================================================================

class ReservationStatusEnum(str, enum.Enum):
    """Reservation lifecycle statuses."""
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    NO_SHOW = "NO_SHOW"


# Statuses that block room availability (consume room inventory)
BLOCKING_STATUSES = {
    ReservationStatusEnum.PENDING,
    ReservationStatusEnum.CONFIRMED
}


# Allowed status transitions for reservation state machine
VALID_TRANSITIONS: dict[ReservationStatusEnum, set[ReservationStatusEnum]] = {
    ReservationStatusEnum.PENDING: {
        ReservationStatusEnum.CONFIRMED,
        ReservationStatusEnum.CANCELLED,
        ReservationStatusEnum.NO_SHOW
    },
    ReservationStatusEnum.CONFIRMED: {
        ReservationStatusEnum.CHECKED_IN,
        ReservationStatusEnum.CANCELLED,
        ReservationStatusEnum.NO_SHOW
    },
    ReservationStatusEnum.CHECKED_IN: {
        ReservationStatusEnum.COMPLETED
    },
    ReservationStatusEnum.COMPLETED: set(),
    ReservationStatusEnum.CANCELLED: set(),
    ReservationStatusEnum.NO_SHOW: set(),
}


# =============================================================================
# ORM Models
# =============================================================================

class Reservation(Base):
    """Reservation entity representing a hotel booking."""
    __tablename__ = "reservations"

    # -------------------------------------------------------------------------
    # Primary Key
    # -------------------------------------------------------------------------
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # -------------------------------------------------------------------------
    # Reservation Information
    # -------------------------------------------------------------------------
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    guest_count = Column(Integer, nullable=False)
    notes = Column(Text, nullable=True)

    # -------------------------------------------------------------------------
    # Guest Information (foreign keys for relationships)
    # -------------------------------------------------------------------------
    # Every reservation must belong to one company
    company_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("companies.id"),
        nullable=False
    )

    # Every reservation must belong to one contract
    contract_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("contracts.id"),
        nullable=False
    )

    # User who created the reservation
    created_by = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )

    # -------------------------------------------------------------------------
    # Room Information (invoice tracking)
    # -------------------------------------------------------------------------
    invoice_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id"),
        nullable=True
    )

    # -------------------------------------------------------------------------
    # Status Fields
    # -------------------------------------------------------------------------
    status = Column(
        Enum(
            ReservationStatusEnum,
            name="reservation_status_enum",
            create_type=False
        ),
        nullable=False,
        default=ReservationStatusEnum.PENDING
    )

    # -------------------------------------------------------------------------
    # Audit Fields
    # -------------------------------------------------------------------------
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

    # -------------------------------------------------------------------------
    # Relationships
    # -------------------------------------------------------------------------
    company = relationship(
        "Company",
        back_populates="reservations",
        foreign_keys=[company_id]
    )

    contract = relationship(
        "Contract",
        back_populates="reservations",
        foreign_keys=[contract_id]
    )

    user = relationship(
        "User",
        foreign_keys=[created_by]
    )

    invoice = relationship(
        "Invoice",
        back_populates="reservations",
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

    reservation_guests = relationship(
        "ReservationGuest",
        back_populates="reservation",
        cascade="all, delete-orphan"
    )

    guests = relationship(
        "Guest",
        secondary="reservation_guests",
        back_populates="reservations",
        viewonly=True
    )

    # Room assignments for guest-room mapping
    room_assignments = relationship(
        "RoomAssignment",
        back_populates="reservation",
        cascade="all, delete-orphan"
    )


class ReservationRoom(Base):
    """Association table for reservation-room many-to-many relationship."""
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


class RoomAssignment(Base):
    """Tracks which guest occupies which room in a reservation."""
    __tablename__ = "room_assignments"

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

    guest_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("guests.id"),
        nullable=False
    )

    assigned_by = Column(
        Uuid(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True
    )

    assignment_date = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=True
    )

    # Relationships
    reservation = relationship(
        "Reservation",
        back_populates="room_assignments",
        foreign_keys=[reservation_id]
    )

    room = relationship(
        "Room",
        back_populates="room_assignments",
        foreign_keys=[room_id]
    )

    guest = relationship(
        "Guest",
        back_populates="room_assignments",
        foreign_keys=[guest_id]
    )

    user = relationship(
        "User",
        foreign_keys=[assigned_by]
    )

# File path: backend/app/guests/guest_model.py

"""
Guest ORM model module.

This module defines the Guest model and related associations
for guest management.
"""

import uuid
import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
    Enum,
    UniqueConstraint
)

from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


class GuestGenderEnum(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"


class DocumentTypeEnum(str, enum.Enum):
    ID_CARD = "ID_CARD"
    FOREIGN_ID = "FOREIGN_ID"
    PASSPORT = "PASSPORT"


class Guest(Base):
    __tablename__ = "guests"

    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    company_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("companies.id"),
        nullable=False
    )

    first_name = Column(
        String(100),
        nullable=False
    )

    last_name = Column(
        String(100),
        nullable=False
    )

    document_type = Column(
        Enum(
            DocumentTypeEnum,
            name="document_type_enum",
            create_type=False
        ),
        nullable=False
    )

    document_number = Column(
        String(50),
        nullable=False,
        unique=True
    )

    gender = Column(
        Enum(
            GuestGenderEnum,
            name="guest_gender_enum",
            create_type=False
        ),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=True
    )

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

    company = relationship(
        "Company",
        back_populates="guests",
        foreign_keys=[company_id]
    )

    reservation_guests = relationship(
        "ReservationGuest",
        back_populates="guest",
        cascade="all, delete-orphan"
    )

    reservations = relationship(
        "Reservation",
        secondary="reservation_guests",
        back_populates="guests",
        viewonly=True
    )

    room_assignments = relationship(
        "RoomAssignment",
        back_populates="guest",
        cascade="all, delete-orphan"
    )


class ReservationGuest(Base):
    __tablename__ = "reservation_guests"

    __table_args__ = (
        UniqueConstraint('reservation_id', 'guest_id', name='uq_reservation_guest'),
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

    guest_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("guests.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        nullable=True
    )

    reservation = relationship(
        "Reservation",
        back_populates="reservation_guests",
        foreign_keys=[reservation_id]
    )

    guest = relationship(
        "Guest",
        back_populates="reservation_guests",
        foreign_keys=[guest_id]
    )

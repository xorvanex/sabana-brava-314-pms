# File path: backend/app/guests/guest_model.py

# Start file:

import uuid 
import enum

from datetime import datetime

from sqlalchemy import(
    
    Column,
    DateTime,
    ForeignKey,
    String,
    Enum
)

from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base

# Guest gender enum
class GuestGenderEnum(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"

#  Document type enum for guest
class DocumentTypeEnum(str, enum.Enum):
    ID_CARD = "ID_CARD"
    FOREIGN_ID = "FOREIGN_ID"
    PASSPORT = "PASSPORT"

# Guests ORM model definition
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
# ---- 


# End file:
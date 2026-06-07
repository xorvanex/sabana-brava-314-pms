"""
Contract ORM model module.

This module defines the Contract and ContractRoom models for corporate
hotel agreement management.
"""

# File path: backend/app/contracts/contract_model.py

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, Date, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


class Contract(Base):
    __tablename__ = "contracts"

    # Primary Key
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # Company Information
    company_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("companies.id"),
        nullable=False
    )

    # Contract Information
    contract_number = Column(String(50), unique=True, nullable=False)
    base_rate = Column(Numeric(12, 2), nullable=False)
    description = Column(Text, nullable=True)
    terms = Column(Text, nullable=False)

    # Date Information
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Status Fields
    is_active = Column(Boolean, default=True)

    # Audit Fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=True
    )

    # Relationships
    company = relationship(
        "Company",
        back_populates="contracts",
        foreign_keys=[company_id]
    )

    contract_rooms = relationship(
        "ContractRoom",
        back_populates="contract",
        cascade="all, delete-orphan"
    )

    rooms = relationship(
        "Room",
        secondary="contract_rooms",
        back_populates="contracts",
        viewonly=True
    )

    reservations = relationship(
        "Reservation",
        back_populates="contract"
    )

    invoices = relationship(
        "Invoice",
        back_populates="contract",
    )


class ContractRoom(Base):
    __tablename__ = "contract_rooms"

    contract_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("contracts.id"),
        primary_key=True
    )

    room_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("rooms.id"),
        primary_key=True
    )

    contract = relationship(
        "Contract",
        back_populates="contract_rooms",
        foreign_keys=[contract_id]
    )

    room = relationship(
        "Room",
        back_populates="contract_rooms",
        foreign_keys=[room_id]
    )

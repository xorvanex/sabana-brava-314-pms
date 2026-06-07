# File path: backend/app/companies/company_model.py

"""
Company ORM model module.

This module defines the Company model for corporate client management.
"""

import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


class Company(Base):
    __tablename__ = "companies"

    # Primary key: UUID for distributed system compatibility
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # Business fields
    name = Column(String(150), nullable=False)

    # Unique tax identifier for duplicate prevention
    nit = Column(String(30), unique=True, nullable=False, index=True)

    company_representative = Column(String(150), nullable=False)

    # Contact information
    address = Column(String(250), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)

    # Status field for soft delete
    is_active = Column(Boolean, default=True)

    # Audit timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=True)

    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=True
    )

    # Relationships
    contracts = relationship(
        "Contract",
        back_populates="company",
    )

    reservations = relationship(
        "Reservation",
        back_populates="company",
    )

    # Cascade delete when company is removed
    guests = relationship(
        "Guest",
        back_populates="company",
        cascade="all, delete-orphan"
    )

    invoices = relationship(
        "Invoice",
        back_populates="company",
    )

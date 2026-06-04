# File path: backend/app/companies/company_model.py

# Start file:

import uuid

from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


# Company ORM model definition
class Company(Base):
    __tablename__ = "companies"

    # Primary key UUID
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # Company legal name
    name = Column(String(150), nullable=False)

    # Unique company tax identifier
    nit = Column(String(30), unique=True, nullable=False, index=True)

    # Name of company representative
    company_representative = Column(String(150), nullable=False)
    
    # Company contact information
    address = Column(String(250), nullable=True)
    phone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)

    # Company active/inactive status
    is_active = Column(Boolean, default=True)

    # Audit timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=True)

    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=True
    )

    # One-to-many relationship:
    # A company can have multiple contracts associated
    contracts = relationship(
        "Contract",
        back_populates="company",
    )

    # One-to-many relationship:
    # A company can have multiple reservations associated
    reservations = relationship(
        "Reservation",
        back_populates="company",
    )
    
# A company can have multiple employeds(GUESTS) associate
    guests = relationship(
        "Guest",
        back_populates="company",
        cascade="all, delete-orphan"
    )

    # One-to-many relationship:
    # A company can have multiple invoices associated
    invoices = relationship(
        "Invoice",
        back_populates="company",
    )

# End file:

# File path: backend/app/contracts/contract_model.py


# Start file:

import uuid

from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    Text
)

from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


# Contract ORM model definition
class Contract(Base):
    __tablename__ = "contracts"

    # Primary key UUID
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # Foreign key relationship:
    # Every contract must belong to one company
    company_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("companies.id"),
        nullable=False
    )

    # Contract Number
    contract_number = Column(String(50), unique=True, nullable=False)
    
    # Contract validity dates
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    # Base accommodation tariff
    base_rate = Column(
        Numeric(12, 2),
        nullable=False
    )

    # General contract description
    description = Column(Text, nullable=True)

    # Contract negotiated terms:
    # Stores business agreements between hotel and company
    terms = Column(Text, nullable=False)

    # Contract active/inactive status
    is_active = Column(Boolean, default=True)

    # Audit timestamps
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=True
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=True
    )

    # ORM relationship with Company model
    # Enables contract.company access
    company = relationship(
        "Company",
        back_populates="contracts",
        foreign_keys=[company_id]
    )


# End file:
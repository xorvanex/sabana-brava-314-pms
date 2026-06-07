# File path: backend/app/invoices/invoice_model.py

# Start File: 

from sqlalchemy import (
    Column,
    String,
    Text,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    Integer,
    Enum,
    UniqueConstraint
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

import uuid, enum

from app.database.base import Base


class InvoiceStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    ISSUED = "ISSUED"
    CANCELLED = "CANCELLED"


class DianStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    ERROR = "ERROR"


class Invoice(Base):
    """
    Stores invoice information generated for a company
    during a specific billing period.
    """

    __tablename__ = "invoices"

    __table_args__ = (
        UniqueConstraint(
            "company_id",
            "period_start",
            "period_end",
            name="uq_invoice_company_period"
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    company_id = Column(
        UUID(as_uuid=True),
        ForeignKey("companies.id"),
        nullable=False,
    )

    contract_id = Column(
        UUID(as_uuid=True),
        ForeignKey("contracts.id"),
        nullable=False,
    )

    invoice_number = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    period_start = Column(
        Date,
        nullable=False,
    )

    period_end = Column(
        Date,
        nullable=False,
    )

    subtotal = Column(
        Numeric(12, 2),
        nullable=False,
    )

    taxes = Column(
        Numeric(12, 2),
        nullable=False,
        default=0,
    )

    total = Column(
        Numeric(12, 2),
        nullable=False,
    )

    invoice_status = Column(
        Enum(
            "PENDING",
            "ISSUED",
            "CANCELLED",
            name="invoice_status_enum",
        ),
        nullable=False,
        default="PENDING",
    )

    dian_status = Column(
        Enum(
            "PENDING",
            "SENT",
            "ACCEPTED",
            "REJECTED",
            "ERROR",
            name="dian_status_enum",
        ),
        nullable=False,
        default="PENDING",
    )

    cufe = Column(
        String(255),
        nullable=True,
    )

    tracking_id = Column(
        String(255),
        nullable=True,
    )

    xml_content = Column(
        Text,
        nullable=True,
    )

    dian_response_message = Column(
        Text,
        nullable=True,
    )

    issued_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    validated_at = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships

    company = relationship(
        "Company",
        back_populates="invoices",
    )

    contract = relationship(
        "Contract",
        back_populates="invoices",
    )

    details = relationship(
        "InvoiceDetail",
        back_populates="invoice",
        cascade="all, delete-orphan",
    )

    reservations = relationship(
        "Reservation",
        back_populates="invoice",
    )


class InvoiceDetail(Base):
    """
    Stores individual invoice line items.
    """

    __tablename__ = "invoice_details"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    invoice_id = Column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
    )

    description = Column(
        Text,
        nullable=False,
    )

    quantity = Column(
        Integer,
        nullable=False,
        default=1,
    )

    unit_price = Column(
        Numeric(12, 2),
        nullable=False,
    )

    subtotal = Column(
        Numeric(12, 2),
        nullable=False,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Relationships

    invoice = relationship(
        "Invoice",
        back_populates="details",
    )


# End File:

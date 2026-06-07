"""
Invoice ORM model module.

This module defines the Invoice and InvoiceDetail models for corporate
hotel billing management. It handles invoice lifecycle tracking, DIAN
e-invoicing compliance, and invoice line item storage.

Models:
    - Invoice: Main invoice entity with billing and DIAN status
    - InvoiceDetail: Individual line items for invoice charges
"""

# =============================================================================
# Standard Library Imports
# =============================================================================
import uuid
import enum
from datetime import datetime

# =============================================================================
# Third-Party Imports
# =============================================================================
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
    UniqueConstraint,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

# =============================================================================
# Local Application Imports
# =============================================================================
from app.database.base import Base


# =============================================================================
# Enumerations
# =============================================================================

class InvoiceStatusEnum(str, enum.Enum):
    """
    Invoice lifecycle statuses.
    
    Tracks the state of an invoice throughout its lifecycle from creation
    through payment or cancellation.
    """
    PENDING = "PENDING"
    ISSUED = "ISSUED"
    CANCELLED = "CANCELLED"


class DianStatusEnum(str, enum.Enum):
    """
    DIAN e-invoicing status.
    
    Tracks the status of invoice submission to Colombia's tax authority (DIAN).
    Independent of invoice_status to handle cases where invoice is issued but
    DIAN submission fails or is rejected.
    """
    PENDING = "PENDING"
    SENT = "SENT"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    ERROR = "ERROR"


# =============================================================================
# ORM Models
# =============================================================================

class Invoice(Base):
    """
    Stores invoice information generated for a company during a specific billing period.
    
    Each invoice is uniquely identified by invoice_number and represents charges
    for a specific time period (period_start to period_end) for a corporate client.
    """
    
    __tablename__ = "invoices"

    __table_args__ = (
        # Prevent duplicate invoices for the same company and billing period
        UniqueConstraint(
            "company_id",
            "period_start",
            "period_end",
            name="uq_invoice_company_period"
        ),
    )

    # -------------------------------------------------------------------------
    # Identity Fields
    # -------------------------------------------------------------------------
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # -------------------------------------------------------------------------
    # Company Reference
    # -------------------------------------------------------------------------
    company_id = Column(
        UUID(as_uuid=True),
        ForeignKey("companies.id"),
        nullable=False,
    )

    # -------------------------------------------------------------------------
    # Contract Reference
    # -------------------------------------------------------------------------
    contract_id = Column(
        UUID(as_uuid=True),
        ForeignKey("contracts.id"),
        nullable=False,
    )

    # -------------------------------------------------------------------------
    # Invoice Identification
    # -------------------------------------------------------------------------
    invoice_number = Column(
        String(50),
        unique=True,
        nullable=False,
    )

    # -------------------------------------------------------------------------
    # Billing Period
    # -------------------------------------------------------------------------
    # Track the billing period covered by the invoice
    period_start = Column(
        Date,
        nullable=False,
    )

    period_end = Column(
        Date,
        nullable=False,
    )

    # -------------------------------------------------------------------------
    # Financial Fields
    # -------------------------------------------------------------------------
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

    # -------------------------------------------------------------------------
    # Invoice Status
    # -------------------------------------------------------------------------
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

    # -------------------------------------------------------------------------
    # DIAN Compliance
    # -------------------------------------------------------------------------
    # Store DIAN processing status independently from invoice status
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
        default="PENDING"
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

    # -------------------------------------------------------------------------
    # Timestamps
    # -------------------------------------------------------------------------
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

    # -------------------------------------------------------------------------
    # Relationships
    # -------------------------------------------------------------------------
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
    
    Each detail represents a single charge or service included in the parent
    invoice, with quantity and unit pricing for transparency.
    """
    
    __tablename__ = "invoice_details"

    # -------------------------------------------------------------------------
    # Identity Fields
    # -------------------------------------------------------------------------
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    # -------------------------------------------------------------------------
    # Invoice Reference
    # -------------------------------------------------------------------------
    invoice_id = Column(
        UUID(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
    )

    # -------------------------------------------------------------------------
    # Line Item Details
    # -------------------------------------------------------------------------
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

    # -------------------------------------------------------------------------
    # Timestamps
    # -------------------------------------------------------------------------
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # -------------------------------------------------------------------------
    # Relationships
    # -------------------------------------------------------------------------
    invoice = relationship(
        "Invoice",
        back_populates="details",
    )

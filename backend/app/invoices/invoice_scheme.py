"""
Invoice Pydantic schemas module.

This module defines all request and response schemas for the invoices API.
It handles invoice generation requests, invoice responses with nested details,
and DIAN simulation responses.

Schemas:
    - GenerateInvoiceRequest: Input for creating new invoices
    - InvoiceDetailResponse: Line item data in responses
    - InvoiceBasicResponse: Summary invoice data
    - InvoiceResponse: Full invoice with all details
    - DianSimulationResponse: DIAN processing results
"""

# =============================================================================
# Standard Library Imports
# =============================================================================
from uuid import UUID
from decimal import Decimal
from datetime import date, datetime
from typing import Optional, List

# =============================================================================
# Third-Party Imports
# =============================================================================
from pydantic import BaseModel, Field


# =============================================================================
# Request Schemas
# =============================================================================

class GenerateInvoiceRequest(BaseModel):
    """
    Request schema for invoice generation.
    
    Used to initiate invoice creation for a specific company and billing period.
    """
    
    # -------------------------------------------------------------------------
    # Company Information
    # -------------------------------------------------------------------------
    company_id: UUID

    # -------------------------------------------------------------------------
    # Billing Period
    # -------------------------------------------------------------------------
    # Track the billing period covered by the invoice
    period_start: date
    period_end: date


# =============================================================================
# Response Schemas
# =============================================================================

class InvoiceDetailResponse(BaseModel):
    """
    Response schema for invoice line items.
    
    Contains individual charge details for each line item in an invoice.
    """
    
    # -------------------------------------------------------------------------
    # Identity
    # -------------------------------------------------------------------------
    id: UUID

    # -------------------------------------------------------------------------
    # Line Item Details
    # -------------------------------------------------------------------------
    description: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


class InvoiceBasicResponse(BaseModel):
    """
    Response schema for basic invoice summary.
    
    Used for invoice listing endpoints where full details are not needed.
    """
    
    # -------------------------------------------------------------------------
    # Identity
    # -------------------------------------------------------------------------
    id: UUID

    # -------------------------------------------------------------------------
    # Invoice Identification
    # -------------------------------------------------------------------------
    invoice_number: str

    # -------------------------------------------------------------------------
    # Status Fields
    # -------------------------------------------------------------------------
    invoice_status: str
    dian_status: str

    # -------------------------------------------------------------------------
    # Financial Summary
    # -------------------------------------------------------------------------
    total: Decimal

    # -------------------------------------------------------------------------
    # Timestamps
    # -------------------------------------------------------------------------
    issued_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    """
    Response schema for full invoice data.
    
    Contains complete invoice information including nested line items.
    """
    
    # -------------------------------------------------------------------------
    # Identity
    # -------------------------------------------------------------------------
    id: UUID

    # -------------------------------------------------------------------------
    # Company Reference
    # -------------------------------------------------------------------------
    company_id: UUID

    # -------------------------------------------------------------------------
    # Contract Reference
    # -------------------------------------------------------------------------
    contract_id: UUID

    # -------------------------------------------------------------------------
    # Invoice Identification
    # -------------------------------------------------------------------------
    invoice_number: str

    # -------------------------------------------------------------------------
    # Billing Period
    # -------------------------------------------------------------------------
    period_start: date
    period_end: date

    # -------------------------------------------------------------------------
    # Financial Fields
    # -------------------------------------------------------------------------
    subtotal: Decimal
    taxes: Decimal
    total: Decimal

    # -------------------------------------------------------------------------
    # Invoice Status
    # -------------------------------------------------------------------------
    invoice_status: str
    dian_status: str

    # -------------------------------------------------------------------------
    # DIAN Compliance
    # -------------------------------------------------------------------------
    # Store DIAN processing status independently from invoice status
    cufe: Optional[str] = None
    tracking_id: Optional[str] = None
    dian_response_message: Optional[str] = None

    # -------------------------------------------------------------------------
    # Timestamps
    # -------------------------------------------------------------------------
    issued_at: Optional[datetime] = None
    validated_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    # -------------------------------------------------------------------------
    # Nested Responses
    # -------------------------------------------------------------------------
    # Invoice line items composed in response
    details: List[InvoiceDetailResponse] = []

    class Config:
        from_attributes = True


class DianSimulationResponse(BaseModel):
    """
    Response schema for DIAN simulation results.
    
    Contains DIAN processing status and any related tracking information
    from the e-invoicing integration.
    """
    
    # -------------------------------------------------------------------------
    # DIAN Status
    # -------------------------------------------------------------------------
    dian_status: str

    # -------------------------------------------------------------------------
    # DIAN Tracking
    # -------------------------------------------------------------------------
    tracking_id: Optional[str] = None
    cufe: Optional[str] = None

    # -------------------------------------------------------------------------
    # DIAN Message
    # -------------------------------------------------------------------------
    message: Optional[str] = None

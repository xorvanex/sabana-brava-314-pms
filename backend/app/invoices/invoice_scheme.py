# File path: backend/app/invoices/invoice_scheme.py

# Start file:

from uuid import UUID
from decimal import Decimal
from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field


# Schema used to generate a new invoice
class GenerateInvoiceRequest(BaseModel):
    company_id: UUID

    period_start: date
    period_end: date


# Basic invoice detail response
class InvoiceDetailResponse(BaseModel):
    id: UUID

    description: str

    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True


# Basic invoice response
class InvoiceBasicResponse(BaseModel):
    id: UUID

    invoice_number: str

    invoice_status: str
    dian_status: str

    total: Decimal

    issued_at: Optional[datetime]

    class Config:
        from_attributes = True


# Full invoice response
class InvoiceResponse(BaseModel):
    id: UUID

    company_id: UUID
    contract_id: UUID

    invoice_number: str

    period_start: date
    period_end: date

    subtotal: Decimal
    taxes: Decimal
    total: Decimal

    invoice_status: str
    dian_status: str

    cufe: Optional[str]
    tracking_id: Optional[str]

    dian_response_message: Optional[str]

    issued_at: Optional[datetime]
    validated_at: Optional[datetime]

    created_at: datetime
    updated_at: datetime

    details: List[InvoiceDetailResponse] = []

    class Config:
        from_attributes = True


# Response used for DIAN simulation results
class DianSimulationResponse(BaseModel):
    dian_status: str

    tracking_id: Optional[str]
    cufe: Optional[str]

    message: Optional[str]


# End file:
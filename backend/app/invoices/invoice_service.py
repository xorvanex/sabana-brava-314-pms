"""
Invoice service module.

This module defines business logic functions for invoice operations.
It handles invoice generation, retrieval, cancellation, and PDF generation.
Coordinates with company, contract, and reservation repositories.

Main Functions:
    - generate_invoice: Core invoice generation workflow
    - get_invoice_by_id: Retrieve invoice by ID
    - get_all_invoices: Retrieve all invoices
    - get_company_invoices: Retrieve invoices by company
    - cancel_invoice: Cancel pending invoice
    - generate_invoice_pdf: Generate PDF
    - preview_invoice_pdf: Preview PDF
"""

# =============================================================================
# Standard Library Imports
# =============================================================================
import hashlib
import re
from decimal import Decimal
from datetime import datetime, timezone
from uuid import UUID

# =============================================================================
# Third-Party Imports
# =============================================================================
from fastapi import HTTPException
from sqlalchemy.orm import Session

# =============================================================================
# Local Application Imports
# =============================================================================
from app.companies import company_repository
from app.contracts import contract_repository
from app.reservations import reservation_repository

from . import invoice_repository, invoice_scheme
from .invoice_model import (
    InvoiceStatusEnum,
    DianStatusEnum
)
from .invoice_pdf_generator import (
    generate_invoice_pdf as create_invoice_pdf,
    generate_invoice_preview_pdf as create_invoice_preview_pdf
)


# =============================================================================
# Constants
# =============================================================================

# VAT rate for Colombian invoicing (19%)
VAT_RATE = Decimal("0.19")

# Days in a month for daily rate calculation
DAYS_PER_MONTH = Decimal("30")


# =============================================================================
# Main Business Functions
# =============================================================================

def generate_invoice(
    db: Session,
    invoice_request: invoice_scheme.GenerateInvoiceRequest
):
    """
    Generate invoice for a company and billing period.
    
    This is the core invoice generation workflow:
    1. Validate company exists
    2. Validate active contract exists
    3. Check for existing invoice (prevent duplicates)
    4. Retrieve uninvoiced reservations for period
    5. Calculate costs and generate details
    6. Create invoice with details
    7. Simulate DIAN validation
    8. Link reservations to invoice
    
    Args:
        db: Database session
        invoice_request: Invoice generation request with company and period
        
    Returns:
        Created Invoice object
        
    Raises:
        HTTPException: If company not found, no contract, duplicate, or no reservations
    """
    
    # Validate company exists
    company = company_repository.get_company_by_id(
        db,
        invoice_request.company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    # Validate active contract exists for company
    contract = contract_repository.get_latest_active_contract_by_company(
        db,
        invoice_request.company_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="No active contract found for company"
        )

    # Prevent duplicate invoices for the same billing period
    existing_invoice = invoice_repository.get_invoice_by_company_and_period(
        db,
        invoice_request.company_id,
        invoice_request.period_start,
        invoice_request.period_end
    )

    if existing_invoice:
        raise HTTPException(
            status_code=409,
            detail=f"Invoice already exists for company in period {invoice_request.period_start} to {invoice_request.period_end}"
        )

    # Retrieve reservations that can be billed for this period
    reservations = (
        reservation_repository.get_uninvoiced_reservations_by_period(
            db,
            invoice_request.company_id,
            invoice_request.period_start,
            invoice_request.period_end
        )
    )

    if not reservations:
        raise HTTPException(
            status_code=400,
            detail="No billable reservations found for selected period"
        )

    try:
        # Extract values from ORM objects to satisfy type checkers
        company_name: str = str(company.name)  # type: ignore
        company_id: UUID = company.id  # type: ignore
        contract_base_rate: Decimal = Decimal(str(contract.base_rate))  # type: ignore

        # Generate unique invoice number
        invoice_number = _generate_invoice_number(company_name)

        # Build invoice line items from reservations
        invoice_lines = []
        subtotal = Decimal("0")

        for reservation in reservations:

            # Calculate cost based on monthly rate and days occupied
            reservation_cost = _calculate_reservation_cost(
                reservation,
                contract_base_rate
            )

            subtotal += reservation_cost

            invoice_lines.append(
                {
                    "reservation_id": reservation.id,
                    "description": (
                        f"Reservation "
                        f"{reservation.start_date} "
                        f"to "
                        f"{reservation.end_date}"
                    ),
                    "quantity": 1,
                    "unit_price": reservation_cost,
                    "subtotal": reservation_cost
                }
            )

        # Calculate VAT on subtotal
        taxes = _calculate_vat(subtotal)

        # Total includes subtotal plus taxes
        total = subtotal + taxes

        # Create invoice in database (transactional)
        invoice = (
            invoice_repository.create_invoice_without_commit(
                db,
                {
                    "company_id": company_id,
                    "contract_id": contract.id,
                    "invoice_number": invoice_number,
                    "period_start": invoice_request.period_start,
                    "period_end": invoice_request.period_end,
                    "subtotal": subtotal,
                    "taxes": taxes,
                    "total": total,
                    "invoice_status": InvoiceStatusEnum.ISSUED.value,
                    "dian_status": DianStatusEnum.PENDING.value
                }
            )
        )

        # Create invoice detail line items (transactional)
        for line in invoice_lines:

            invoice_repository.create_invoice_detail_without_commit(
                db,
                {
                    "invoice_id": invoice.id,
                    "description": line["description"],
                    "quantity": line["quantity"],
                    "unit_price": line["unit_price"],
                    "subtotal": line["subtotal"]
                }
            )

        # Generate DIAN simulation data
        xml_content = _generate_xml_content(
            invoice_number,
            company_name,
            total
        )

        # Generate CUFE for DIAN compliance
        cufe = _generate_cufe(
            invoice_number,
            company_id,
            total
        )

        # Simulate DIAN validation response
        dian_response = _simulate_dian_validation()

        # Use setattr to satisfy type checker for SQLAlchemy columns
        setattr(invoice, "xml_content", xml_content)
        setattr(invoice, "cufe", cufe)
        setattr(invoice, "tracking_id", dian_response["tracking_id"])
        setattr(invoice, "dian_response_message", dian_response["message"])
        setattr(invoice, "dian_status", dian_response["dian_status"])
        setattr(invoice, "issued_at", datetime.now(timezone.utc))
        setattr(invoice, "validated_at", datetime.now(timezone.utc))

        # Link invoiced reservations after successful invoice creation
        # Extract IDs for type safety
        invoice_uuid: UUID = invoice.id  # type: ignore
        reservation_ids: list[UUID] = [
            reservation.id  # type: ignore
            for reservation in reservations
        ]

        # Note: parameters are (reservation_ids, invoice_id) in repository
        reservation_repository.assign_invoice_to_reservations(
            db,
            reservation_ids,
            invoice_uuid
        )

        # Commit the transaction
        db.commit()
        db.refresh(invoice)

        return invoice

    except Exception:

        # Rollback on any error during invoice generation
        db.rollback()

        raise


def get_invoice_by_id(
    db: Session,
    invoice_id: UUID
):
    """
    Retrieve invoice by unique identifier.
    
    Args:
        db: Database session
        invoice_id: UUID of the invoice to retrieve
        
    Returns:
        Invoice object if found
        
    Raises:
        HTTPException: If invoice not found
    """
    
    invoice = invoice_repository.get_invoice_by_id(
        db,
        invoice_id
    )

    if invoice is None:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    return invoice


def get_all_invoices(
    db: Session
):
    """
    Retrieve all invoices from the database.
    
    Args:
        db: Database session
        
    Returns:
        List of all Invoice objects
    """
    
    return invoice_repository.get_all_invoices(
        db
    )


def get_company_invoices(
    db: Session,
    company_id: UUID
):
    """
    Retrieve all invoices for a specific company.
    
    Args:
        db: Database session
        company_id: UUID of the company
        
    Returns:
        List of Invoice objects for the company
        
    Raises:
        HTTPException: If company not found
    """
    
    company = company_repository.get_company_by_id(
        db,
        company_id
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    return invoice_repository.get_invoices_by_company(
        db,
        company_id
    )


def cancel_invoice(
    db: Session,
    invoice_id: UUID
):
    """
    Cancel a pending invoice.
    
    Only pending invoices can be cancelled. Returns the invoice
    unchanged if already cancelled (idempotent operation).
    
    Args:
        db: Database session
        invoice_id: UUID of the invoice to cancel
        
    Returns:
        Cancelled Invoice object
        
    Raises:
        HTTPException: If invoice not found or not cancellable
    """
    
    invoice = invoice_repository.get_invoice_by_id(
        db,
        invoice_id
    )

    if invoice is None:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    # Extract the value to satisfy the type checker
    current_status: str = str(invoice.invoice_status)  # type: ignore

    # Idempotency: if already cancelled, return invoice directly
    if current_status == InvoiceStatusEnum.CANCELLED.value:
        return invoice

    # Only pending invoices can be cancelled
    if current_status != InvoiceStatusEnum.PENDING.value:
        raise HTTPException(
            status_code=400,
            detail="Only pending invoices can be cancelled"
        )

    return invoice_repository.cancel_invoice(
        db,
        invoice_id
    )


def preview_invoice_pdf(
    db: Session,
    invoice_id: UUID
):
    """
    Generate a preview PDF for an existing invoice.
    
    Args:
        db: Database session
        invoice_id: ID of the invoice to preview
        
    Returns:
        StreamingResponse: PDF preview ready for display
        
    Raises:
        HTTPException: If the invoice does not exist
    """
    # Validate invoice existence
    invoice = invoice_repository.get_invoice_by_id(
        db,
        invoice_id
    )

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    # Get company associated
    company = invoice.company

    # Generate preview PDF
    return create_invoice_preview_pdf(
        invoice,
        company
    )


def generate_invoice_pdf(
    db: Session,
    invoice_id: UUID
):
    """
    Generate a PDF for an existing invoice.
    
    Args:
        db: Database session
        invoice_id: ID of the invoice to generate PDF for
        
    Returns:
        StreamingResponse: PDF ready for download
        
    Raises:
        HTTPException: If the invoice does not exist
    """
    # Delegate to the PDF generator module
    return create_invoice_pdf(
        db,
        invoice_id,
        invoice_repository
    )


# =============================================================================
# Helper Functions
# =============================================================================

def _generate_invoice_number(
    company_name: str
) -> str:
    """
    Generate unique invoice number from company name and timestamp.
    
    Format: INV-{SANITIZED_NAME}-{TIMESTAMP}
    
    Args:
        company_name: Name of the company for sanitization
        
    Returns:
        Generated invoice number string
    """
    # Sanitize company name:
    # - remove spaces
    # - remove special characters (keep letters only)
    # - uppercase result
    # - truncate to 4 characters
    sanitized = re.sub(r'[^A-Za-z]', '', company_name)
    sanitized = sanitized.upper()[:4]

    # If no letters remain, use default
    if not sanitized:
        sanitized = "COMP"

    timestamp = datetime.now(timezone.utc).strftime(
        "%Y%m%d%H%M%S"
    )

    return (
        f"INV-{sanitized}-{timestamp}"
    )


def _calculate_reservation_cost(
    reservation,
    monthly_rate: Decimal
) -> Decimal:
    """
    Calculate cost for a reservation based on monthly rate.
    
    Formula: (monthly_rate / 30) * occupied_days * room_count
    
    Args:
        reservation: Reservation ORM object
        monthly_rate: Contract monthly room rate
        
    Returns:
        Calculated cost as Decimal
    """
    
    occupied_days = (
        reservation.end_date -
        reservation.start_date
    ).days

    room_count = max(
        len(reservation.rooms),
        1
    )

    daily_rate = (
        Decimal(monthly_rate)
        / DAYS_PER_MONTH
    )

    return (
        daily_rate
        * Decimal(occupied_days)
        * Decimal(room_count)
    )


def _calculate_vat(
    subtotal: Decimal
) -> Decimal:
    """
    Calculate VAT (IVA) on subtotal.
    
    Applies 19% VAT rate with 2 decimal precision.
    
    Args:
        subtotal: Subtotal amount before VAT
        
    Returns:
        VAT amount as Decimal
    """
    
    return (
        subtotal * VAT_RATE
    ).quantize(
        Decimal("0.01")
    )


def _generate_xml_content(
    invoice_number: str,
    company_name: str,
    total: Decimal
) -> str:
    """
    Generate XML simulation content for invoice.
    
    Args:
        invoice_number: Unique invoice number
        company_name: Company name
        total: Invoice total amount
        
    Returns:
        XML content string
    """
    
    return f"""
<Invoice>
    <InvoiceNumber>{invoice_number}</InvoiceNumber>
    <Company>{company_name}</Company>
    <Total>{total}</Total>
</Invoice>
""".strip()


def _generate_cufe(
    invoice_number: str,
    company_id: UUID,
    total: Decimal
) -> str:
    """
    Generate CUFE (Codigo Unico de Facturacion Electronica) for DIAN.
    
    Creates SHA256 hash combining invoice data for DIAN compliance.
    
    Args:
        invoice_number: Unique invoice number
        company_id: Company UUID
        total: Invoice total
        
    Returns:
        CUFE hash string
    """
    
    source = (
        f"{invoice_number}"
        f"{company_id}"
        f"{total}"
        f"{datetime.now(timezone.utc).isoformat()}"
    )

    return hashlib.sha256(
        source.encode()
    ).hexdigest()


def _simulate_dian_validation():
    """
    Simulate DIAN e-invoicing validation.
    
    Returns simulated DIAN validation response for testing.
    Generate DIAN tracking metadata for the simulated validation flow.
    
    Returns:
        Dictionary with dian_status, tracking_id, and message
    """
    
    return {
        "dian_status": DianStatusEnum.ACCEPTED.value,
        "tracking_id": (
            f"TRACK-"
            f"{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
        ),
        "message": (
            "Invoice accepted by DIAN simulator"
        )
    }

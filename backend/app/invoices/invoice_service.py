# File path: backend/app/invoices/invoice_service.py

# Start file:

import hashlib
import re
from decimal import Decimal
from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.companies import company_repository
from app.contracts import contract_repository
from app.reservations import reservation_repository

from . import invoice_repository, invoice_scheme
from .invoice_model import (
    InvoiceStatusEnum,
    DianStatusEnum
)


VAT_RATE = Decimal("0.19")
DAYS_PER_MONTH = Decimal("30")


# Generate invoice for a company and billing period
def generate_invoice(
    db: Session,
    invoice_request: invoice_scheme.GenerateInvoiceRequest
):

    company = company_repository.get_company_by_id(
        db,
        invoice_request.company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    contract = contract_repository.get_latest_active_contract_by_company(
        db,
        invoice_request.company_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="No active contract found for company"
        )

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

        invoice_number = _generate_invoice_number(company_name)

        invoice_lines = []
        subtotal = Decimal("0")

        for reservation in reservations:

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

        taxes = _calculate_vat(subtotal)

        total = subtotal + taxes

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

        xml_content = _generate_xml_content(
            invoice_number,
            company_name,
            total
        )

        cufe = _generate_cufe(
            invoice_number,
            company_id,
            total
        )

        dian_response = _simulate_dian_validation()

        # Use setattr to satisfy type checker for SQLAlchemy columns
        setattr(invoice, "xml_content", xml_content)
        setattr(invoice, "cufe", cufe)
        setattr(invoice, "tracking_id", dian_response["tracking_id"])
        setattr(invoice, "dian_response_message", dian_response["message"])
        setattr(invoice, "dian_status", dian_response["dian_status"])
        setattr(invoice, "issued_at", datetime.now(timezone.utc))
        setattr(invoice, "validated_at", datetime.now(timezone.utc))

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

        db.commit()
        db.refresh(invoice)

        return invoice

    except Exception:

        db.rollback()

        raise


# Retrieve invoice by ID
def get_invoice_by_id(
    db: Session,
    invoice_id: UUID
):

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


# Retrieve all invoices
def get_all_invoices(
    db: Session
):

    return invoice_repository.get_all_invoices(
        db
    )


# Retrieve company invoices
def get_company_invoices(
    db: Session,
    company_id: UUID
):

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


# Cancel invoice
def cancel_invoice(
    db: Session,
    invoice_id: UUID
):

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

    if current_status != InvoiceStatusEnum.PENDING.value:
        raise HTTPException(
            status_code=400,
            detail="Only pending invoices can be cancelled"
        )

    return invoice_repository.cancel_invoice(
        db,
        invoice_id
    )


# Generate invoice number
def _generate_invoice_number(
    company_name: str
) -> str:
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


# Calculate reservation cost
def _calculate_reservation_cost(
    reservation,
    monthly_rate: Decimal
) -> Decimal:

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


# Calculate VAT
def _calculate_vat(
    subtotal: Decimal
) -> Decimal:

    return (
        subtotal * VAT_RATE
    ).quantize(
        Decimal("0.01")
    )


# Generate XML simulation
def _generate_xml_content(
    invoice_number: str,
    company_name: str,
    total: Decimal
) -> str:

    return f"""
<Invoice>
    <InvoiceNumber>{invoice_number}</InvoiceNumber>
    <Company>{company_name}</Company>
    <Total>{total}</Total>
</Invoice>
""".strip()


# Generate simulated CUFE
def _generate_cufe(
    invoice_number: str,
    company_id: UUID,
    total: Decimal
) -> str:

    source = (
        f"{invoice_number}"
        f"{company_id}"
        f"{total}"
        f"{datetime.now(timezone.utc).isoformat()}"
    )

    return hashlib.sha256(
        source.encode()
    ).hexdigest()


# Simulate DIAN validation
def _simulate_dian_validation():

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

# End file:

# File path: backend/app/invoices/invoice_router.py

# Start file:

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Form, status
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from app.database.sessions import get_db
from app.auth.dependencies import require_admin_or_owner

from . import invoice_service, invoice_scheme


router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


# Generate a new invoice for a company and billing period
@router.post(
    "/generate",
    response_model=invoice_scheme.InvoiceResponse
)
def generate_invoice(
    company_id: UUID = Form(...),
    period_start: date = Form(...),
    period_end: date = Form(...),
    db: Session = Depends(get_db)
):

    invoice_request = invoice_scheme.GenerateInvoiceRequest(
        company_id=company_id,
        period_start=period_start,
        period_end=period_end
    )

    return invoice_service.generate_invoice(
        db,
        invoice_request
    )


# Retrieve invoice by ID
@router.get(
    "/{invoice_id}",
    response_model=invoice_scheme.InvoiceResponse
)
def get_invoice_by_id(
    invoice_id: UUID,
    db: Session = Depends(get_db)
):

    return invoice_service.get_invoice_by_id(
        db,
        invoice_id
    )


# Retrieve all invoices
@router.get(
    "",
    response_model=list[invoice_scheme.InvoiceResponse]
)
def get_all_invoices(
    db: Session = Depends(get_db)
):

    return invoice_service.get_all_invoices(
        db
    )


# Retrieve invoices by company
@router.get(
    "/company/{company_id}",
    response_model=list[invoice_scheme.InvoiceResponse]
)
def get_company_invoices(
    company_id: UUID,
    db: Session = Depends(get_db)
):

    return invoice_service.get_company_invoices(
        db,
        company_id
    )


# Cancel an existing invoice
@router.patch(
    "/{invoice_id}/cancel",
    response_model=invoice_scheme.InvoiceResponse
)
def cancel_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db)
):

    return invoice_service.cancel_invoice(
        db,
        invoice_id
    )


# Preview invoice PDF
@router.post(
    "/preview/pdf",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "Invoice preview PDF",
            "content": {
                "application/pdf": {
                    "schema": {
                        "type": "string",
                        "format": "binary"
                    }
                }
            }
        }
    }
)
def preview_invoice_pdf(
    invoice_id: UUID = Form(...),
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    return invoice_service.preview_invoice_pdf(
        db,
        invoice_id
    )


# Generate invoice PDF
@router.get(
    "/{invoice_id}/pdf"
)
def generate_invoice_pdf(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    return invoice_service.generate_invoice_pdf(
        db,
        invoice_id
    )

# End file:

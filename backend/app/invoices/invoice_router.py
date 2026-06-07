"""
Invoice API router module.

This module defines the FastAPI routes for invoice operations.
It provides endpoints for invoice generation, retrieval, cancellation,
and PDF generation.

Endpoints:
    - POST /invoices/generate: Generate invoice for company
    - GET /invoices/{invoice_id}: Get invoice by ID
    - GET /invoices: Get all invoices
    - GET /invoices/company/{company_id}: Get company invoices
    - PATCH /invoices/{invoice_id}/cancel: Cancel invoice
    - POST /invoices/preview/pdf: Preview invoice PDF
    - GET /invoices/{invoice_id}/pdf: Generate invoice PDF
"""

# =============================================================================
# Standard Library Imports
# =============================================================================
from datetime import date
from uuid import UUID

# =============================================================================
# Third-Party Imports
# =============================================================================
from fastapi import APIRouter, Depends, Form, status
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

# =============================================================================
# Local Application Imports
# =============================================================================
from app.database.sessions import get_db
from app.auth.dependencies import require_admin_or_owner

from . import invoice_service, invoice_scheme


# =============================================================================
# Router Configuration
# =============================================================================

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)


# =============================================================================
# Invoice Generation Endpoints
# =============================================================================

@router.post(
    "/generate",
    response_model=invoice_scheme.InvoiceResponse,
    status_code=status.HTTP_201_CREATED
)
def generate_invoice(
    company_id: UUID = Form(...),
    period_start: date = Form(...),
    period_end: date = Form(...),
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    """
    Generate a billing document for a company and period.
    
    Creates a new invoice for the specified company covering the
    billing period from period_start to period_end.
    
    Requires admin or owner authentication.
    """
    
    invoice_request = invoice_scheme.GenerateInvoiceRequest(
        company_id=company_id,
        period_start=period_start,
        period_end=period_end
    )

    return invoice_service.generate_invoice(
        db,
        invoice_request
    )


# =============================================================================
# Invoice Retrieval Endpoints
# =============================================================================

@router.get(
    "/{invoice_id}",
    response_model=invoice_scheme.InvoiceResponse
)
def get_invoice_by_id(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    """
    Retrieve invoice by unique identifier.
    
    Requires admin or owner authentication.
    """
    
    return invoice_service.get_invoice_by_id(
        db,
        invoice_id
    )


@router.get(
    "",
    response_model=list[invoice_scheme.InvoiceResponse]
)
def get_all_invoices(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    """
    Retrieve all invoices.
    
    Requires admin or owner authentication.
    """
    
    return invoice_service.get_all_invoices(
        db
    )


@router.get(
    "/company/{company_id}",
    response_model=list[invoice_scheme.InvoiceResponse]
)
def get_company_invoices(
    company_id: UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    """
    Retrieve all invoices associated with a company.
    
    Requires admin or owner authentication.
    """
    
    return invoice_service.get_company_invoices(
        db,
        company_id
    )


# =============================================================================
# Invoice Cancellation Endpoints
# =============================================================================

@router.patch(
    "/{invoice_id}/cancel",
    response_model=invoice_scheme.InvoiceResponse
)
def cancel_invoice(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    """
    Cancel a pending invoice.
    
    Only pending invoices can be cancelled.
    Requires admin or owner authentication.
    """
    
    return invoice_service.cancel_invoice(
        db,
        invoice_id
    )


# =============================================================================
# PDF Generation Endpoints
# =============================================================================

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
    """
    Generate a preview PDF for display in browser.
    
    Requires admin or owner authentication.
    """
    
    return invoice_service.preview_invoice_pdf(
        db,
        invoice_id
    )


@router.get(
    "/{invoice_id}/pdf"
)
def generate_invoice_pdf(
    invoice_id: UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    """
    Generate a downloadable PDF representation of the invoice.
    
    Requires admin or owner authentication.
    """
    
    return invoice_service.generate_invoice_pdf(
        db,
        invoice_id
    )

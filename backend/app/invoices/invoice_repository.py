"""
Invoice repository module.

This module defines database access functions for Invoice and InvoiceDetail
models. It provides CRUD operations and uniqueness validation for the
invoices API.

Functions:
    - Invoice retrieval by ID, number, company, contract
    - Invoice creation with and without commit
    - Invoice update and cancellation
    - Invoice detail CRUD operations
    - Uniqueness validation for company-period combinations
"""

# =============================================================================
# Standard Library Imports
# =============================================================================
from datetime import date
from uuid import UUID

# =============================================================================
# Third-Party Imports
# =============================================================================
from sqlalchemy.orm import Session

# =============================================================================
# Local Application Imports
# =============================================================================
from .invoice_model import Invoice, InvoiceDetail


# =============================================================================
# Invoice Retrieval Operations
# =============================================================================

def get_invoice_by_id(
    db: Session,
    invoice_id: UUID
) -> Invoice | None:
    """
    Retrieve invoice by unique identifier.
    
    Args:
        db: Database session
        invoice_id: UUID of the invoice to retrieve
        
    Returns:
        Invoice object if found, None otherwise
    """
    
    return (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id)
        .first()
    )


def get_invoice_by_number(
    db: Session,
    invoice_number: str
) -> Invoice | None:
    """
    Retrieve invoice by unique invoice number.
    
    Args:
        db: Database session
        invoice_number: Unique invoice number string
        
    Returns:
        Invoice object if found, None otherwise
    """
    
    return (
        db.query(Invoice)
        .filter(Invoice.invoice_number == invoice_number)
        .first()
    )


def get_all_invoices(db: Session):
    """
    Retrieve all invoices from the database.
    
    Args:
        db: Database session
        
    Returns:
        List of all Invoice objects
    """
    
    return db.query(Invoice).all()


def get_invoices_by_company(
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
    """
    
    return (
        db.query(Invoice)
        .filter(Invoice.company_id == company_id)
        .all()
    )


def get_invoices_by_contract(
    db: Session,
    contract_id: UUID
):
    """
    Retrieve all invoices for a specific contract.
    
    Args:
        db: Database session
        contract_id: UUID of the contract
        
    Returns:
        List of Invoice objects for the contract
    """
    
    return (
        db.query(Invoice)
        .filter(Invoice.contract_id == contract_id)
        .all()
    )


# =============================================================================
# Invoice Creation Operations
# =============================================================================

def create_invoice(
    db: Session,
    invoice_data: dict
) -> Invoice:
    """
    Create a new invoice with commit.
    
    Args:
        db: Database session
        invoice_data: Dictionary of invoice field values
        
    Returns:
        Newly created Invoice object
    """
    
    new_invoice = Invoice(**invoice_data)

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    return new_invoice


def create_invoice_without_commit(
    db: Session,
    invoice_data: dict
) -> Invoice:
    """
    Create invoice without commit.
    Used for transactional invoice generation.
    
    Args:
        db: Database session
        invoice_data: Dictionary of invoice field values
        
    Returns:
        Newly created Invoice object (not committed)
    """
    
    invoice = Invoice(**invoice_data)

    db.add(invoice)
    db.flush()

    return invoice


# =============================================================================
# Invoice Update Operations
# =============================================================================

def update_invoice(
    db: Session,
    invoice_id: UUID,
    invoice_data: dict
) -> Invoice | None:
    """
    Update invoice fields.
    
    Args:
        db: Database session
        invoice_id: UUID of invoice to update
        invoice_data: Dictionary of fields to update
        
    Returns:
        Updated Invoice object if found, None otherwise
    """
    
    invoice = get_invoice_by_id(db, invoice_id)

    if invoice:
        for key, value in invoice_data.items():
            setattr(invoice, key, value)

        db.commit()
        db.refresh(invoice)

    return invoice


def cancel_invoice(
    db: Session,
    invoice_id: UUID
) -> Invoice | None:
    """
    Cancel an invoice by setting status to CANCELLED.
    
    Args:
        db: Database session
        invoice_id: UUID of invoice to cancel
        
    Returns:
        Cancelled Invoice object if found, None otherwise
    """
    
    return update_invoice(
        db,
        invoice_id,
        {
            "invoice_status": "CANCELLED"
        }
    )


# =============================================================================
# Invoice Detail Operations
# =============================================================================

def create_invoice_detail(
    db: Session,
    detail_data: dict
) -> InvoiceDetail:
    """
    Create a new invoice detail with commit.
    
    Args:
        db: Database session
        detail_data: Dictionary of detail field values
        
    Returns:
        Newly created InvoiceDetail object
    """
    
    new_detail = InvoiceDetail(**detail_data)

    db.add(new_detail)
    db.commit()
    db.refresh(new_detail)

    return new_detail


def create_invoice_detail_without_commit(
    db: Session,
    detail_data: dict
) -> InvoiceDetail:
    """
    Create invoice detail without commit.
    Used for transactional invoice generation.
    
    Args:
        db: Database session
        detail_data: Dictionary of detail field values
        
    Returns:
        Newly created InvoiceDetail object (not committed)
    """
    
    detail = InvoiceDetail(**detail_data)

    db.add(detail)
    db.flush()

    return detail


def get_invoice_details(
    db: Session,
    invoice_id: UUID
):
    """
    Retrieve all details for a specific invoice.
    
    Args:
        db: Database session
        invoice_id: UUID of the parent invoice
        
    Returns:
        List of InvoiceDetail objects for the invoice
    """
    
    return (
        db.query(InvoiceDetail)
        .filter(InvoiceDetail.invoice_id == invoice_id)
        .all()
    )


# =============================================================================
# Uniqueness Validation Operations
# =============================================================================

def get_invoice_by_company_and_period(
    db: Session,
    company_id: UUID,
    period_start: date,
    period_end: date
) -> Invoice | None:
    """
    Check if an invoice already exists for the company and billing period.
    Prevent duplicate invoices for the same company and billing period.
    
    Args:
        db: Database session
        company_id: UUID of the company
        period_start: Start date of the billing period
        period_end: End date of the billing period
        
    Returns:
        Existing Invoice object if found, None otherwise
    """
    
    return (
        db.query(Invoice)
        .filter(
            Invoice.company_id == company_id,
            Invoice.period_start == period_start,
            Invoice.period_end == period_end
        )
        .first()
    )

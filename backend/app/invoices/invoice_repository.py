# File path: backend/app/invoices/invoice_repository.py

# Start file:

from uuid import UUID

from sqlalchemy.orm import Session

from .invoice_model import Invoice, InvoiceDetail


# Retrieve invoice by ID
def get_invoice_by_id(
    db: Session,
    invoice_id: UUID
) -> Invoice | None:

    return (
        db.query(Invoice)
        .filter(Invoice.id == invoice_id)
        .first()
    )


# Retrieve invoice by invoice number
def get_invoice_by_number(
    db: Session,
    invoice_number: str
) -> Invoice | None:

    return (
        db.query(Invoice)
        .filter(Invoice.invoice_number == invoice_number)
        .first()
    )


# Retrieve all invoices
def get_all_invoices(db: Session):

    return db.query(Invoice).all()


# Retrieve invoices by company
def get_invoices_by_company(
    db: Session,
    company_id: UUID
):

    return (
        db.query(Invoice)
        .filter(Invoice.company_id == company_id)
        .all()
    )


# Retrieve invoices by contract
def get_invoices_by_contract(
    db: Session,
    contract_id: UUID
):

    return (
        db.query(Invoice)
        .filter(Invoice.contract_id == contract_id)
        .all()
    )


# Create invoice
def create_invoice(
    db: Session,
    invoice_data: dict
) -> Invoice:

    new_invoice = Invoice(**invoice_data)

    db.add(new_invoice)
    db.commit()
    db.refresh(new_invoice)

    return new_invoice


# Update invoice
def update_invoice(
    db: Session,
    invoice_id: UUID,
    invoice_data: dict
) -> Invoice | None:

    invoice = get_invoice_by_id(db, invoice_id)

    if invoice:
        for key, value in invoice_data.items():
            setattr(invoice, key, value)

        db.commit()
        db.refresh(invoice)

    return invoice


# Create invoice detail
def create_invoice_detail(
    db: Session,
    detail_data: dict
) -> InvoiceDetail:

    new_detail = InvoiceDetail(**detail_data)

    db.add(new_detail)
    db.commit()
    db.refresh(new_detail)

    return new_detail


# Retrieve invoice details
def get_invoice_details(
    db: Session,
    invoice_id: UUID
):

    return (
        db.query(InvoiceDetail)
        .filter(InvoiceDetail.invoice_id == invoice_id)
        .all()
    )


# Cancel invoice
def cancel_invoice(
    db: Session,
    invoice_id: UUID
) -> Invoice | None:

    return update_invoice(
        db,
        invoice_id,
        {
            "invoice_status": "CANCELLED"
        }
    )



# End file:
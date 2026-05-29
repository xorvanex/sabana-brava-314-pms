# File path: backend/app/contracts/contract_service.py


# Start file:
from datetime import date, datetime
from typing import cast

from uuid import UUID
from io import BytesIO

from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer
)

from reportlab.lib.styles import getSampleStyleSheet

from . import (
    contract_repository,
    contract_scheme
)

from app.companies import company_repository

def generate_contract_number(db: Session) -> str:
    current_year = datetime.now().year
    
    total_contracts = len(contract_repository.get_all_contracts(db)) + 1
    
    return f"CTR-{current_year}-{total_contracts:05d}"

# Create new contract
def create_contract(
    db: Session,
    contract_in: contract_scheme.ContractCreate
):
    # Validate company existence
    company = company_repository.get_company_by_id(
        db,
        contract_in.company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )
    
    # Prevent contracts for inactive companies
    if not bool(company.is_active):
        raise HTTPException(
            status_code=400,
            detail="Company is inactive"
        )
    
    # Validate contract dates
    if contract_in.end_date <= contract_in.start_date:
        raise HTTPException(
            status_code=400,
            detail="Contract end date must be greater than start date"
        )

    # Prevent overlapping of periods
    if contract_repository.check_overlapping_contracts(
        db,
        contract_in.company_id,
        contract_in.start_date,
        contract_in.end_date
    ):
        raise HTTPException(
            status_code=400,
            detail="Company already has an active contract with overlapping dates"
        )

    contract_number = generate_contract_number(db)
    
    contract_data = contract_in.model_dump()
    
    contract_data["contract_number"] = contract_number
    
    return contract_repository.create_contract(
        db,
        contract_data
    )


# Retrieve contract by ID
def get_contract_by_id(
    db: Session,
    contract_id: UUID
):

    contract = contract_repository.get_contract_by_id(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract


# Retrieve all contracts
def get_all_contracts(db: Session):
    return contract_repository.get_all_contracts(db)


# Update contract information
def update_contract(
    db: Session,
    contract_id: UUID,
    contract_in: contract_scheme.ContractUpdate
):

    contract = contract_repository.get_contract_by_id(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    # Resolve final contract dates
    new_start_date = cast(
        date,
        contract_in.start_date or contract.start_date
    )

    new_end_date = cast(
        date,
        contract_in.end_date or contract.end_date
    )

    # Validate final contract date range
    if new_end_date <= new_start_date:
        raise HTTPException(
            status_code=400,
            detail="Invalid contract date range"
        )
    
    # Validate overlap excluding the current contract
    if contract_repository.check_overlapping_contracts(
        db,
        cast(UUID, contract.company_id),
        new_start_date,
        new_end_date,
        exclude_contract_id=contract_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Updated contract dates overlap with existing contract"
        )
    
    update_data = contract_in.model_dump(exclude_unset=True)

    return contract_repository.update_contract(
        db,
        contract_id,
        update_data
    )


# Toggle contract active status
def toggle_contract_status(
    db: Session,
    contract_id: UUID
):

    contract = contract_repository.get_contract_by_id(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    new_status = not bool(contract.is_active)

    return contract_repository.update_contract(
        db,
        contract_id,
        {"is_active": new_status}
    )


def get_company_contracts(db: Session, company_id: UUID):
    return contract_repository.get_company_contracts(db, company_id)


# Retrieve active contracts
def get_active_contracts(db: Session):
    return contract_repository.get_active_contracts(db)


# Generate contract PDF dynamically in memory
def generate_contract_pdf(
    db: Session,
    contract_id: UUID
):

    contract = contract_repository.get_contract_by_id(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    company = contract.company

    # Dynamic legal/business contract content
    # Generated from persisted relational data
    contract_text = f"""
    HOTEL SABANA BRAVA 314

    COMPANY INFORMATION

    Company Name: {company.name}
    NIT: {company.nit}
    Address: {company.address}
    Email: {company.email}
    Phone: {company.phone}

    CONTRACT INFORMATION

    Contract Number: {contract.contract_number}
    Start Date: {contract.start_date}
    End Date: {contract.end_date}
    Base Tariff: ${contract.base_rate}

    CONTRACT TERMS

    {contract.terms}

    ADDITIONAL DESCRIPTION

    {contract.description or "No additional description provided."}
    
    COMPANY SIGNATURE: _______________________
    .
    .
    .
    .
    OWNER SIGNATURE: ___________________________
    """

    # In-memory binary buffer
    # Prevents physical file persistence on server
    pdf_buffer = BytesIO()

    # PDF document initialization
    pdf = SimpleDocTemplate(pdf_buffer)

    styles = getSampleStyleSheet()

    content = []

    content.append(
        Paragraph(contract_text, styles["BodyText"])
    )

    content.append(
        Spacer(1, 12)
    )

    # Build PDF document entirely in memory
    pdf.build(content)

    pdf_buffer.seek(0)

    # Streaming response:
    # Returns generated PDF directly to frontend
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition":
            f"attachment; filename=contract_{contract.id}.pdf"
        }
    )


# End file:
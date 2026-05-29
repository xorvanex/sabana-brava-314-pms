# File path: backend/app/companies/company_service.py


# Start file:

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import company_repository, company_scheme


# Create a new company with unique NIT validation
def create_company(
    db: Session,
    company_in: company_scheme.CompanyCreate
):

    # Validate unique company NIT
    existing_company = company_repository.get_company_by_nit(
        db,
        company_in.nit
    )

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Company NIT already registered"
        )

    company_data = company_in.model_dump()

    return company_repository.create_company(
        db,
        company_data
    )


# Retrieve company by ID
def get_company_by_id(
    db: Session,
    company_id: UUID
):

    company = company_repository.get_company_by_id(
        db,
        company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    return company

# Retrieve company by NIT
def get_company_by_nit(db: Session, nit: str):
    company = company_repository.get_company_by_nit(db, nit)
    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )
    return company

# Retrieve all companies
def get_all_companies(db: Session):
    return company_repository.get_all_companies(db)

# Retrieve active companies
def get_active_companies(db: Session):
    return company_repository.get_active_companies(db)

# Update company information
def update_company(
    db: Session,
    company_id: UUID,
    company_in: company_scheme.CompanyUpdate
):

    company = company_repository.get_company_by_id(
        db,
        company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    # Prevent duplicated NIT between companies
    if company_in.nit and company_in.nit != company.nit:

        existing_company = company_repository.get_company_by_nit(
            db,
            company_in.nit
        )

        if existing_company:
            raise HTTPException(
                status_code=400,
                detail="Company NIT already registered"
            )

    # Remove unset values to avoid overwriting existing data
    update_data = company_in.model_dump(exclude_unset=True)

    return company_repository.update_company(
        db,
        company_id,
        update_data
    )


# Toggle company active status
def toggle_company_status(
    db: Session,
    company_id: UUID
):

    company = company_repository.get_company_by_id(
        db,
        company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    # Business rule:
    # Toggle company availability for future operations
    new_status = not bool(company.activo)

    return company_repository.update_company(
        db,
        company_id,
        {"activo": new_status}
    )


# End file:
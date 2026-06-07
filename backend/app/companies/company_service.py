# File path: backend/app/companies/company_service.py

"""
Company business logic module.

This module contains validation rules and business operations
related to company management.
"""

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import company_repository, company_scheme


def create_company(
    db: Session,
    company_in: company_scheme.CompanyCreate
):
    """Create new company with duplicate NIT validation."""
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


def get_company_by_id(
    db: Session,
    company_id: UUID
):
    """Retrieve company by identifier with not found handling."""
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


def get_company_by_nit(db: Session, nit: str):
    """Retrieve company by tax identifier for duplicate checks."""
    company = company_repository.get_company_by_nit(db, nit)
    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )
    return company


def get_all_companies(db: Session):
    """Retrieve all companies for administrative listing."""
    return company_repository.get_all_companies(db)


def get_active_companies(db: Session):
    """Retrieve only active companies for business operations."""
    return company_repository.get_active_companies(db)


def update_company(
    db: Session,
    company_id: UUID,
    company_in: company_scheme.CompanyUpdate
):
    """Update company with partial update support."""
    company = company_repository.get_company_by_id(
        db,
        company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    update_data = company_in.model_dump(exclude_unset=True)

    return company_repository.update_company(
        db,
        company_id,
        update_data
    )


def toggle_company_status(
    db: Session,
    company_id: UUID
):
    """Soft toggle company active/inactive status."""
    company = company_repository.get_company_by_id(
        db,
        company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    new_status = not bool(company.is_active)

    return company_repository.update_company(
        db,
        company_id,
        {"is_active": new_status}
    )

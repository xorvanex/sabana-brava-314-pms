# File path: backend/app/companies/company_repository.py

"""
Company database operations module.

This module provides database operations for company management.
"""

from uuid import UUID

from sqlalchemy.orm import Session

from .company_model import Company


# Retrieve by primary key
def get_company_by_id(db: Session, company_id: UUID) -> Company | None:
    return db.query(Company).filter(Company.id == company_id).first()


# Prevent duplicate registration using unique tax identifier
def get_company_by_nit(db: Session, nit: str) -> Company | None:
    return db.query(Company).filter(Company.nit == nit).first()


# Retrieve all companies regardless of status
def get_all_companies(db: Session):
    return db.query(Company).all()


# Return only active companies for reservation assignment
def get_active_companies(db: Session):
    return db.query(Company).filter(Company.is_active == True).all()


# Create new company record
def create_company(db: Session, company_data: dict) -> Company:
    new_company = Company(**company_data)

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


def update_company(
    db: Session,
    company_id: UUID,
    company_data: dict
) -> Company | None:

    company = get_company_by_id(db, company_id)

    if company:
        for key, value in company_data.items():
            setattr(company, key, value)

        db.commit()
        db.refresh(company)

    return company

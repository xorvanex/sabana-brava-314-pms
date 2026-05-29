# File path: backend/app/company/company_repository.py

# Repository Layer:
# - Handles database operations
# - Executes ORM queries
# - Manages entity persistence
# - Contains no business logic

# Start file:

from uuid import UUID

from sqlalchemy.orm import Session

from .company_model import Company


# Retrieve company by ID
def get_company_by_id(db: Session, company_id: UUID) -> Company | None:
    return db.query(Company).filter(Company.id == company_id).first()


# Retrieve company by NIT
def get_company_by_nit(db: Session, nit: str) -> Company | None:
    return db.query(Company).filter(Company.nit == nit).first()


# Retrieve all companies
def get_all_companies(db: Session):
    return db.query(Company).all()


# Create a new company record
def create_company(db: Session, company_data: dict) -> Company:
    new_company = Company(**company_data)

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


# Update existing company
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


# End file:
# File path: backend/app/companies/company_router.py


# Start file:

from uuid import UUID
from typing import List

from fastapi import (
    APIRouter,
    Depends,
    status,
    Form
)

from sqlalchemy.orm import Session
from app.database.sessions import get_db
from app.auth.dependencies import require_admin_or_owner
from . import company_scheme, company_service


# Router definition for company-related endpoints
router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)


# Create a new company
@router.post(
    "/",
    response_model=company_scheme.CompanyResponse,
    status_code=status.HTTP_201_CREATED
)
def create_company(
    name: str = Form(...),
    nit: str = Form(...),
    company_representative: str = Form(...),
    address: str = Form(None),
    phone: str = Form(None),
    email: str = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    # Build validated Pydantic schema from form data
    company_in = company_scheme.CompanyCreate(
        name=name,
        nit=nit,
        company_representative=company_representative,
        address=address,
        phone=phone,
        email=email
    )

    return company_service.create_company(
        db,
        company_in
    )


# Retrieve all companies
@router.get(
    "/",
    response_model=List[company_scheme.CompanyResponse]
)
def get_all_companies(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    return company_service.get_all_companies(db)


# Retrieve active companies
@router.get(
    "/active",
    response_model=List[company_scheme.CompanyResponse]
)
def get_active_companies(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    return company_service.get_active_companies(db)


# Retrieve company by ID
@router.get(
    "/{company_id}",
    response_model=company_scheme.CompanyResponse
)
def get_company_by_id(
    company_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    return company_service.get_company_by_id(
        db,
        company_id
    )

# Retrieve company by NIT
@router.get(
    "/search/nit/{nit}",
    response_model=company_scheme.CompanyResponse
)
def get_company_by_nit(
    nit: str,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    company = company_service.get_company_by_nit(db, nit)
    return company

# Update company information
@router.put(
    "/{company_id}",
    response_model=company_scheme.CompanyResponse
)
def update_company(
    company_id: UUID,

    name: str = Form(None),
    nit: str = Form(None),
    company_representative: str = Form(None),
    address: str = Form(None),
    phone: str = Form(None),
    email: str = Form(None),
    is_active: bool = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    # Build validated update schema from form data
    company_in = company_scheme.CompanyUpdate(
        name=name,
        nit=nit,
        company_representative=company_representative,
        addres=address,
        phone=phone,
        email=email,
        is_active=is_active
    )

    return company_service.update_company(
        db,
        company_id,
        company_in
    )


# Toggle company active/inactive status
@router.patch(
    "/{company_id}/status",
    response_model=company_scheme.CompanyResponse
)
def toggle_company_status(
    company_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    return company_service.toggle_company_status(
        db,
        company_id
    )


# End file:
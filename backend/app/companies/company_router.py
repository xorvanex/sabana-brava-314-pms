# File path: backend/app/companies/company_router.py

"""
Company API routes module.

This module provides RESTful endpoints for company management.
"""

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
from app.auth.dependencies import require_admin_or_owner, require_admin_owner_or_receptionist

from . import company_scheme, company_service

# Company management endpoints
router = APIRouter(
    prefix="/companies",
    tags=["Companies"]
)


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


@router.get(
    "/",
    response_model=List[company_scheme.CompanyResponse]
)
def get_all_companies(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return company_service.get_all_companies(db)


@router.get(
    "/active",
    response_model=List[company_scheme.CompanyResponse]
)
def get_active_companies(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):
    return company_service.get_active_companies(db)


@router.get(
    "/{company_id}",
    response_model=company_scheme.CompanyResponse
)
def get_company_by_id(
    company_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return company_service.get_company_by_id(
        db,
        company_id
    )


@router.get(
    "/search/nit/{nit}",
    response_model=company_scheme.CompanyResponse
)
def get_company_by_nit(
    nit: str,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):
    company = company_service.get_company_by_nit(db, nit)
    return company


@router.put(
    "/{company_id}",
    response_model=company_scheme.CompanyResponse
)
def update_company(
    company_id: UUID,
    company_representative: str = Form(None),
    address: str = Form(None),
    phone: str = Form(None),
    email: str = Form(None),
    is_active: bool = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    company_in = company_scheme.CompanyUpdate(
        company_representative=company_representative,
        address=address,
        phone=phone,
        email=email,
        is_active=is_active
    )

    return company_service.update_company(
        db,
        company_id,
        company_in
    )


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

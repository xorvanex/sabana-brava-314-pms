# API Layer:
# - Handles HTTP requests
# - Defines API endpoints
# - Validates request input
# - Delegates logic to services

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
from app.auth.dependencies import require_admin_or_duena
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
    nombre: str = Form(...),
    nit: str = Form(...),
    direccion: str = Form(None),
    telefono: str = Form(None),
    correo: str = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    # Build validated Pydantic schema from form data
    company_in = company_scheme.CompanyCreate(
        nombre=nombre,
        nit=nit,
        direccion=direccion,
        telefono=telefono,
        correo=correo
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
    token_payload: dict = Depends(require_admin_or_duena)
):

    return company_service.get_all_companies(db)


# Retrieve company by ID
@router.get(
    "/{company_id}",
    response_model=company_scheme.CompanyResponse
)
def get_company_by_id(
    company_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    return company_service.get_company_by_id(
        db,
        company_id
    )


# Update company information
@router.put(
    "/{company_id}",
    response_model=company_scheme.CompanyResponse
)
def update_company(
    company_id: UUID,

    nombre: str = Form(None),
    nit: str = Form(None),
    direccion: str = Form(None),
    telefono: str = Form(None),
    correo: str = Form(None),
    activo: bool = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    # Build validated update schema from form data
    company_in = company_scheme.CompanyUpdate(
        nombre=nombre,
        nit=nit,
        direccion=direccion,
        telefono=telefono,
        correo=correo,
        activo=activo
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
    token_payload: dict = Depends(require_admin_or_duena)
):

    return company_service.toggle_company_status(
        db,
        company_id
    )


# End file:
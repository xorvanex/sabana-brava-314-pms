# API Layer:
# - Handles HTTP requests
# - Defines API endpoints
# - Validates request input
# - Delegates logic to services

# Start file:

from uuid import UUID
from decimal import Decimal
from datetime import date
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

from . import contract_scheme, contract_service


# Router definition for contract-related endpoints
router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)


# Create a new contract
@router.post(
    "/",
    response_model=contract_scheme.ContractResponse,
    status_code=status.HTTP_201_CREATED
)
def create_contract(
    empresa_id: UUID = Form(...),

    fecha_inicio: date = Form(...),
    fecha_fin: date = Form(...),

    tarifa_base: Decimal = Form(...),

    descripcion: str = Form(None),

    # Contract negotiated agreements
    terminos: str = Form(...),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    # Build validated Pydantic schema from form data
    contract_in = contract_scheme.ContractCreate(
        empresa_id=empresa_id,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        tarifa_base=tarifa_base,
        descripcion=descripcion,
        terminos=terminos
    )

    return contract_service.create_contract(
        db,
        contract_in
    )


# Retrieve all contracts
@router.get(
    "/",
    response_model=List[contract_scheme.ContractResponse]
)
def get_all_contracts(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    return contract_service.get_all_contracts(db)


# Retrieve contract by ID
@router.get(
    "/{contract_id}",
    response_model=contract_scheme.ContractResponse
)
def get_contract_by_id(
    contract_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    return contract_service.get_contract_by_id(
        db,
        contract_id
    )


# Update contract information
@router.put(
    "/{contract_id}",
    response_model=contract_scheme.ContractResponse
)
def update_contract(
    contract_id: UUID,

    fecha_inicio: date = Form(None),
    fecha_fin: date = Form(None),

    tarifa_base: Decimal = Form(None),

    descripcion: str = Form(None),
    terminos: str = Form(None),

    activo: bool = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    # Build validated update schema from form data
    contract_in = contract_scheme.ContractUpdate(
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        tarifa_base=tarifa_base,
        descripcion=descripcion,
        terminos=terminos,
        activo=activo
    )

    return contract_service.update_contract(
        db,
        contract_id,
        contract_in
    )


# Toggle contract active/inactive status
@router.patch(
    "/{contract_id}/status",
    response_model=contract_scheme.ContractResponse
)
def toggle_contract_status(
    contract_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    return contract_service.toggle_contract_status(
        db,
        contract_id
    )


# Generate contract PDF dynamically
@router.get(
    "/{contract_id}/pdf"
)
def generate_contract_pdf(
    contract_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_duena)
):

    return contract_service.generate_contract_pdf(
        db,
        contract_id
    )


# End file:
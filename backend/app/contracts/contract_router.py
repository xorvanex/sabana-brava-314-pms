# File path: backend/app/contracts/contract_router.py


# Start file:

from uuid import UUID
from decimal import Decimal
from datetime import date
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Form
)

from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from app.database.sessions import get_db

from app.auth.dependencies import require_admin_or_owner

from . import contract_scheme, contract_service


# Router definition for contract-related endpoints
router = APIRouter(
    prefix="/contracts",
    tags=["Contracts"]
)


def parse_room_ids(room_ids: Optional[List[str]]) -> List[UUID]:
    parsed_room_ids: List[UUID] = []

    for room_id_value in room_ids or []:
        for room_id in room_id_value.split(","):
            room_id = room_id.strip()

            if not room_id:
                continue

            try:
                parsed_room_ids.append(UUID(room_id))
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid room_id UUID: {room_id}"
                )

    return parsed_room_ids


# Create a new contract
@router.post(
    "/",
    response_model=contract_scheme.ContractResponse,
    status_code=status.HTTP_201_CREATED
)
def create_contract(
    company_id: UUID = Form(...),

    start_date: date = Form(...),
    end_date: date = Form(...),

    base_rate: Decimal = Form(...),

    description: str = Form(None),

    # Contract negotiated agreements
    terms: str = Form(...),

    room_ids: Optional[List[str]] = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    # Build validated Pydantic schema from form data
    contract_in = contract_scheme.ContractCreate(
        company_id=company_id,
        start_date=start_date,
        end_date=end_date,
        base_rate=base_rate,
        description=description,
        terms=terms,
        room_ids=parse_room_ids(room_ids)
    )

    return contract_service.create_contract(
        db,
        contract_in
    )


@router.post(
    "/preview/pdf",
    response_class=StreamingResponse,
    responses={
        200: {
            "description": "Contract preview PDF",
            "content": {
                "application/pdf": {
                    "schema": {
                        "type": "string",
                        "format": "binary"
                    }
                }
            }
        }
    }
)
def preview_contract_pdf(
    company_id: UUID = Form(...),

    start_date: date = Form(...),
    end_date: date = Form(...),

    base_rate: Decimal = Form(...),

    description: str = Form(None),

    terms: str = Form(...),

    room_ids: Optional[List[str]] = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    contract_in = contract_scheme.ContractCreate(
        company_id=company_id,
        start_date=start_date,
        end_date=end_date,
        base_rate=base_rate,
        description=description,
        terms=terms,
        room_ids=parse_room_ids(room_ids)
    )

    return contract_service.preview_contract_pdf(
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
    token_payload: dict = Depends(require_admin_or_owner)
):

    return contract_service.get_all_contracts(db)


# Retrieve active contracts
@router.get(
    "/active",
    response_model=List[contract_scheme.ContractResponse]
)
def get_active_contracts(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    return contract_service.get_active_contracts(db)


# Retrieve active contracts for companies
@router.get(
    "/company/{company_id}",
    response_model=List[contract_scheme.ContractResponse]
)
def get_company_contracts(
    company_id: UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    return contract_service.get_company_contracts(db, company_id)


# Retrieve contract by ID
@router.get(
    "/{contract_id}",
    response_model=contract_scheme.ContractResponse
)
def get_contract_by_id(
    contract_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
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

    start_date: date = Form(None),
    end_date: date = Form(None),

    base_rate: Decimal = Form(None),

    description: str = Form(None),
    terms: str = Form(None),

    is_active: bool = Form(None),

    room_ids: Optional[List[UUID]] = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    # Build validated update schema from form data
    contract_in = contract_scheme.ContractUpdate(
        start_date=start_date,
        end_date=end_date,
        base_rate=base_rate,
        description=description,
        terms=terms,
        is_active=is_active,
        room_ids=room_ids
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
    token_payload: dict = Depends(require_admin_or_owner)
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
    token_payload: dict = Depends(require_admin_or_owner)
):

    return contract_service.generate_contract_pdf(
        db,
        contract_id
    )

# End file:

"""
Contract business logic module.

This module contains validation rules and business operations
related to contract management.
"""

# File path: backend/app/contracts/contract_service.py

from datetime import date, datetime
from types import SimpleNamespace
from typing import cast
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import contract_repository, contract_scheme
from app.companies import company_repository
from .contract_pdf_generator import (
    generate_contract_pdf as create_contract_pdf,
    generate_contract_preview_pdf as create_contract_preview_pdf
)


# Availability Validation Operations
def validate_contract_rooms(
    db: Session,
    room_ids: list[UUID],
    exclude_contract_id: UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None
) -> None:
    """
    Validate room availability for contract assignment.

    Ensures rooms are active, unique, and not assigned to other
    active contracts with overlapping dates.
    """
    if not room_ids:
        return

    unique_room_ids = set(room_ids)

    if len(unique_room_ids) != len(room_ids):
        raise HTTPException(
            status_code=400,
            detail="Duplicate room IDs are not allowed"
        )

    rooms = contract_repository.get_rooms_by_ids(db, room_ids)
    found_room_ids = {cast(UUID, room.id) for room in rooms}
    missing_room_ids = unique_room_ids - found_room_ids

    if missing_room_ids:
        raise HTTPException(
            status_code=404,
            detail="One or more rooms were not found"
        )

    inactive_rooms = [
        cast(str, room.room_number)
        for room in rooms
        if not bool(room.is_active)
    ]

    if inactive_rooms:
        raise HTTPException(
            status_code=400,
            detail=f"Inactive rooms cannot be assigned to contracts: {', '.join(inactive_rooms)}"
        )

    assigned_rooms = contract_repository.get_rooms_assigned_to_active_contracts(
        db,
        room_ids,
        exclude_contract_id=exclude_contract_id,
        start_date=start_date,
        end_date=end_date
    )

    if assigned_rooms:
        assigned_room_numbers = ", ".join(
            cast(str, room.room_number)
            for room in assigned_rooms
        )
        raise HTTPException(
            status_code=400,
            detail=f"Rooms already assigned to another active contract with overlapping dates: {assigned_room_numbers}"
        )


# Contract Creation Operations
def generate_contract_number(db: Session) -> str:
    """Generate unique contract number with year and sequential ID."""
    current_year = datetime.now().year
    total_contracts = len(contract_repository.get_all_contracts(db)) + 1

    return f"CTR-{current_year}-{total_contracts:05d}"


def create_contract(
    db: Session,
    contract_in: contract_scheme.ContractCreate
) -> dict:
    """
    Create new contract with company and room validation.

    Validates company existence, status, date range, and absence
    of overlapping contracts before creating the contract.
    """
    company = company_repository.get_company_by_id(db, contract_in.company_id)

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    if not bool(company.is_active):
        raise HTTPException(
            status_code=400,
            detail="Company is inactive"
        )

    if contract_in.end_date <= contract_in.start_date:
        raise HTTPException(
            status_code=400,
            detail="Contract end date must be greater than start date"
        )

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

    validate_contract_rooms(
        db,
        contract_in.room_ids,
        start_date=contract_in.start_date,
        end_date=contract_in.end_date
    )

    contract_data = contract_in.model_dump(exclude={"room_ids"})
    contract_data["contract_number"] = contract_number

    return contract_repository.create_contract(
        db,
        contract_data,
        contract_in.room_ids
    )


def preview_contract_pdf(
    db: Session,
    contract_in: contract_scheme.ContractCreate
):
    """Generate PDF preview for contract before creation."""
    company = company_repository.get_company_by_id(db, contract_in.company_id)

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    if not bool(company.is_active):
        raise HTTPException(
            status_code=400,
            detail="Company is inactive"
        )

    if contract_in.end_date <= contract_in.start_date:
        raise HTTPException(
            status_code=400,
            detail="Contract end date must be greater than start date"
        )

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

    validate_contract_rooms(
        db,
        contract_in.room_ids,
        start_date=contract_in.start_date,
        end_date=contract_in.end_date
    )

    rooms = contract_repository.get_rooms_by_ids(db, contract_in.room_ids)
    rooms_by_id = {cast(UUID, room.id): room for room in rooms}
    ordered_rooms = [rooms_by_id[room_id] for room_id in contract_in.room_ids]

    preview_contract = SimpleNamespace(
        contract_number="PREVIEW",
        start_date=contract_in.start_date,
        end_date=contract_in.end_date,
        base_rate=contract_in.base_rate,
        description=contract_in.description,
        terms=contract_in.terms,
        is_active=True,
        rooms=ordered_rooms
    )

    return create_contract_preview_pdf(preview_contract, company)


# Contract Retrieval Operations
def get_contract_by_id(db: Session, contract_id: UUID) -> dict:
    """Retrieve contract by ID with relationships."""
    contract = contract_repository.get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract


def get_all_contracts(db: Session) -> list:
    """Retrieve all contracts."""
    return contract_repository.get_all_contracts(db)


# Contract Update Operations
def update_contract(
    db: Session,
    contract_id: UUID,
    contract_in: contract_scheme.ContractUpdate
) -> dict:
    """
    Update contract with date and room validation.

    Validates date range and checks for conflicts with other
    contracts before applying updates.
    """
    contract = contract_repository.get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    new_start_date = cast(date, contract_in.start_date or contract.start_date)
    new_end_date = cast(date, contract_in.end_date or contract.end_date)

    if new_end_date <= new_start_date:
        raise HTTPException(
            status_code=400,
            detail="Invalid contract date range"
        )

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

    room_ids = contract_in.room_ids
    update_data = contract_in.model_dump(exclude={"room_ids"}, exclude_none=True)

    final_is_active = bool(update_data.get("is_active", contract.is_active))

    if final_is_active:
        rooms_to_validate = room_ids

        if rooms_to_validate is None:
            rooms_to_validate = [
                cast(UUID, contract_room.room_id)
                for contract_room in contract.contract_rooms
            ]

        validate_contract_rooms(
            db,
            rooms_to_validate,
            exclude_contract_id=contract_id,
            start_date=new_start_date,
            end_date=new_end_date
        )

    return contract_repository.update_contract(
        db,
        contract_id,
        update_data,
        room_ids
    )


def toggle_contract_status(db: Session, contract_id: UUID) -> dict:
    """Toggle contract active/inactive status with room validation."""
    contract = contract_repository.get_contract_by_id(db, contract_id)

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    new_status = not bool(contract.is_active)

    if new_status:
        validate_contract_rooms(
            db,
            [
                cast(UUID, contract_room.room_id)
                for contract_room in contract.contract_rooms
            ],
            exclude_contract_id=contract_id,
            start_date=cast(date, contract.start_date),
            end_date=cast(date, contract.end_date)
        )

    return contract_repository.update_contract(
        db,
        contract_id,
        {"is_active": new_status}
    )


# Room Assignment Operations
def get_company_contracts(db: Session, company_id: UUID) -> list:
    """Retrieve all contracts for a specific company."""
    return contract_repository.get_company_contracts(db, company_id)


def get_active_contracts(db: Session) -> list:
    """Retrieve all active contracts."""
    return contract_repository.get_active_contracts(db)


# Business Validation Operations
def generate_contract_pdf(db: Session, contract_id: UUID):
    """Generate PDF document for contract."""
    return create_contract_pdf(db, contract_id, contract_repository)

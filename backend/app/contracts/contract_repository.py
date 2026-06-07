"""
Contract database operations module.

This module provides database operations for contract management,
including room assignment and availability queries.
"""

# File path: backend/app/contracts/contract_repository.py

from datetime import date
from typing import cast
from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from .contract_model import Contract, ContractRoom
from app.rooms.room_model import Room


# Read Operations
def get_contract_by_id(db: Session, contract_id: UUID) -> Contract | None:
    """Retrieve contract with relationships for response construction."""
    return (
        db.query(Contract)
        .options(
            joinedload(Contract.company),
            joinedload(Contract.contract_rooms).joinedload(ContractRoom.room),
            joinedload(Contract.rooms)
        )
        .filter(Contract.id == contract_id)
        .first()
    )


def get_all_contracts(db: Session):
    """Retrieve all contracts with relationships."""
    return (
        db.query(Contract)
        .options(
            joinedload(Contract.company),
            joinedload(Contract.contract_rooms).joinedload(ContractRoom.room),
            joinedload(Contract.rooms)
        )
        .all()
    )


def get_company_active_contracts(db: Session, company_id: UUID):
    """Retrieve active contracts for a specific company."""
    return (
        db.query(Contract)
        .filter(
            Contract.company_id == company_id,
            Contract.is_active == True
        )
        .all()
    )


def get_latest_active_contract_by_company(db: Session, company_id: UUID) -> Contract | None:
    """Retrieve the most recent active contract for a company."""
    return (
        db.query(Contract)
        .filter(
            Contract.company_id == company_id,
            Contract.is_active == True
        )
        .order_by(desc(Contract.start_date))
        .first()
    )


def get_company_contracts(db: Session, company_id: UUID):
    """Retrieve all contracts for a specific company."""
    return (
        db.query(Contract)
        .filter(Contract.company_id == company_id)
        .options(
            joinedload(Contract.company),
            joinedload(Contract.contract_rooms).joinedload(ContractRoom.room),
            joinedload(Contract.rooms)
        )
        .all()
    )


def get_active_contracts(db: Session):
    """Retrieve all active contracts."""
    return (
        db.query(Contract)
        .filter(Contract.is_active == True)
        .options(
            joinedload(Contract.company),
            joinedload(Contract.contract_rooms).joinedload(ContractRoom.room),
            joinedload(Contract.rooms)
        )
        .all()
    )


# Create Operations
def create_contract(db: Session, contract_data: dict, room_ids: list[UUID] | None = None) -> Contract:
    """Create new contract with assigned rooms."""
    new_contract = Contract(**contract_data)

    db.add(new_contract)
    db.flush()

    for room_id in room_ids or []:
        db.add(
            ContractRoom(
                contract_id=new_contract.id,
                room_id=room_id
            )
        )

    db.commit()

    return get_contract_by_id(db, cast(UUID, new_contract.id))


# Update Operations
def update_contract(
    db: Session,
    contract_id: UUID,
    contract_data: dict,
    room_ids: list[UUID] | None = None
) -> Contract | None:
    """Update existing contract and reassign rooms if specified."""
    contract = get_contract_by_id(db, contract_id)

    if contract:
        for key, value in contract_data.items():
            setattr(contract, key, value)

        if room_ids is not None:
            db.query(ContractRoom).filter(
                ContractRoom.contract_id == contract_id
            ).delete()

            for room_id in room_ids:
                db.add(
                    ContractRoom(
                        contract_id=contract_id,
                        room_id=room_id
                    )
                )

        db.commit()
        contract = get_contract_by_id(db, contract_id)

    return contract


# Room Assignment Queries
def check_overlapping_contracts(
    db: Session,
    company_id: UUID,
    start_date: date,
    end_date: date,
    exclude_contract_id: UUID | None = None
) -> bool:
    """
    Validate contract dates before room allocation.

    Prevents rooms from being assigned to multiple active contracts
    with overlapping validity periods.
    """
    query = db.query(Contract).filter(
        Contract.company_id == company_id,
        Contract.is_active == True,
        Contract.start_date < end_date,
        Contract.end_date > start_date
    )

    if exclude_contract_id:
        query = query.filter(Contract.id != exclude_contract_id)

    return query.first() is not None


def get_rooms_by_ids(db: Session, room_ids: list[UUID]) -> list[Room]:
    """Retrieve rooms by their IDs."""
    if not room_ids:
        return []

    return (
        db.query(Room)
        .filter(Room.id.in_(room_ids))
        .all()
    )


def get_rooms_assigned_to_active_contracts(
    db: Session,
    room_ids: list[UUID],
    exclude_contract_id: UUID | None = None,
    start_date: date | None = None,
    end_date: date | None = None
) -> list[Room]:
    """
    Ensure assigned rooms remain available during the contract term.

    Excludes contracts outside the requested period to prevent
    conflicts with room exclusivity rules.
    """
    if not room_ids:
        return []

    query = (
        db.query(Room)
        .filter(
            ContractRoom.room_id == Room.id,
            Contract.id == ContractRoom.contract_id,
            Room.id.in_(room_ids),
            Contract.is_active == True
        )
    )

    if exclude_contract_id:
        query = query.filter(Contract.id != exclude_contract_id)

    if start_date is not None and end_date is not None:
        query = query.filter(
            Contract.start_date <= end_date,
            Contract.end_date >= start_date
        )

    return query.all()

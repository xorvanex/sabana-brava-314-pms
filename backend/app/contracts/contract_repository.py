# File path: backend/app/contracts/contract_repository.py

# Start file:

from datetime import date

from uuid import UUID

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc

from .contract_model import Contract, ContractRoom
from app.rooms.room_model import Room


# Retrieve contract by ID
def get_contract_by_id(
    db: Session,
    contract_id: UUID
) -> Contract | None:

    # joinedload optimization:
    # Loads related company in same query
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


# Retrieve all contracts
def get_all_contracts(db: Session):

    return (
        db.query(Contract)
        .options(
            joinedload(Contract.company),
            joinedload(Contract.contract_rooms).joinedload(ContractRoom.room),
            joinedload(Contract.rooms)
        )
        .all()
    )


# Retrieve contract by company
def get_company_active_contracts(
    db: Session,
    company_id: UUID
):

    return (
        db.query(Contract)
        .filter(
            Contract.company_id == company_id,
            Contract.is_active == True
        )
        .all()
    )


# Retrieve contracts by company
def get_company_contracts(db: Session, company_id: UUID):
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


# Retrieve active contracts
def get_active_contracts(db: Session):
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

# Create new contract record
def create_contract(
    db: Session,
    contract_data: dict,
    room_ids: list[UUID] | None = None
) -> Contract:

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

    return get_contract_by_id(db, new_contract.id)


# Update existing contract
def update_contract(
    db: Session,
    contract_id: UUID,
    contract_data: dict,
    room_ids: list[UUID] | None = None
) -> Contract | None:

    contract = get_contract_by_id(
        db,
        contract_id
    )

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


# Retrieve the last contract
def get_last_contract(db: Session):

    return (
        db.query(Contract)
        .order_by(desc(Contract.created_at))
        .first()
    )


def check_overlapping_contracts(
    db: Session,
    company_id: UUID,
    start_date: date,
    end_date: date,
    exclude_contract_id: UUID | None = None
) -> bool:
    """
    Check if there are contracts with overlapping periods for a company.
    
    Args:
        db: BD Session
        company_id: Company ID
        start_date: Start date of the new contract
        end_date: End date of the new contract
        exclude_contract_id: Contract ID to exclude (for updates)
        
    Returns:
        True if there is overlap, False if there is no
    """
    query = db.query(Contract).filter(
        Contract.company_id == company_id,
        Contract.is_active == True,
        # Overlap logic:
        # Two periods overlap if:
        # start_date_new < end_date_existing AND end_date_new > start_date_existing
        Contract.start_date < end_date,
        Contract.end_date > start_date
    )
    
    if exclude_contract_id:
        query = query.filter(Contract.id != exclude_contract_id)
    
    return query.first() is not None


def get_rooms_by_ids(
    db: Session,
    room_ids: list[UUID]
) -> list[Room]:
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
    exclude_contract_id: UUID | None = None
) -> list[Room]:
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

    return query.all()

# End file:

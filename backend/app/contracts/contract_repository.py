# File path: backend/app/contracts/contract_repository.py


# Start file:

from datetime import date

from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from .contract_model import Contract


# Retrieve contract by ID
def get_contract_by_id(
    db: Session,
    contract_id: UUID
) -> Contract | None:

    # joinedload optimization:
    # Loads related company in same query
    return (
        db.query(Contract)
        .options(joinedload(Contract.company))
        .filter(Contract.id == contract_id)
        .first()
    )


# Retrieve all contracts
def get_all_contracts(db: Session):

    return (
        db.query(Contract)
        .options(joinedload(Contract.company))
        .all()
    )


# Retrieve contract by company
def get_company_active_contracts(
    db: Session,
    empresa_id: UUID
):

    return (
        db.query(Contract)
        .filter(
            Contract.empresa_id == empresa_id,
            Contract.activo == True
        )
        .all()
    )


# Retrieve contracts by company
def get_company_contracts(db: Session, empresa_id: UUID):
    return (
        db.query(Contract)
        .filter(Contract.empresa_id == empresa_id)
        .options(joinedload(Contract.company))
        .all()
    )


# Retrieve active contracts
def get_active_contracts(db: Session):
    return (
        db.query(Contract)
        .filter(Contract.activo == True)
        .options(joinedload(Contract.company))
        .all()
    )

# Create new contract record
def create_contract(
    db: Session,
    contract_data: dict
) -> Contract:

    new_contract = Contract(**contract_data)

    db.add(new_contract)
    db.commit()
    db.refresh(new_contract)

    return new_contract


# Update existing contract
def update_contract(
    db: Session,
    contract_id: UUID,
    contract_data: dict
) -> Contract | None:

    contract = get_contract_by_id(
        db,
        contract_id
    )

    if contract:

        for key, value in contract_data.items():
            setattr(contract, key, value)

        db.commit()
        db.refresh(contract)

    return contract


def check_overlapping_contracts(
    db: Session,
    empresa_id: UUID,
    fecha_inicio: date,
    fecha_fin: date,
    exclude_contract_id: UUID | None = None
) -> bool:
    """
    Check if there are contracts with overlapping periods for a company.
    
    Args:
        db: BD Session
        empresa_id: Company ID
        fecha_inicio: Start date of the new contract
        fecha_fin: End date of the new contract
        exclude_contract_id: Contract ID to exclude (for updates)
        
    Returns:
        True if there is overlap, False if there is no
    """
    query = db.query(Contract).filter(
        Contract.empresa_id == empresa_id,
        Contract.activo == True,
        # Overlap logic:
        # Two periods overlap if:
        # fecha_inicio_new < fecha_fin_existing AND fecha_fin_new > fecha_inicio_existing
        Contract.fecha_inicio < fecha_fin,
        Contract.fecha_fin > fecha_inicio
    )
    
    if exclude_contract_id:
        query = query.filter(Contract.id != exclude_contract_id)
    
    return query.first() is not None

# End file:
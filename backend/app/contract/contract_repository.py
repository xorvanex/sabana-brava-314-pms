# Repository Layer:
# - Handles database operations
# - Executes ORM queries
# - Manages entity persistence
# - Contains no business logic

# Start file:

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


# Retrieve active contracts by company
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


# End file:
# File path: backend/app/contracts/contract_service.py


from datetime import date, datetime
from typing import cast
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import (
    contract_repository,
    contract_scheme
)

from app.companies import company_repository
from .contract_pdf_generator import generate_contract_pdf as create_contract_pdf


def generate_contract_number(db: Session) -> str:
    current_year = datetime.now().year
    total_contracts = len(contract_repository.get_all_contracts(db)) + 1
    
    return f"CTR-{current_year}-{total_contracts:05d}"


def create_contract(
    db: Session,
    contract_in: contract_scheme.ContractCreate
) -> dict:
    # Validar existencia de la empresa
    company = company_repository.get_company_by_id(
        db,
        contract_in.company_id
    )

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )
    
    # Validar que la empresa esté activa
    if not bool(company.is_active):
        raise HTTPException(
            status_code=400,
            detail="Company is inactive"
        )
    
    # Validar rango de fechas
    if contract_in.end_date <= contract_in.start_date:
        raise HTTPException(
            status_code=400,
            detail="Contract end date must be greater than start date"
        )

    # Validar que no haya contratos superpuestos
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

    # Generar número único de contrato
    contract_number = generate_contract_number(db)
    
    # Preparar datos para guardar
    contract_data = contract_in.model_dump()
    contract_data["contract_number"] = contract_number
    
    # Guardar en base de datos
    return contract_repository.create_contract(
        db,
        contract_data
    )


def get_contract_by_id(
    db: Session,
    contract_id: UUID
) -> dict:
    contract = contract_repository.get_contract_by_id(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    return contract


def get_all_contracts(db: Session) -> list:
    return contract_repository.get_all_contracts(db)


def update_contract(
    db: Session,
    contract_id: UUID,
    contract_in: contract_scheme.ContractUpdate
) -> dict:
    # Obtener contrato existente
    contract = contract_repository.get_contract_by_id(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    # Resolver fechas finales (usar nuevas o mantener las existentes)
    new_start_date = cast(
        date,
        contract_in.start_date or contract.start_date
    )

    new_end_date = cast(
        date,
        contract_in.end_date or contract.end_date
    )

    # Validar rango de fechas
    if new_end_date <= new_start_date:
        raise HTTPException(
            status_code=400,
            detail="Invalid contract date range"
        )
    
    # Validar que no haya conflictos con otros contratos
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
    
    # Preparar datos para actualizar
    update_data = contract_in.model_dump(exclude_unset=True)

    return contract_repository.update_contract(
        db,
        contract_id,
        update_data
    )


def toggle_contract_status(
    db: Session,
    contract_id: UUID
) -> dict:
    contract = contract_repository.get_contract_by_id(
        db,
        contract_id
    )

    if not contract:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    # Invertir estado actual
    new_status = not bool(contract.is_active)

    return contract_repository.update_contract(
        db,
        contract_id,
        {"is_active": new_status}
    )


def get_company_contracts(
    db: Session,
    company_id: UUID
) -> list:
    return contract_repository.get_company_contracts(db, company_id)


def get_active_contracts(db: Session) -> list:
    return contract_repository.get_active_contracts(db)


def generate_contract_pdf(
    db: Session,
    contract_id: UUID
):
    return create_contract_pdf(
        db,
        contract_id,
        contract_repository
    )


# End file:
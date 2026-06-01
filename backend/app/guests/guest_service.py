# File path: backend/app/guests/guest_service.py

# Start file:

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session
from typing import cast

from . import (
    guest_repository,
    guest_scheme
)

from app.companies import company_repository


# =========================================================
# CREATE
# =========================================================

def create_guest(
    db: Session,
    guest_in: guest_scheme.GuestCreate
):

    company = company_repository.get_company_by_id(
        db,
        guest_in.company_id
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    if not cast(bool, company.is_active):
        raise HTTPException(
            status_code=400,
            detail="Company is inactive"
        )

    existing_guest = (
        guest_repository.get_guest_by_document(
            db,
            guest_in.document_number
        )
    )

    if existing_guest:
        raise HTTPException(
            status_code=400,
            detail="Document number already exists"
        )

    return guest_repository.create_guest(
        db,
        guest_in.model_dump()
    )


# =========================================================
# GET BY ID
# =========================================================

def get_guest_by_id(
    db: Session,
    guest_id: UUID
):

    guest = guest_repository.get_guest_by_id(
        db,
        guest_id
    )

    if guest is None:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    return guest


# =========================================================
# GET ALL
# =========================================================

def get_all_guests(
    db: Session
):
    return guest_repository.get_all_guests(db)


# =========================================================
# GET COMPANY GUESTS
# =========================================================

def get_company_guests(
    db: Session,
    company_id: UUID
):

    company = company_repository.get_company_by_id(
        db,
        company_id
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found"
        )

    return guest_repository.get_company_guests(
        db,
        company_id
    )


# =========================================================
# UPDATE
# =========================================================

def update_guest(
    db: Session,
    guest_id: UUID,
    guest_in: guest_scheme.GuestUpdate
):

    guest = guest_repository.get_guest_by_id(
        db,
        guest_id
    )

    if guest is None:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    update_data = guest_in.model_dump(
        exclude_unset=True,
        exclude_none=True
    )

    if "document_number" in update_data:

        existing_guest = (
            guest_repository.get_guest_by_document(
                db,
                update_data["document_number"]
            )
        )


        if (
            existing_guest is not None
            and cast(UUID, existing_guest.id) != guest_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Document number already exists"
            )

    return guest_repository.update_guest(
        db,
        guest_id,
        update_data
    )


# =========================================================
# DELETE
# =========================================================

def delete_guest(
    db: Session,
    guest_id: UUID
):

    guest = guest_repository.delete_guest(
        db,
        guest_id
    )

    if guest is None:
        raise HTTPException(
            status_code=404,
            detail="Guest not found"
        )

    return {
        "message": "Guest deleted successfully"
    }

# End file:
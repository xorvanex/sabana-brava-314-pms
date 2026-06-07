# File path: backend/app/guests/guest_service.py

"""
Guest business logic module.

This module contains validation rules and business operations
related to guest management.
"""

from uuid import UUID
from typing import cast

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from . import guest_repository
from .guest_scheme import GuestCreate, GuestUpdate

from app.companies import company_repository


def create_guest_service(
    db: Session,
    guest_data: GuestCreate
):

    company = company_repository.get_company_by_id(
        db,
        guest_data.company_id
    )

    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    if not cast(bool, company.is_active):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Company is inactive"
        )

    existing_guest = (
        guest_repository.get_guest_by_document(
            db,
            guest_data.document_number
        )
    )

    if existing_guest:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Document number already exists"
        )

    return guest_repository.create_guest(
        db,
        guest_data.model_dump()
    )


def get_guest_by_id_service(
    db: Session,
    guest_id: UUID
):

    guest = guest_repository.get_guest_by_id(
        db,
        guest_id
    )

    if guest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )

    return guest


def get_all_guests_service(db: Session):
    return guest_repository.get_all_guests(db)


def get_company_guests_service(
    db: Session,
    company_id: UUID
):

    company = company_repository.get_company_by_id(
        db,
        company_id
    )

    if company is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found"
        )

    return guest_repository.get_company_guests(
        db,
        company_id
    )


def update_guest_service(
    db: Session,
    guest_id: UUID,
    guest_data: GuestUpdate
):

    guest = guest_repository.get_guest_by_id(
        db,
        guest_id
    )

    if guest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )

    update_dict = guest_data.model_dump(
        exclude_unset=True,
        exclude_none=True
    )

    if "document_number" in update_dict:
        existing_guest = (
            guest_repository.get_guest_by_document(
                db,
                update_dict["document_number"]
            )
        )

        if (
            existing_guest is not None
            and cast(UUID, existing_guest.id) != guest_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document number already exists"
            )

    return guest_repository.update_guest(
        db,
        guest_id,
        update_dict
    )


def delete_guest_service(
    db: Session,
    guest_id: UUID
):

    guest = guest_repository.delete_guest(
        db,
        guest_id
    )

    if guest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )

    return {
        "message": "Guest deleted successfully"
    }

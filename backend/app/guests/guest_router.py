# File path: backend/app/guests/guest_router.py

"""
Guest API routes module.

This module provides RESTful endpoints for guest management.
"""

import uuid

from fastapi import (
    APIRouter,
    Depends,
    Form,
    status
)

from sqlalchemy.orm import Session

from app.database.sessions import get_db

from app.auth.dependencies import (
    require_admin_owner_or_receptionist
)

from .guest_scheme import (
    GuestCreate,
    GuestUpdate,
    GuestResponse
)

from .guest_model import (
    DocumentTypeEnum,
    GuestGenderEnum
)

from .guest_service import (
    create_guest_service,
    get_all_guests_service,
    get_company_guests_service,
    get_guest_by_id_service,
    update_guest_service,
    delete_guest_service
)


router = APIRouter(
    prefix="/guests",
    tags=["Guests"]
)


@router.post(
    "/",
    response_model=GuestResponse,
    status_code=status.HTTP_201_CREATED
)
def create_guest(
    company_id: uuid.UUID = Form(...),

    first_name: str = Form(...),
    last_name: str = Form(...),

    document_type: DocumentTypeEnum = Form(...),
    document_number: str = Form(...),

    gender: GuestGenderEnum = Form(...),
    
    phone: str | None = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    guest_data = GuestCreate(
        company_id=company_id,
        first_name=first_name,
        last_name=last_name,
        document_type=document_type,
        document_number=document_number,
        gender=gender,
        phone=phone
    )

    return create_guest_service(
        db,
        guest_data
    )


@router.get(
    "/",
    response_model=list[GuestResponse]
)
def get_all_guests(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return get_all_guests_service(db)


@router.get(
    "/company/{company_id}",
    response_model=list[GuestResponse]
)
def get_company_guests(
    company_id: uuid.UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return get_company_guests_service(
        db,
        company_id
    )


@router.get(
    "/{guest_id}",
    response_model=GuestResponse
)
def get_guest_by_id(
    guest_id: uuid.UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return get_guest_by_id_service(
        db,
        guest_id
    )


@router.put(
    "/{guest_id}",
    response_model=GuestResponse
)
def update_guest(
    guest_id: uuid.UUID,

    first_name: str | None = Form(None),
    last_name: str | None = Form(None),

    document_type: DocumentTypeEnum | None = Form(None),
    document_number: str | None = Form(None),

    gender: GuestGenderEnum | None = Form(None),

    phone: str | None = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    guest_data = GuestUpdate(
        first_name=first_name,
        last_name=last_name,
        document_type=document_type,
        document_number=document_number,
        gender=gender,
        phone=phone
    )

    return update_guest_service(
        db,
        guest_id,
        guest_data
    )


@router.delete(
    "/{guest_id}",
    status_code=status.HTTP_200_OK
)
def delete_guest(
    guest_id: uuid.UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return delete_guest_service(
        db,
        guest_id
    )

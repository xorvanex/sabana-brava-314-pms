# File path: backend/app/guests/guest_router.py

# Start file:

from uuid import UUID

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

from . import (
    guest_service,
    guest_scheme
)

from .guest_model import (
    DocumentTypeEnum,
    GuestGenderEnum
)


# =========================================================
# ROUTER CONFIGURATION
# =========================================================

router = APIRouter(
    prefix="/guests",
    tags=["Guests"]
)


# =========================================================
# CREATE GUEST
# =========================================================

@router.post(
    "/",
    response_model=guest_scheme.GuestResponse,
    status_code=status.HTTP_201_CREATED
)
def create_guest(
    company_id: UUID = Form(...),

    first_name: str = Form(...),
    last_name: str = Form(...),

    document_type: DocumentTypeEnum = Form(...),
    document_number: str = Form(...),

    gender: GuestGenderEnum = Form(...),
    
    phone: str | None = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    guest_in = guest_scheme.GuestCreate(
        company_id=company_id,
        first_name=first_name,
        last_name=last_name,
        document_type=document_type,
        document_number=document_number,
        gender=gender,
        phone=phone
    )

    return guest_service.create_guest(
        db,
        guest_in
    )


# =========================================================
# GET ALL GUESTS
# =========================================================

@router.get(
    "/",
    response_model=list[guest_scheme.GuestResponse]
)
def get_all_guests(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return guest_service.get_all_guests(db)


# =========================================================
# GET COMPANY GUESTS
# =========================================================

@router.get(
    "/company/{company_id}",
    response_model=list[guest_scheme.GuestResponse]
)
def get_company_guests(
    company_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return guest_service.get_company_guests(
        db,
        company_id
    )


# =========================================================
# GET GUEST BY ID
# =========================================================

@router.get(
    "/{guest_id}",
    response_model=guest_scheme.GuestResponse
)
def get_guest_by_id(
    guest_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return guest_service.get_guest_by_id(
        db,
        guest_id
    )


# =========================================================
# UPDATE GUEST
# =========================================================

@router.put(
    "/{guest_id}",
    response_model=guest_scheme.GuestResponse
)
def update_guest(
    guest_id: UUID,

    first_name: str | None = Form(None),
    last_name: str | None = Form(None),

    document_type: DocumentTypeEnum | None = Form(None),
    document_number: str | None = Form(None),

    gender: GuestGenderEnum | None = Form(None),

    phone: str | None = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    guest_in = guest_scheme.GuestUpdate(
        first_name=first_name,
        last_name=last_name,
        document_type=document_type,
        document_number=document_number,
        gender=gender,
        phone=phone
    )

    return guest_service.update_guest(
        db,
        guest_id,
        guest_in
    )


# =========================================================
# DELETE GUEST
# =========================================================

@router.delete(
    "/{guest_id}",
    status_code=status.HTTP_200_OK
)
def delete_guest(
    guest_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_owner_or_receptionist)
):

    return guest_service.delete_guest(
        db,
        guest_id
    )

# End file:

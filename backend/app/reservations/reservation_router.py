# File path: backend/app/reservations/reservation_router.py

# Start file:

from uuid import UUID
from datetime import date
from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Form
)

from sqlalchemy.orm import Session

from app.database.sessions import get_db

from app.auth.dependencies import require_admin_or_owner

from . import reservation_scheme, reservation_service

from app.reservations.reservation_model import ReservationStatusEnum

# Router definition for reservation-related endpoints
router = APIRouter(
    prefix="/reservations",
    tags=["Reservations"]
)


def parse_room_ids(room_ids: Optional[List[str]]) -> List[UUID]:
    parsed_room_ids: List[UUID] = []

    for room_id_value in room_ids or []:
        for room_id in room_id_value.split(","):
            room_id = room_id.strip()

            if not room_id:
                continue

            try:
                parsed_room_ids.append(UUID(room_id))
            except ValueError:
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid room_id UUID: {room_id}"
                )

    return parsed_room_ids


# Create a new reservation
@router.post(
    "/",
    response_model=reservation_scheme.ReservationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_reservation(
    company_id: UUID = Form(...),
    contract_id: UUID = Form(...),

    start_date: date = Form(...),
    end_date: date = Form(...),

    guest_count: int = Form(...),
    status_value: ReservationStatusEnum = Form(ReservationStatusEnum.PENDING, alias="status"),
    notes: str = Form(None),

    room_ids: Optional[List[str]] = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    user_id = token_payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    try:
        created_by = UUID(str(user_id))
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )

    # Build validated Pydantic schema from form data
    reservation_in = reservation_scheme.ReservationCreate(
        company_id=company_id,
        contract_id=contract_id,
        start_date=start_date,
        end_date=end_date,
        guest_count=guest_count,
        status=status_value,
        notes=notes,
        created_by=created_by,
        room_ids=parse_room_ids(room_ids)
    )

    return reservation_service.create_reservation(
        db,
        reservation_in
    )


# Retrieve all reservations
@router.get(
    "/",
    response_model=List[reservation_scheme.ReservationResponse]
)
def get_all_reservations(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    return reservation_service.get_all_reservations(db)


# Retrieve active reservations
@router.get(
    "/active",
    response_model=List[reservation_scheme.ReservationResponse]
)
def get_active_reservations(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    return reservation_service.get_active_reservations(db)


# Retrieve reservations by company
@router.get(
    "/company/{company_id}",
    response_model=List[reservation_scheme.ReservationResponse]
)
def get_company_reservations(
    company_id: UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    return reservation_service.get_company_reservations(db, company_id)


# Retrieve reservation by ID
@router.get(
    "/{reservation_id}",
    response_model=reservation_scheme.ReservationResponse
)
def get_reservation_by_id(
    reservation_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    return reservation_service.get_reservation_by_id(
        db,
        reservation_id
    )


# Update reservation information
@router.put(
    "/{reservation_id}",
    response_model=reservation_scheme.ReservationResponse
)
def update_reservation(
    reservation_id: UUID,

    start_date: date = Form(None),
    end_date: date = Form(None),

    guest_count: int = Form(None),
    status_value: ReservationStatusEnum = Form(ReservationStatusEnum.PENDING, alias="status"),
    notes: str = Form(None),

    room_ids: Optional[List[str]] = Form(None),

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    # Build validated update schema from form data
    reservation_in = reservation_scheme.ReservationUpdate(
        start_date=start_date,
        end_date=end_date,
        guest_count=guest_count,
        status=status_value,
        notes=notes,
        room_ids=parse_room_ids(room_ids) if room_ids is not None else None
    )

    return reservation_service.update_reservation(
        db,
        reservation_id,
        reservation_in
    )


# Toggle reservation active/inactive status
@router.patch(
    "/{reservation_id}/status",
    response_model=reservation_scheme.ReservationResponse
)
def toggle_reservation_status(
    reservation_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):

    return reservation_service.toggle_reservation_status(
        db,
        reservation_id
    )


# Check-in: Mark reservation as CHECKED_IN (sets rooms to OCCUPIED)
@router.patch(
    "/{reservation_id}/check-in",
    response_model=reservation_scheme.ReservationResponse
)
def check_in_reservation(
    reservation_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    from app.reservations.reservation_scheme import ReservationUpdate
    
    # Directly set status to CHECKED_IN
    reservation_in = ReservationUpdate(
        status=ReservationStatusEnum.CHECKED_IN
    )

    return reservation_service.update_reservation(
        db,
        reservation_id,
        reservation_in
    )


# Check-out: Mark reservation as COMPLETED (sets rooms to AVAILABLE)
@router.patch(
    "/{reservation_id}/check-out",
    response_model=reservation_scheme.ReservationResponse
)
def check_out_reservation(
    reservation_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    from app.reservations.reservation_scheme import ReservationUpdate
    
    # Directly set status to COMPLETED
    reservation_in = ReservationUpdate(
        status=ReservationStatusEnum.COMPLETED
    )

    return reservation_service.update_reservation(
        db,
        reservation_id,
        reservation_in
    )


# Mark as NO_SHOW
@router.patch(
    "/{reservation_id}/no-show",
    response_model=reservation_scheme.ReservationResponse
)
def mark_no_show(
    reservation_id: UUID,

    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    from app.reservations.reservation_scheme import ReservationUpdate
    
    reservation_in = ReservationUpdate(
        status=ReservationStatusEnum.NO_SHOW
    )

    return reservation_service.update_reservation(
        db,
        reservation_id,
        reservation_in
    )


# End file:

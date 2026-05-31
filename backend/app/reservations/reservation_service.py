# File path: backend/app/reservations/reservation_service.py

# Start file:

from datetime import date
from typing import cast
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from . import (
    reservation_repository,
    reservation_scheme
)

from app.companies import company_repository

from app.reservations.reservation_model import ReservationStatusEnum, BLOCKING_STATUSES


def validate_reservation_rooms(
    db: Session,
    contract_id: UUID,
    room_ids: list[UUID],
    start_date: date,
    end_date: date,
    exclude_reservation_id: UUID | None = None
) -> None:
    if not room_ids:
        return

    unique_room_ids = set(room_ids)

    if len(unique_room_ids) != len(room_ids):
        raise HTTPException(
            status_code=400,
            detail="Duplicate room IDs are not allowed"
        )

    rooms = reservation_repository.get_rooms_by_ids(db, room_ids)
    found_room_ids = {cast(UUID, room.id) for room in rooms}
    missing_room_ids = unique_room_ids - found_room_ids

    if missing_room_ids:
        raise HTTPException(
            status_code=404,
            detail="One or more rooms were not found"
        )

    inactive_rooms = [
        cast(str, room.room_number)
        for room in rooms
        if not bool(room.is_active)
    ]

    if inactive_rooms:
        raise HTTPException(
            status_code=400,
            detail=f"Inactive rooms cannot be reserved: {', '.join(inactive_rooms)}"
        )

    contract_room_ids = reservation_repository.get_contract_room_ids(
        db,
        contract_id
    )

    # Reservation rooms must stay inside the contract room scope.
    if not unique_room_ids.issubset(contract_room_ids):
        raise HTTPException(
            status_code=400,
            detail="Room is not assigned to the contract."
        )

    # Active reservation statuses block the same room date range.
    if reservation_repository.check_overlapping_reservations(
        db,
        room_ids,
        start_date,
        end_date,
        exclude_reservation_id=exclude_reservation_id
    ):
        raise HTTPException(
            status_code=400,
            detail="Room already has an active reservation with overlapping dates"
        )


def validate_reservation_contract(
    db: Session,
    company_id: UUID,
    contract_id: UUID,
    start_date: date,
    end_date: date
):
    contract = reservation_repository.get_contract_by_id(
        db,
        contract_id
    )

    if contract is None:
        raise HTTPException(
            status_code=404,
            detail="Contract not found"
        )

    if not cast(bool, contract.is_active):
        raise HTTPException(
            status_code=400,
            detail="Contract is inactive"
        )

    if cast(UUID, contract.company_id) != company_id:
        raise HTTPException(
            status_code=400,
            detail="Contract does not belong to the company"
        )

    contract_start_date = cast(date, contract.start_date)
    contract_end_date = cast(date, contract.end_date)

    # Reservations cannot extend outside the negotiated contract period.
    if start_date < contract_start_date or end_date > contract_end_date:
        raise HTTPException(
            status_code=400,
            detail="Reservation dates must be within the contract date range"
        )

    return contract


def create_reservation(
    db: Session,
    reservation_in: reservation_scheme.ReservationCreate
) -> dict:
    # Validate company
    company = company_repository.get_company_by_id(
        db,
        reservation_in.company_id
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

    # Validate reservation dates
    if reservation_in.end_date <= reservation_in.start_date:
        raise HTTPException(
            status_code=400,
            detail="Reservation end date must be greater than start date"
        )

    # Validate contract
    validate_reservation_contract(
        db,
        reservation_in.company_id,
        reservation_in.contract_id,
        reservation_in.start_date,
        reservation_in.end_date
    )

    # Validate room availability
    validate_reservation_rooms(
        db,
        reservation_in.contract_id,
        reservation_in.room_ids,
        reservation_in.start_date,
        reservation_in.end_date
    )

    reservation_data = reservation_in.model_dump(exclude={"room_ids"})

    return reservation_repository.create_reservation(
        db,
        reservation_data,
        reservation_in.room_ids
    )


def get_reservation_by_id(
    db: Session,
    reservation_id: UUID
) -> dict:
    reservation = reservation_repository.get_reservation_by_id(
        db,
        reservation_id
    )

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    return reservation


def get_all_reservations(db: Session) -> list:
    return reservation_repository.get_all_reservations(db)


def get_active_reservations(db: Session) -> list:
    return reservation_repository.get_active_reservations(db)


def get_company_reservations(
    db: Session,
    company_id: UUID
) -> list:
    return reservation_repository.get_company_reservations(db, company_id)


def update_reservation(
    db: Session,
    reservation_id: UUID,
    reservation_in: reservation_scheme.ReservationUpdate
) -> dict:
    reservation = reservation_repository.get_reservation_by_id(
        db,
        reservation_id
    )

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    new_start_date = cast(
        date,
        reservation_in.start_date or reservation.start_date
    )

    new_end_date = cast(
        date,
        reservation_in.end_date or reservation.end_date
    )

    if new_end_date <= new_start_date:
        raise HTTPException(
            status_code=400,
            detail="Invalid reservation date range"
        )

    room_ids = reservation_in.room_ids
    update_data = reservation_in.model_dump(
        exclude={"room_ids"},
        exclude_none=True
    )

    final_status = update_data.get("status", reservation.status)
    final_blocks_availability = final_status in BLOCKING_STATUSES   

    if final_blocks_availability:
        validate_reservation_contract(
            db,
            cast(UUID, reservation.company_id),
            cast(UUID, reservation.contract_id),
            new_start_date,
            new_end_date
        )

        rooms_to_validate = room_ids

        if rooms_to_validate is None:
            rooms_to_validate = [
                cast(UUID, reservation_room.room_id)
                for reservation_room in reservation.reservation_rooms
            ]

        validate_reservation_rooms(
            db,
            cast(UUID, reservation.contract_id),
            rooms_to_validate,
            new_start_date,
            new_end_date,
            exclude_reservation_id=reservation_id
        )

    return reservation_repository.update_reservation(
        db,
        reservation_id,
        update_data,
        room_ids
    )


def toggle_reservation_status(
    db: Session,
    reservation_id: UUID
) -> dict:
    reservation = reservation_repository.get_reservation_by_id(
        db,
        reservation_id
    )

    if reservation is None:
        raise HTTPException(
            status_code=404,
            detail="Reservation not found"
        )

    current_status = reservation.status
    
    if current_status in BLOCKING_STATUSES:
        new_status = ReservationStatusEnum.CANCELLED
    else:
        new_status = ReservationStatusEnum.PENDING

    if new_status in BLOCKING_STATUSES:
        validate_reservation_contract(
            db,
            cast(UUID, reservation.company_id),
            cast(UUID, reservation.contract_id),
            cast(date, reservation.start_date),
            cast(date, reservation.end_date)
        )

        validate_reservation_rooms(
            db,
            cast(UUID, reservation.contract_id),
            [
                cast(UUID, reservation_room.room_id)
                for reservation_room in reservation.reservation_rooms
            ],
            cast(date, reservation.start_date),
            cast(date, reservation.end_date),
            exclude_reservation_id=reservation_id
        )

    return reservation_repository.update_reservation(
        db,
        reservation_id,
        {"status": new_status}
    )

# End file:

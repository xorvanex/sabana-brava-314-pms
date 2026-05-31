# File path: backend/app/reservations/reservation_repository.py

# Start file: 

from datetime import date
from typing import cast
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from .reservation_model import Reservation, ReservationRoom
from app.contracts.contract_model import Contract, ContractRoom
from app.rooms.room_model import Room

from app.reservations.reservation_model import ReservationStatusEnum, BLOCKING_STATUSES


# Retrieve reservation by ID
def get_reservation_by_id(
    db: Session,
    reservation_id: UUID
) -> Reservation | None:

    return (
        db.query(Reservation)
        .options(
            joinedload(Reservation.company),
            joinedload(Reservation.contract),
            joinedload(Reservation.reservation_rooms).joinedload(ReservationRoom.room),
            joinedload(Reservation.rooms)
        )
        .filter(Reservation.id == reservation_id)
        .first()
    )


# Retrieve all reservations
def get_all_reservations(db: Session):

    return (
        db.query(Reservation)
        .options(
            joinedload(Reservation.company),
            joinedload(Reservation.contract),
            joinedload(Reservation.reservation_rooms).joinedload(ReservationRoom.room),
            joinedload(Reservation.rooms)
        )
        .all()
    )


# Retrieve active reservations
def get_active_reservations(db: Session):

    return (
        db.query(Reservation)
        .filter(Reservation.status.in_(ReservationStatusEnum))
        .options(
            joinedload(Reservation.company),
            joinedload(Reservation.contract),
            joinedload(Reservation.reservation_rooms).joinedload(ReservationRoom.room),
            joinedload(Reservation.rooms)
        )
        .all()
    )


# Retrieve reservations by company
def get_company_reservations(
    db: Session,
    company_id: UUID
):

    return (
        db.query(Reservation)
        .filter(Reservation.company_id == company_id)
        .options(
            joinedload(Reservation.company),
            joinedload(Reservation.contract),
            joinedload(Reservation.reservation_rooms).joinedload(ReservationRoom.room),
            joinedload(Reservation.rooms)
        )
        .all()
    )


# Create new reservation record
def create_reservation(
    db: Session,
    reservation_data: dict,
    room_ids: list[UUID] | None = None
) -> Reservation:

    new_reservation = Reservation(**reservation_data)

    db.add(new_reservation)
    db.flush()

    for room_id in room_ids or []:
        db.add(
            ReservationRoom(
                reservation_id=cast(UUID, new_reservation.id),
                room_id=room_id
            )
        )

    db.commit()
    db.refresh(new_reservation)

    reservation = get_reservation_by_id(
        db,
        cast(UUID, new_reservation.id)
    )

    if reservation is None:
        raise RuntimeError("Reservation was not found after creation")

    return reservation


# Update existing reservation
def update_reservation(
    db: Session,
    reservation_id: UUID,
    reservation_data: dict,
    room_ids: list[UUID] | None = None
) -> Reservation | None:

    reservation = get_reservation_by_id(
        db,
        reservation_id
    )

    if reservation:

        for key, value in reservation_data.items():
            setattr(reservation, key, value)

        if room_ids is not None:
            db.query(ReservationRoom).filter(
                ReservationRoom.reservation_id == reservation_id
            ).delete()

            for room_id in room_ids:
                db.add(
                    ReservationRoom(
                        reservation_id=reservation_id,
                        room_id=room_id
                    )
                )

        db.commit()
        reservation = get_reservation_by_id(db, reservation_id)

    return reservation


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


def get_contract_room_ids(
    db: Session,
    contract_id: UUID
) -> set[UUID]:

    contract_rooms = (
        db.query(ContractRoom)
        .filter(ContractRoom.contract_id == contract_id)
        .all()
    )

    return {
        cast(UUID, contract_room.room_id)
        for contract_room in contract_rooms
    }


def check_overlapping_reservations(
    db: Session,
    room_ids: list[UUID],
    start_date: date,
    end_date: date,
    exclude_reservation_id: UUID | None = None
) -> bool:
    if not room_ids:
        return False

    # Only statuses that consume room availability are considered overlaps.
    query = (
        db.query(Reservation)
        .filter(
            ReservationRoom.reservation_id == Reservation.id,
            ReservationRoom.room_id.in_(room_ids),
            Reservation.status.in_(BLOCKING_STATUSES),
            Reservation.start_date < end_date,
            Reservation.end_date > start_date
        )
    )

    if exclude_reservation_id:
        query = query.filter(Reservation.id != exclude_reservation_id)

    return query.first() is not None


def get_contract_by_id(
    db: Session,
    contract_id: UUID
) -> Contract | None:

    return (
        db.query(Contract)
        .options(
            joinedload(Contract.contract_rooms),
            joinedload(Contract.rooms)
        )
        .filter(Contract.id == contract_id)
        .first()
    )


# Get all room IDs associated with a reservation
def get_reservation_room_ids(
    db: Session,
    reservation_id: UUID
) -> list[UUID]:

    reservation_rooms = (
        db.query(ReservationRoom)
        .filter(ReservationRoom.reservation_id == reservation_id)
        .all()
    )

    return [cast(UUID, rr.room_id) for rr in reservation_rooms]


# Check if rooms are occupied by other active reservations
def are_rooms_occupied_by_others(
    db: Session,
    room_ids: list[UUID],
    exclude_reservation_id: UUID | None = None
) -> bool:
    if not room_ids:
        return False

    query = (
        db.query(Reservation)
        .join(ReservationRoom)
        .filter(
            ReservationRoom.room_id.in_(room_ids),
            Reservation.status.in_(BLOCKING_STATUSES)
        )
    )

    if exclude_reservation_id:
        query = query.filter(Reservation.id != exclude_reservation_id)

    return query.first() is not None


# End file:

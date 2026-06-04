# File path: backend/app/reservations/reservation_repository.py

# Start file: 

from datetime import date
from typing import cast
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from .reservation_model import Reservation, ReservationRoom, RoomAssignment, ReservationStatusEnum


# Statuses eligible for billing/invoicing
BILLABLE_STATUSES = {
    ReservationStatusEnum.CONFIRMED,
    ReservationStatusEnum.CHECKED_IN,
    ReservationStatusEnum.COMPLETED
}


from app.contracts.contract_model import Contract, ContractRoom
from app.rooms.room_model import Room

from app.reservations.reservation_model import BLOCKING_STATUSES

from app.guests.guest_model import Guest, ReservationGuest


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
            joinedload(Reservation.rooms),
            joinedload(Reservation.reservation_guests).joinedload(ReservationGuest.guest),
            joinedload(Reservation.guests)
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
            joinedload(Reservation.rooms),
            joinedload(Reservation.reservation_guests).joinedload(ReservationGuest.guest),
            joinedload(Reservation.guests)
        )
        .all()
    )


# Retrieve active reservations
def get_active_reservations(db: Session):

    return (
        db.query(Reservation)
        .filter(Reservation.status.in_(BLOCKING_STATUSES))
        .options(
            joinedload(Reservation.company),
            joinedload(Reservation.contract),
            joinedload(Reservation.reservation_rooms).joinedload(ReservationRoom.room),
            joinedload(Reservation.rooms),
            joinedload(Reservation.reservation_guests).joinedload(ReservationGuest.guest),
            joinedload(Reservation.guests)
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
            joinedload(Reservation.rooms),
            joinedload(Reservation.reservation_guests).joinedload(ReservationGuest.guest),
            joinedload(Reservation.guests)
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

def get_reservation_guests(
    db: Session,
    reservation_id: UUID
):
    return (
        db.query(Guest)
        .join(
            ReservationGuest,
            ReservationGuest.guest_id == Guest.id
        )
        .filter(
            ReservationGuest.reservation_id == reservation_id
        )
        .all()
    )

def get_guest_by_id(
    db: Session,
    guest_id: UUID
):
    return (
        db.query(Guest)
        .filter(Guest.id == guest_id)
        .first()
    )

def assign_guests_to_reservation(
    db: Session,
    reservation_id: UUID,
    guest_ids: list[UUID]
) -> list[ReservationGuest]:
    assignments = []

    for guest_id in guest_ids:
        assignment = ReservationGuest(
            reservation_id=reservation_id,
            guest_id=guest_id
        )

        db.add(assignment)
        assignments.append(assignment)

    db.commit()

    # Refresh to load relationships
    for assignment in assignments:
        db.refresh(assignment)

    return assignments

def reservation_guest_exists(
    db: Session,
    reservation_id: UUID,
    guest_id: UUID
):
    return (
        db.query(ReservationGuest)
        .filter(
            ReservationGuest.reservation_id == reservation_id,
            ReservationGuest.guest_id == guest_id
        )
        .first()
    )

def remove_guest_from_reservation(
    db: Session,
    reservation_id: UUID,
    guest_id: UUID
):
    assignment = (
        db.query(ReservationGuest)
        .filter(
            ReservationGuest.reservation_id == reservation_id,
            ReservationGuest.guest_id == guest_id
        )
        .first()
    )

    if assignment:
        db.delete(assignment)
        db.commit()

    return assignment


def count_reservation_guests(
    db: Session,
    reservation_id: UUID
) -> int:
    return (
        db.query(ReservationGuest)
        .filter(ReservationGuest.reservation_id == reservation_id)
        .count()
    )


# =========================================================
# ROOM ASSIGNMENT REPOSITORY FUNCTIONS
# =========================================================

def create_room_assignment(
    db: Session,
    reservation_id: UUID,
    room_id: UUID,
    guest_id: UUID,
    assigned_by: UUID | None = None
) -> dict:
    assignment = RoomAssignment(
        reservation_id=reservation_id,
        room_id=room_id,
        guest_id=guest_id,
        assigned_by=assigned_by
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    # Eager-load the room and guest relationships for the response
    db.refresh(
        assignment,
        ["room", "guest"]
    )

    # Build response dict with computed fields for Pydantic serialization
    return {
        "id": assignment.id,
        "reservation_id": assignment.reservation_id,
        "room_id": assignment.room_id,
        "room_number": assignment.room.room_number,
        "guest_id": assignment.guest_id,
        "guest_name": f"{assignment.guest.first_name} {assignment.guest.last_name}",
        "assigned_by": assignment.assigned_by,
        "assignment_date": assignment.assignment_date
    }


def get_reservation_room_assignments(
    db: Session,
    reservation_id: UUID
) -> list[dict]:
    assignments = (
        db.query(RoomAssignment)
        .options(
            joinedload(RoomAssignment.room),
            joinedload(RoomAssignment.guest)
        )
        .filter(RoomAssignment.reservation_id == reservation_id)
        .all()
    )

    # Convert ORM objects to dicts with computed fields
    return [
        {
            "id": assignment.id,
            "reservation_id": assignment.reservation_id,
            "room_id": assignment.room_id,
            "room_number": assignment.room.room_number,
            "guest_id": assignment.guest_id,
            "guest_name": f"{assignment.guest.first_name} {assignment.guest.last_name}",
            "assigned_by": assignment.assigned_by,
            "assignment_date": assignment.assignment_date
        }
        for assignment in assignments
    ]


def get_guest_room_assignment(
    db: Session,
    reservation_id: UUID,
    guest_id: UUID
) -> RoomAssignment | None:
    return (
        db.query(RoomAssignment)
        .filter(
            RoomAssignment.reservation_id == reservation_id,
            RoomAssignment.guest_id == guest_id
        )
        .first()
    )


def get_room_assignment_count_by_room(
    db: Session,
    room_id: UUID
) -> int:
    return (
        db.query(RoomAssignment)
        .filter(RoomAssignment.room_id == room_id)
        .count()
    )


def delete_room_assignment(
    db: Session,
    reservation_id: UUID,
    guest_id: UUID
) -> RoomAssignment | None:
    assignment = (
        db.query(RoomAssignment)
        .filter(
            RoomAssignment.reservation_id == reservation_id,
            RoomAssignment.guest_id == guest_id
        )
        .first()
    )

    if assignment:
        db.delete(assignment)
        db.commit()

    return assignment


def get_room_by_id(
    db: Session,
    room_id: UUID
) -> Room | None:
    return (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )


# =========================================================
# INVOICE TRACKING REPOSITORY FUNCTIONS
# =========================================================

def get_uninvoiced_reservations(
    db: Session,
    company_id: UUID | None = None,
    contract_id: UUID | None = None
) -> list[Reservation]:
    """
    Retrieve reservations that are eligible for billing but have not been invoiced.

    Returns reservations where:
    - invoice_id IS NULL (not yet invoiced)
    - status is in BILLABLE_STATUSES (eligible for billing)

    Args:
        db: Database session
        company_id: Optional filter by company
        contract_id: Optional filter by contract

    Returns:
        List of uninvoiced reservations
    """
    query = (
        db.query(Reservation)
        .filter(
            Reservation.invoice_id.is_(None),
            Reservation.status.in_(BILLABLE_STATUSES)
        )
        .options(
            joinedload(Reservation.company),
            joinedload(Reservation.contract),
            joinedload(Reservation.reservation_rooms).joinedload(ReservationRoom.room),
            joinedload(Reservation.rooms),
            joinedload(Reservation.reservation_guests).joinedload(ReservationGuest.guest),
            joinedload(Reservation.guests)
        )
    )

    if company_id is not None:
        query = query.filter(Reservation.company_id == company_id)

    if contract_id is not None:
        query = query.filter(Reservation.contract_id == contract_id)

    return query.all()


def get_uninvoiced_reservations_by_period(
    db: Session,
    company_id: UUID,
    period_start: date,
    period_end: date
) -> list[Reservation]:
    """
    Retrieve uninvoiced reservations within a specific billing period.

    Returns reservations where:
    - belong to the provided company
    - invoice_id IS NULL (not yet invoiced)
    - status is in BILLABLE_STATUSES (eligible for billing)
    - start_date >= period_start (reservation starts on or after period start)
    - end_date <= period_end (reservation ends on or before period end)

    This ensures only reservations that fall completely inside the billing period
    are returned, preventing partial period invoices.

    Args:
        db: Database session
        company_id: The company to filter by
        period_start: Start date of the billing period
        period_end: End date of the billing period

    Returns:
        List of uninvoiced reservations within the billing period
    """
    query = (
        db.query(Reservation)
        .filter(
            Reservation.company_id == company_id,
            Reservation.invoice_id.is_(None),
            Reservation.status.in_(BILLABLE_STATUSES),
            Reservation.start_date >= period_start,
            Reservation.end_date <= period_end
        )
        .options(
            joinedload(Reservation.company),
            joinedload(Reservation.contract),
            joinedload(Reservation.reservation_rooms).joinedload(ReservationRoom.room),
            joinedload(Reservation.rooms),
            joinedload(Reservation.reservation_guests).joinedload(ReservationGuest.guest),
            joinedload(Reservation.guests)
        )
    )

    return query.all()

# Associate invoice with reservations
def assign_invoice_to_reservations(
    db: Session,
    reservation_ids: list[UUID],
    invoice_id: UUID
) -> None:

    (
        db.query(Reservation)
        .filter(
            Reservation.id.in_(reservation_ids)
        )
        .update(
            {
                "invoice_id": invoice_id
            },
            synchronize_session=False
        )
    )

    db.commit()

# End file:

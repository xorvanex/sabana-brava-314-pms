# File path: backend/app/reservations/reservation_repository.py

"""
Reservation database operations module.

This module provides database operations for reservation management,
including queries for availability checking, date overlap detection,
and room assignment tracking.
"""

from datetime import date
from typing import cast
from uuid import UUID

from sqlalchemy.orm import Session, joinedload

from app.contracts.contract_model import Contract, ContractRoom
from app.guests.guest_model import Guest, ReservationGuest
from app.rooms.room_model import Room
from app.reservations.reservation_model import (
    Reservation,
    ReservationRoom,
    RoomAssignment,
    ReservationStatusEnum,
    BLOCKING_STATUSES
)


# =============================================================================
# Create Operations
# =============================================================================

def create_reservation(
    db: Session,
    reservation_data: dict,
    room_ids: list[UUID] | None = None
) -> Reservation:
    """Create a new reservation record."""
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


def assign_guests_to_reservation(
    db: Session,
    reservation_id: UUID,
    guest_ids: list[UUID]
) -> list[ReservationGuest]:
    """Assign guests to a reservation."""
    assignments = []

    for guest_id in guest_ids:
        assignment = ReservationGuest(
            reservation_id=reservation_id,
            guest_id=guest_id
        )

        db.add(assignment)
        assignments.append(assignment)

    db.commit()

    for assignment in assignments:
        db.refresh(assignment)

    return assignments


# =============================================================================
# Read Operations
# =============================================================================

def get_reservation_by_id(
    db: Session,
    reservation_id: UUID
) -> Reservation | None:
    """Retrieve reservation by ID with all relationships."""
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


def get_all_reservations(db: Session):
    """Retrieve all reservations."""
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


def get_active_reservations(db: Session):
    """Retrieve active reservations (PENDING or CONFIRMED status)."""
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


def get_company_reservations(
    db: Session,
    company_id: UUID
):
    """Retrieve reservations by company."""
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


def get_contract_by_id(
    db: Session,
    contract_id: UUID
) -> Contract | None:
    """Retrieve contract by ID."""
    return (
        db.query(Contract)
        .options(
            joinedload(Contract.contract_rooms),
            joinedload(Contract.rooms)
        )
        .filter(Contract.id == contract_id)
        .first()
    )


def get_reservation_guests(
    db: Session,
    reservation_id: UUID
):
    """Retrieve all guests assigned to a reservation."""
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
    """Retrieve guest by ID."""
    return (
        db.query(Guest)
        .filter(Guest.id == guest_id)
        .first()
    )


def get_room_by_id(
    db: Session,
    room_id: UUID
) -> Room | None:
    """Retrieve room by ID."""
    return (
        db.query(Room)
        .filter(Room.id == room_id)
        .first()
    )


# =============================================================================
# Update Operations
# =============================================================================

def update_reservation(
    db: Session,
    reservation_id: UUID,
    reservation_data: dict,
    room_ids: list[UUID] | None = None
) -> Reservation | None:
    """Update an existing reservation."""
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


# =============================================================================
# Delete Operations
# =============================================================================

def remove_guest_from_reservation(
    db: Session,
    reservation_id: UUID,
    guest_id: UUID
):
    """Remove a guest from a reservation."""
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


# =============================================================================
# Utility Queries
# =============================================================================

def get_rooms_by_ids(
    db: Session,
    room_ids: list[UUID]
) -> list[Room]:
    """Retrieve multiple rooms by their IDs."""
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
    """Get all room IDs associated with a contract."""
    contract_rooms = (
        db.query(ContractRoom)
        .filter(ContractRoom.contract_id == contract_id)
        .all()
    )

    return {
        cast(UUID, contract_room.room_id)
        for contract_room in contract_rooms
    }


def get_reservation_room_ids(
    db: Session,
    reservation_id: UUID
) -> list[UUID]:
    """Get all room IDs associated with a reservation."""
    reservation_rooms = (
        db.query(ReservationRoom)
        .filter(ReservationRoom.reservation_id == reservation_id)
        .all()
    )

    return [cast(UUID, rr.room_id) for rr in reservation_rooms]


def reservation_guest_exists(
    db: Session,
    reservation_id: UUID,
    guest_id: UUID
):
    """Check if a guest is already assigned to a reservation."""
    return (
        db.query(ReservationGuest)
        .filter(
            ReservationGuest.reservation_id == reservation_id,
            ReservationGuest.guest_id == guest_id
        )
        .first()
    )


def count_reservation_guests(
    db: Session,
    reservation_id: UUID
) -> int:
    """Count guests assigned to a reservation."""
    return (
        db.query(ReservationGuest)
        .filter(ReservationGuest.reservation_id == reservation_id)
        .count()
    )


# =============================================================================
# Availability and Date Overlap Queries (PROTECTED BUSINESS LOGIC)
# =============================================================================

def check_overlapping_reservations(
    db: Session,
    room_ids: list[UUID],
    start_date: date,
    end_date: date,
    exclude_reservation_id: UUID | None = None
) -> bool:
    """
    Check if any rooms have overlapping reservations during the requested period.
    
    Only statuses that consume room availability (BLOCKING_STATUSES) are considered overlaps.
    """
    if not room_ids:
        return False

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


def are_rooms_occupied_by_others(
    db: Session,
    room_ids: list[UUID],
    exclude_reservation_id: UUID | None = None
) -> bool:
    """Check if rooms are occupied by other active reservations."""
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


# =============================================================================
# Room Assignment Operations
# =============================================================================

def create_room_assignment(
    db: Session,
    reservation_id: UUID,
    room_id: UUID,
    guest_id: UUID,
    assigned_by: UUID | None = None
) -> dict:
    """Create a room assignment (assign a guest to a room)."""
    assignment = RoomAssignment(
        reservation_id=reservation_id,
        room_id=room_id,
        guest_id=guest_id,
        assigned_by=assigned_by
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)

    db.refresh(
        assignment,
        ["room", "guest"]
    )

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
    """Get all room assignments for a reservation."""
    assignments = (
        db.query(RoomAssignment)
        .options(
            joinedload(RoomAssignment.room),
            joinedload(RoomAssignment.guest)
        )
        .filter(RoomAssignment.reservation_id == reservation_id)
        .all()
    )

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
    """Get a guest's room assignment for a reservation."""
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
    """Count assignments for a specific room."""
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
    """Delete a room assignment."""
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


# =============================================================================
# Invoice Tracking Operations
# =============================================================================

# Statuses eligible for billing/invoicing
BILLABLE_STATUSES = {
    ReservationStatusEnum.CONFIRMED,
    ReservationStatusEnum.CHECKED_IN,
    ReservationStatusEnum.COMPLETED
}


def get_uninvoiced_reservations(
    db: Session,
    company_id: UUID | None = None,
    contract_id: UUID | None = None
) -> list[Reservation]:
    """
    Retrieve reservations eligible for billing but not yet invoiced.
    
    Returns reservations where:
    - invoice_id IS NULL (not yet invoiced)
    - status is in BILLABLE_STATUSES (eligible for billing)
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


def assign_invoice_to_reservations(
    db: Session,
    reservation_ids: list[UUID],
    invoice_id: UUID
) -> None:
    """Associate an invoice with multiple reservations."""
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

    db.flush()

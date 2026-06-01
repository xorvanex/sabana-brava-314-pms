# File path: backend/app/guests/guest_repository.py

# Start file:

from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from .guest_model import Guest


# =========================================================
# CREATE
# =========================================================

def create_guest(
    db: Session,
    guest_data: dict
):
    guest = Guest(**guest_data)

    db.add(guest)
    db.commit()
    db.refresh(guest)

    return guest


# =========================================================
# READ BY ID
# =========================================================

def get_guest_by_id(
    db: Session,
    guest_id: UUID
):
    return (
        db.query(Guest)
        .options(
            joinedload(Guest.company)
        )
        .filter(Guest.id == guest_id)
        .first()
    )


# =========================================================
# READ BY DOCUMENT
# =========================================================

def get_guest_by_document(
    db: Session,
    document_number: str
):
    return (
        db.query(Guest)
        .filter(
            Guest.document_number == document_number
        )
        .first()
    )


# =========================================================
# READ ALL
# =========================================================

def get_all_guests(
    db: Session
):
    return (
        db.query(Guest)
        .options(
            joinedload(Guest.company)
        )
        .order_by(
            Guest.first_name.asc(),
            Guest.last_name.asc()
        )
        .all()
    )


# =========================================================
# READ COMPANY GUESTS
# =========================================================

def get_company_guests(
    db: Session,
    company_id: UUID
):
    return (
        db.query(Guest)
        .options(
            joinedload(Guest.company)
        )
        .filter(
            Guest.company_id == company_id
        )
        .order_by(
            Guest.first_name.asc(),
            Guest.last_name.asc()
        )
        .all()
    )


# =========================================================
# UPDATE
# =========================================================

def update_guest(
    db: Session,
    guest_id: UUID,
    update_data: dict
):
    guest = get_guest_by_id(
        db,
        guest_id
    )

    if guest is None:
        return None

    for field, value in update_data.items():
        setattr(
            guest,
            field,
            value
        )

    db.commit()
    db.refresh(guest)

    return guest


# =========================================================
# DELETE
# =========================================================

def delete_guest(
    db: Session,
    guest_id: UUID
):
    guest = get_guest_by_id(
        db,
        guest_id
    )

    if guest is None:
        return None

    db.delete(guest)
    db.commit()

    return guest

# End file:
# File path: backend/app/reservations/reservation_scheme.py

# Start file:

from uuid import UUID
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.companies.company_scheme import CompanyBasicResponse
from app.reservations.reservation_model import ReservationStatusEnum


# Schema for reservation creation
class ReservationCreate(BaseModel):

    company_id: UUID
    contract_id: UUID

    start_date: date
    end_date: date

    guest_count: int = Field(..., gt=0)
    status: ReservationStatusEnum = ReservationStatusEnum.PENDING
    notes: Optional[str] = Field(None, max_length=5000)
    created_by: UUID

    room_ids: list[UUID] = Field(default_factory=list)


# Schema for reservation updates
class ReservationUpdate(BaseModel):

    start_date: Optional[date] = None
    end_date: Optional[date] = None

    # Agrega "default=" explícitamente aquí
    guest_count: Optional[int] = Field(default=None, gt=0)
    status: Optional[ReservationStatusEnum] = None
    # Agrega "default=" explícitamente aquí
    notes: Optional[str] = Field(default=None, max_length=5000)

    room_ids: Optional[list[UUID]] = None


class ReservationContractResponse(BaseModel):

    id: UUID
    contract_number: str
    start_date: date
    end_date: date
    is_active: bool

    class Config:
        from_attributes = True


class ReservationRoomResponse(BaseModel):

    id: UUID
    room_number: str
    description: Optional[str]
    capacity: int
    status: str
    is_active: bool

    class Config:
        from_attributes = True


# =========================================================
# SCHEMAS: Reservation Guest Assignment
# =========================================================

class ReservationGuestAssign(BaseModel):
    guest_ids: list[UUID] = Field(default_factory=list)


class ReservationGuestResponse(BaseModel):
    id: UUID

    first_name: str
    last_name: str

    document_type: str
    document_number: str

    gender: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True

# Schema for reservation API responses
class ReservationResponse(BaseModel):

    id: UUID

    company: CompanyBasicResponse

    contract: ReservationContractResponse

    start_date: date
    end_date: date

    guest_count: int
    status: ReservationStatusEnum
    notes: Optional[str]
    created_by: UUID
    invoice_id: Optional[UUID] = None

    rooms: list[ReservationRoomResponse] = Field(default_factory=list)

    guests: list[ReservationGuestResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


# =========================================================
# SCHEMAS: Room Assignment
# =========================================================

class RoomAssignmentCreate(BaseModel):
    guest_id: UUID
    room_id: UUID


class RoomAssignmentResponse(BaseModel):
    id: UUID
    reservation_id: UUID
    room_id: UUID
    room_number: str
    guest_id: UUID
    guest_name: str
    assigned_by: Optional[UUID] = None
    assignment_date: Optional[datetime] = None

    class Config:
        from_attributes = True


# End file:

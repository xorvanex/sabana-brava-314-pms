# File path: backend/app/reservations/reservation_scheme.py

"""
Reservation schema definitions module.

This module provides Pydantic schemas for reservation data validation
and API responses.
"""

from uuid import UUID
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.companies.company_scheme import CompanyBasicResponse
from app.reservations.reservation_model import ReservationStatusEnum


# =============================================================================
# Create Schemas
# =============================================================================

class ReservationCreate(BaseModel):
    """Schema for creating a new reservation."""
    company_id: UUID
    contract_id: UUID

    start_date: date
    end_date: date

    guest_count: int = Field(..., gt=0)
    status: ReservationStatusEnum = ReservationStatusEnum.PENDING
    notes: Optional[str] = Field(None, max_length=5000)
    created_by: UUID

    room_ids: list[UUID] = Field(default_factory=list)


# =============================================================================
# Update Schemas
# =============================================================================

class ReservationUpdate(BaseModel):
    """Schema for updating an existing reservation."""
    start_date: Optional[date] = None
    end_date: Optional[date] = None

    guest_count: Optional[int] = Field(default=None, gt=0)
    status: Optional[ReservationStatusEnum] = None
    notes: Optional[str] = Field(default=None, max_length=5000)

    room_ids: Optional[list[UUID]] = None


# =============================================================================
# Response Schemas
# =============================================================================

class ReservationContractResponse(BaseModel):
    """Contract information in reservation responses."""
    id: UUID
    contract_number: str
    start_date: date
    end_date: date
    is_active: bool

    class Config:
        from_attributes = True


class ReservationRoomResponse(BaseModel):
    """Room information in reservation responses."""
    id: UUID
    room_number: str
    description: Optional[str]
    capacity: int
    status: str
    is_active: bool

    class Config:
        from_attributes = True


class ReservationGuestResponse(BaseModel):
    """Guest information in reservation responses."""
    id: UUID

    first_name: str
    last_name: str

    document_type: str
    document_number: str

    gender: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class ReservationResponse(BaseModel):
    """Full reservation response schema."""
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


# =============================================================================
# Utility Schemas
# =============================================================================

class ReservationGuestAssign(BaseModel):
    """Schema for assigning guests to a reservation."""
    guest_ids: list[UUID] = Field(default_factory=list)


class RoomAssignmentCreate(BaseModel):
    """Schema for creating a room assignment."""
    guest_id: UUID
    room_id: UUID


class RoomAssignmentResponse(BaseModel):
    """Schema for room assignment responses."""
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

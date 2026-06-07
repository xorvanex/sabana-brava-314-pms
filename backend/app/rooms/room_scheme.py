# File path: backend/app/rooms/room_scheme.py

"""
Room schema definitions module.

This module provides Pydantic schemas for room data validation
and API responses.
"""

import uuid

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from .room_model import RoomStatusEnum


# Base schema with common room fields
class RoomBase(BaseModel):
    room_number: str = Field(..., min_length=1, max_length=20)
    description: Optional[str] = Field(None, max_length=500)


# Schema for creating new rooms
class RoomCreate(RoomBase):
    status: RoomStatusEnum = RoomStatusEnum.AVAILABLE


# Schema for updating existing rooms
class RoomUpdate(BaseModel):
    room_number: Optional[str] = Field(None, min_length=1, max_length=20)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[RoomStatusEnum] = None
    is_active: Optional[bool] = None


# Schema for partial status updates
class RoomStatusUpdate(BaseModel):
    status: RoomStatusEnum


# Full response schema with audit timestamps
class RoomResponse(RoomBase):
    id: uuid.UUID
    capacity: int
    status: RoomStatusEnum
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

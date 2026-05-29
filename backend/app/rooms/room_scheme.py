# File path: backend/app/rooms/room_scheme.py


# Start file:

import uuid

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.rooms.room_model import RoomStatusEnum


# Base room schema
class RoomBase(BaseModel):
    room_number: str = Field(..., min_length=1, max_length=20)
    description: Optional[str] = Field(None, max_length=500)


# Schema for room creation
class RoomCreate(RoomBase):
    status: RoomStatusEnum = RoomStatusEnum.AVAILABLE


# Schema for room updates
class RoomUpdate(BaseModel):
    room_number: Optional[str] = Field(None, min_length=1, max_length=20)
    description: Optional[str] = Field(None, max_length=500)
    status: Optional[RoomStatusEnum] = None
    is_active: Optional[bool] = None


# Schema for room state updates
class RoomStatusUpdate(BaseModel):
    status: RoomStatusEnum


# Schema for API responses
class RoomResponse(RoomBase):
    id: uuid.UUID
    status: RoomStatusEnum
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# End file:
# File path: backend/app/rooms/room_scheme.py


# Start file:

import uuid

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from app.rooms.room_model import RoomStateEnum


# Base room schema
class RoomBase(BaseModel):
    numero: str = Field(..., min_length=1, max_length=20)
    descripcion: Optional[str] = Field(None, max_length=500)


# Schema for room creation
class RoomCreate(RoomBase):
    estado: RoomStateEnum = RoomStateEnum.AVAILABLE


# Schema for room updates
class RoomUpdate(BaseModel):
    numero: Optional[str] = Field(None, min_length=1, max_length=20)
    descripcion: Optional[str] = Field(None, max_length=500)
    estado: Optional[RoomStateEnum] = None
    is_active: Optional[bool] = None


# Schema for room state updates
class RoomStatusUpdate(BaseModel):
    estado: RoomStateEnum


# Schema for API responses
class RoomResponse(RoomBase):
    id: uuid.UUID
    estado: RoomStateEnum
    is_active: bool
    creado_en: datetime
    actualizado_en: datetime

    model_config = ConfigDict(from_attributes=True)

# End file:
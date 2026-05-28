# File path: backend/app/rooms/room_scheme.py

# Pydantic Schema Layer:
# - Defines request and response validation schemas
# - Validates room input data
# - Structures API responses
# - Handles room serialization

# Start file:

import uuid

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.rooms.room_model import RoomStateEnum


# Base room schema
class RoomBase(BaseModel):
    numero: str
    descripcion: Optional[str] = None


# Schema for room creation
class RoomCreate(RoomBase):
    estado: RoomStateEnum = RoomStateEnum.AVAILABLE


# Schema for room updates
class RoomUpdate(BaseModel):
    numero: Optional[str] = None
    descripcion: Optional[str] = None
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
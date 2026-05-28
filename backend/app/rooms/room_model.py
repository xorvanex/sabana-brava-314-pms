# File path: bakend/app/rooms/room_model.py

# ORM Model Layer:
# -
# -
# -
# -

# Start file:

import uuid
import enum

from datetime import datetime

from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum
from sqlalchemy.types import Uuid

from app.database.base import Base

# Room state enumeration
class RoomStateEnum(str, enum.Enum):
    AVAILABLE = "DISPONIBLE"
    OCUPIED = "OCUPADA"
    LOCKED = "BLOQUEADA"
    IN_MAINTENANCE = "EN MANTENIMIENTO"
    OUT_SERVICE = "FUERA DE SERVICIO"

# Rooms ORM model definition
class Room(Base):
    __tablename__ = "habitaciones"
    
    # Primary key UUID
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Room number identifier
    numero = Column(String(20), unique=True, nullable=False, index=True)
    
    # Room Description
    descripcion = Column(String, nullable=True)
    
    # Current Room state
    estado = Column(
        Enum(RoomStateEnum, name="estado_habitacion_enum", create_type=False),
        nullable=False,
        default=RoomStateEnum.AVAILABLE
    )
    
    # Timestam fields
    creado_en = Column(DateTime, default=datetime.utcnow, nullable=False)
    actualizado_en = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Room Status Flag
    is_active = Column(Boolean, default=True, nullable=False)
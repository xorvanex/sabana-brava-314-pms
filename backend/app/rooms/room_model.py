# File path: bakend/app/rooms/room_model.py

# ORM Model Layer:
# -
# -
# -
# -

# Start file:

import uuid
import enum
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Enum
from sqlalchemy.types import Uuid
from datetime import datetime
from app.database.base import Base

class RoomStateEnum(str, enum.Enum):
    AVAILABLE = "DISPONIBLE"
    OCUPIED = "OCUPADA"
    LOCKED = "BLOQUEADA"
    IN_MAINTANCE = "EN MANTENIMIENTO"
    OUT_SERVICE = "FUERA DE SERVICIO"

# Rooms ORM model definition
class room(Base):
    __tablename__ = "habitaciones"
    
    # Primary key UUID
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    
    # Room number 
    numero = Column(String(20), unique=True, nullable=False, index=True)
    
    # Room Description
    descripcion = Column(String, nullable=True)
    
    # Room state
    estado = Column(Enum(RoomStateEnum, name="Room_State_Enum", create_type=False, nullable=False))
    
    # Timestam fields
    creado_en = Column(DateTime, default=datetime.utcnow, nullable=True)
    actualizado_en = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    
    # Room Status Flag
    is_active = Column(Boolean, default=True)
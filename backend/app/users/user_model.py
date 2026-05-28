# File path: backend/app/users/user_model.py

# ORM Model Layer:
# - Defines database entities
# - Maps ORM models to tables
# - Configures database columns
# - Handles entity structure

# Start file:

import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.types import Uuid
from datetime import datetime
from app.database.base import Base


# User role enumeration (strict DB constraint values)
class UserRoleEnum(str, enum.Enum):
    OWNER = "PROPIETARIO"
    ADMINISTRATOR = "ADMINISTRADOR"
    RECEPCIONIST = "RECEPCIONISTA"


# User ORM model definition
class User(Base):
    __tablename__ = "usuarios"

    # Primary key UUID
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    nombre = Column(String(120), nullable=False)

    # Unique email identifier
    email = Column(String(120), unique=True, nullable=False, index=True)
    telefono = Column(String(50), nullable=True)

    # Role constrained by Enum type
    rol = Column(Enum(UserRoleEnum, name="user_rol_enum", create_type=False), nullable=False)

    # Timestamp fields
    creado_en = Column(DateTime, default=datetime.utcnow, nullable=True)
    actualizado_en = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    # Hashed password storage
    password = Column(String(255), nullable=False)

    # Account status flag
    is_active = Column(Boolean, default=True)


# End file:
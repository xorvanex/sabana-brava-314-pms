# File path: backend/app/users/user_model.py


# Start file:

import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.types import Uuid
from datetime import datetime
from app.database.base import Base


# User role enumeration (strict DB constraint values)
class UserRoleEnum(str, enum.Enum):
    OWNER = "OWNER"
    ADMINISTRATOR = "ADMINISTRATOR"
    RECEPTIONIST = "RECEPTIONIST"


# User ORM model definition
class User(Base):
    __tablename__ = "users"

    # Primary key UUID
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    name = Column(String(100), nullable=False)

    # Unique email identifier
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)

    # Role constrained by Enum type
    role = Column(Enum(UserRoleEnum, name="user_rol_enum", create_type=False), nullable=False)

    # Timestamp fields
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    # Hashed password storage
    password_hash = Column(String(255), nullable=False)

    # Account status flag
    is_active = Column(Boolean, default=True)


# End file:
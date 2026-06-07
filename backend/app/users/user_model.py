# File path: backend/app/users/user_model.py

"""
User ORM model module.

This module defines the User model and associated enumerations
for user role management.
"""

import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.types import Uuid

from app.database.base import Base


# User role enumeration for access control
class UserRoleEnum(str, enum.Enum):
    OWNER = "OWNER"
    ADMINISTRATOR = "ADMINISTRATOR"
    RECEPTIONIST = "RECEPTIONIST"


class User(Base):
    __tablename__ = "users"

    # Primary key with UUID for security
    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)

    # Display name for user identification
    name = Column(String(100), nullable=False)

    # Unique email for authentication
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20), nullable=True)

    # Role-based access control
    role = Column(Enum(UserRoleEnum, name="user_rol_enum", create_type=False), nullable=False)

    # Audit timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    # Hashed password for authentication
    password_hash = Column(String(255), nullable=False)

    # Soft delete for business continuity
    is_active = Column(Boolean, default=True)

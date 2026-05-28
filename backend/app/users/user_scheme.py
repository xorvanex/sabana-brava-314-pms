# File path: backend/app/users/user_scheme.py

# Schema Validation Layer:
# - Defines Pydantic schemas
# - Validates request data
# - Structures API responses
# - Enforces data typing

# Start file:

from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional
from enum import Enum


# Role schema enumeration (API layer validation)
class UserRoleEnum(str, Enum):
    OWNER = "PROPIETARIO"
    ADMINISTRATOR = "ADMINISTRADOR"
    RECEPCIONIST = "RECEPCIONISTA"


# Schema for creating a receptionist user
class ReceptionistCreate(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    password: str = Field(..., min_length=6, description="Minimum 6 characters")


# Schema for user login request
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Schema for user API responses
class UserResponse(BaseModel):
    id: UUID
    nombre: str
    email: EmailStr
    telefono: Optional[str]
    rol: UserRoleEnum
    is_active: bool

    class Config:
        from_attributes = True


# End file:
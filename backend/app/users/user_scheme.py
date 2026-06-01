# File path: backend/app/users/user_scheme.py

# Start file:

from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import Optional

from app.users.user_model import UserRoleEnum


# Schema for creating a receptionist user
class ReceptionistCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password_hash: str = Field(..., min_length=6, description="Minimum 6 characters")


# Schema for user login request
class UserLogin(BaseModel):
    email: EmailStr
    password_hash: str


# Schema for updating the authenticated user's own profile
class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


# Schema for user API responses
class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    phone: Optional[str]
    role: UserRoleEnum
    is_active: bool

    class Config:
        from_attributes = True

# End file:

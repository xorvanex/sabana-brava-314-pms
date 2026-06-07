# File path: backend/app/users/user_scheme.py

"""
User schema definitions module.

This module provides Pydantic schemas for user data validation
and API responses.
"""

from uuid import UUID
from typing import Optional

from pydantic import BaseModel, EmailStr, Field

from .user_model import UserRoleEnum


# Schema for creating a new receptionist account
class ReceptionistCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password_hash: str = Field(..., min_length=6, description="Minimum 6 characters")


# Schema for user login credentials
class UserLogin(BaseModel):
    email: EmailStr
    password_hash: str


# Schema for updating user profile information
class UserProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)


# Full response schema with role and status
class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    phone: Optional[str]
    role: UserRoleEnum
    is_active: bool

    class Config:
        from_attributes = True

# File path: backend/app/companies/company_scheme.py

"""
Company schema definitions module.

This module provides Pydantic schemas for company data validation
and API responses.
"""

from uuid import UUID
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Schema for company creation with required business fields
class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)

    nit: str = Field(..., min_length=5, max_length=30)

    company_representative: str = Field(..., min_length=2, max_length=100)

    address: Optional[str] = Field(None, max_length=250)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=150)


# Schema for partial company updates
class CompanyUpdate(BaseModel):

    company_representative: Optional[str] = Field(None, max_length=150)

    address: Optional[str] = Field(None, max_length=250)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=150)

    is_active: Optional[bool] = None


# Minimal response for nested company data in other entities
class CompanyBasicResponse(BaseModel):
    id: UUID
    name: str
    nit: str
    company_representative: str

    class Config:
        from_attributes = True


# Full company response including status and contact details
class CompanyResponse(BaseModel):
    id: UUID

    name: str
    nit: str

    company_representative: str
    address: Optional[str]
    phone: Optional[str]
    email: Optional[EmailStr]

    is_active: bool

    class Config:
        from_attributes = True

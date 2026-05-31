# File path: backend/app/companies/company_scheme.py

# Start file:

from uuid import UUID
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Schema for company creation
class CompanyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=150)

    nit: str = Field(..., min_length=5, max_length=30)
    
    company_representative: str = Field(..., min_length=2, max_length=100)
    
    address: Optional[str] = Field(None, max_length=250)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=150)


# Schema for company updates
class CompanyUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=150)

    nit: Optional[str] = Field(None, min_length=5, max_length=30)
    
    company_representative: Optional[str ]= Field(None, max_length=150)
    
    addres: Optional[str] = Field(None, max_length=250)
    phone: Optional[str] = Field(None, max_length=20)
    email: Optional[EmailStr] = Field(None, max_length=150)

    is_active: Optional[bool] = None


# Schema for company API responses
# Basic response for company
class CompanyBasicResponse(BaseModel):
    id: UUID
    name: str
    nit: str
    company_representative: str
    
    class Config:
        from_attributes = True

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

# End file:

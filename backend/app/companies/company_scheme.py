# File path: backend/app/companies/company_scheme.py


# Start file:

from uuid import UUID
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Schema for company creation
class CompanyCreate(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=150)

    nit: str = Field(..., min_length=5, max_length=30)

    direccion: Optional[str] = Field(None, max_length=250)
    telefono: Optional[str] = Field(None, max_length=20)
    correo: Optional[EmailStr] = Field(None, max_length=150)


# Schema for company updates
class CompanyUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=150)

    nit: Optional[str] = Field(None, min_length=5, max_length=30)

    direccion: Optional[str] = Field(None, max_length=250)
    telefono: Optional[str] = Field(None, max_length=20)
    correo: Optional[EmailStr] = Field(None, max_length=150)

    activo: Optional[bool] = None


# Schema for company API responses
# Basic response for company
class CompanyBasicResponse(BaseModel):
    id: UUID
    nombre: str
    nit: str
    
    class Config:
        from_attributes = True

class CompanyResponse(BaseModel):
    id: UUID

    nombre: str
    nit: str

    direccion: Optional[str]
    telefono: Optional[str]
    correo: Optional[EmailStr]

    activo: bool

    class Config:
        from_attributes = True


# End file:
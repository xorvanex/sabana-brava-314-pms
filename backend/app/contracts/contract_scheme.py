# File path: backend/app/contracts/contract_scheme.py


# Start file:

from uuid import UUID
from datetime import date
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field

from app.companies.company_scheme import CompanyBasicResponse

# Schema for contract creation
class ContractCreate(BaseModel):

    empresa_id: UUID

    fecha_inicio: date
    fecha_fin: date

    tarifa_base: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)

    descripcion: Optional[str] = Field(None, max_length=5000)

    # Contract legal/business agreements
    terminos: str = Field(..., min_length=10, max_length=5000)


# Schema for contract updates
class ContractUpdate(BaseModel):

    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None

    tarifa_base: Optional[Decimal] = Field(None, gt=0, max_digits=12, decimal_places=2)

    descripcion: Optional[str] = Field(None, max_length=5000)
    terminos: Optional[str] = Field(None, min_length=10, max_length=5000)

    activo: Optional[bool] = None


# Schema for contract API responses
class ContractResponse(BaseModel):

    id: UUID
    
    # Nested company information
    # Improves frontend readability and UX
    company: CompanyBasicResponse

    fecha_inicio: date
    fecha_fin: date

    tarifa_base: Decimal

    descripcion: Optional[str]
    terminos: str

    activo: bool

    class Config:
        from_attributes = True


# End file:
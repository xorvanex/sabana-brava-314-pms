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

    company_id: UUID

    start_date: date
    end_date: date

    base_rate: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)

    description: Optional[str] = Field(None, max_length=5000)

    # Contract legal/business agreements
    terms: str = Field(..., min_length=10, max_length=5000)


# Schema for contract updates
class ContractUpdate(BaseModel):

    start_date: Optional[date] = None
    end_date: Optional[date] = None

    base_rate: Optional[Decimal] = Field(None, gt=0, max_digits=12, decimal_places=2)

    description: Optional[str] = Field(None, max_length=5000)
    terms: Optional[str] = Field(None, min_length=10, max_length=5000)

    is_active: Optional[bool] = None


# Schema for contract API responses
class ContractResponse(BaseModel):

    id: UUID
    
    contract_number: str

    # Nested company information
    # Improves frontend readability and UX
    company: CompanyBasicResponse

    start_date: date
    end_date: date

    base_rate: Decimal

    description: Optional[str]
    terms: str

    is_active: bool

    class Config:
        from_attributes = True


# End file:
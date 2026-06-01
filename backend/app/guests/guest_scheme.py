# File path: backend/app/guests/guest_scheme.py

# Start file:

from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field

from .guest_model import (
    GuestGenderEnum,
    DocumentTypeEnum
)   


# =========================================================
# SCHEMA: GuestCreate
# =========================================================

class GuestCreate(BaseModel):

    company_id: UUID

    first_name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    last_name: str = Field(
        ...,
        min_length=1,
        max_length=100
    )

    document_type: DocumentTypeEnum

    document_number: str = Field(
        ...,
        min_length=1,
        max_length=50
    )

    gender: GuestGenderEnum

    phone: Optional[str] = Field(
        None,
        max_length=20
    )


# =========================================================
# SCHEMA: GuestUpdate
# =========================================================

class GuestUpdate(BaseModel):

    first_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100
    )

    last_name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100
    )

    document_type: DocumentTypeEnum | None = None

    document_number: Optional[str] = Field(
        None,
        min_length=1,
        max_length=50
    )

    gender: GuestGenderEnum | None = None

    phone: Optional[str] = Field(
        None,
        max_length=20
    )


# =========================================================
# SCHEMA: GuestCompanyResponse
# =========================================================

class GuestCompanyResponse(BaseModel):

    id: UUID
    name: str

    class Config:
        from_attributes = True


# =========================================================
# SCHEMA: GuestResponse
# =========================================================

class GuestResponse(BaseModel):

    id: UUID

    company: GuestCompanyResponse

    first_name: str
    last_name: str

    document_type: DocumentTypeEnum
    document_number: str

    gender: GuestGenderEnum

    phone: Optional[str]

    class Config:
        from_attributes = True

# End file:
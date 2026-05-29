# File path: backend/app/companies/company_model.py


# Start file:

import uuid

from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


# Company ORM model definition
class Company(Base):
    __tablename__ = "empresas"

    # Primary key UUID
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # Company legal name
    nombre = Column(String(150), nullable=False)

    # Unique company tax identifier
    nit = Column(String(30), unique=True, nullable=False, index=True)

    # Company contact information
    direccion = Column(String(250), nullable=True)
    telefono = Column(String(20), nullable=True)
    correo = Column(String(150), nullable=True)

    # Company active/inactive status
    activo = Column(Boolean, default=True)

    # Audit timestamps
    creado_en = Column(DateTime, default=datetime.utcnow, nullable=True)

    actualizado_en = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=True
    )

    # One-to-many relationship:
    # A company can have multiple contracts associated
    contracts = relationship(
        "Contract",
        back_populates="company",
    )


# End file:
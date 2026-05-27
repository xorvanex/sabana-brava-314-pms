# ORM Model Layer:
# - Defines database entities
# - Maps ORM models to tables
# - Configures database columns
# - Handles entity structure

# Start file:

import uuid

from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    Text
)

from sqlalchemy.orm import relationship
from sqlalchemy.types import Uuid

from app.database.base import Base


# Contract ORM model definition
class Contract(Base):
    __tablename__ = "contratos"

    # Primary key UUID
    id = Column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )

    # Foreign key relationship:
    # Every contract must belong to one company
    empresa_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("empresas.id"),
        nullable=False
    )

    # Contract validity dates
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=False)

    # Base accommodation tariff
    tarifa_base = Column(
        Numeric(12, 2),
        nullable=False
    )

    # General contract description
    descripcion = Column(Text, nullable=True)

    # Contract negotiated terms:
    # Stores business agreements between hotel and company
    terminos = Column(Text, nullable=False)

    # Contract active/inactive status
    activo = Column(Boolean, default=True)

    # Audit timestamps
    creado_en = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=True
    )

    actualizado_en = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=True
    )

    # ORM relationship with Company model
    # Enables contract.company access
    company = relationship(
        "Company",
        back_populates="contracts",
        foreign_keys=[empresa_id]
    )


# End file:
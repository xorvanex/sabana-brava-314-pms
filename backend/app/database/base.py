# File path: backend/app/database/base.py

# Start file:

# Database Base Layer:
# - Defines SQLAlchemy declarative base
# - Serves as ORM model foundation
# - Centralizes database metadata

from sqlalchemy.orm import declarative_base


# SQLAlchemy declarative base for ORM models
Base = declarative_base()

# End file:

# File path: backend/app/database/base.py

"""
SQLAlchemy declarative base for ORM models.

This module provides the declarative base class that serves as the foundation
for all database models in the application.
"""

from sqlalchemy.orm import declarative_base

# Declarative base for all SQLAlchemy ORM models
Base = declarative_base()

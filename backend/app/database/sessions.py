# File path: backend/app/database/sessions.py

"""
Database session management module.

This module provides the session factory and dependency injection
for database operations.
"""

from sqlalchemy.orm import sessionmaker

from .connection import engine

# Session factory for database operations
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db():
    """Dependency that provides database session for request handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

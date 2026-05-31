# File path: backend/app/database/sessions.py

# Start file:

# Database Session Layer:
# - Creates database sessions
# - Manages session lifecycle
# - Provides dependency injection
# - Ensures session cleanup

from sqlalchemy.orm import sessionmaker
from .connection import engine


# Local database session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Dependency generator for database session lifecycle
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# End file:

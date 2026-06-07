# File path: backend/app/database/connection.py

"""
Database engine configuration module.

This module configures the SQLAlchemy database engine and handles
the PostgreSQL connection settings.
"""

import os

from dotenv import load_dotenv, find_dotenv
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool

load_dotenv(find_dotenv("SB314.env"))

DATABASE_URL = os.environ.get("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in SB314.env")

# Create engine with SSL required for PostgreSQL connections
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    connect_args={
        "sslmode": "require"
    }
)

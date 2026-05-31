# File path: backend/app/database/connection.py

# Start file:

# Database Connection Layer:
# - Configures database engine
# - Loads environment variables
# - Establishes PostgreSQL connection
# - Handles connection settings

from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv, find_dotenv
import os

# Load environment variables from SB314.env
load_dotenv(find_dotenv("SB314.env"))

# Read the full database connection string directly from .env
DATABASE_URL = os.environ.get("DATABASE_URL")

# Validate database configuration
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in SB314.env")

# SQLAlchemy engine initialization con NullPool
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,
    connect_args={
        "sslmode": "require"
    }
)

# End file:

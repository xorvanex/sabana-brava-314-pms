# File path: backend/app/database/connection.py

# Database Connection Layer:
# - Configures database engine
# - Loads environment variables
# - Establishes PostgreSQL connection
# - Handles connection settings

# Start file:

from sqlalchemy import create_engine
from dotenv import load_dotenv, find_dotenv
import os


# Load environment variables from SB314.env
load_dotenv(find_dotenv("SB314.env"))

# Database connection URL
DATABASE_URL = os.environ.get("DATABASE_URL")

# Validate database configuration
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in SB314.env")


# SQLAlchemy engine initialization
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    connect_args={
        "sslmode": "require"
    }
)


# End file:
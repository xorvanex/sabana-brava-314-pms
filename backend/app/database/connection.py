# File path: backend/app/database/connection.py

# Database Connection Layer:
# - Configures database engine
# - Loads environment variables
# - Establishes PostgreSQL connection
# - Handles connection settings

# Start file:

from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv, find_dotenv
import os

# Load environment variables from SB314.env
load_dotenv(find_dotenv("SB314.env"))

# Tomamos la cadena de conexión completa directamente del .env
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
# File path: backend/app/auth/jwt_handler.py

# Authentication Layer:
# - Generates JWT access tokens
# - Validates authentication tokens
# - Handles token expiration
# - Provides request authentication

# Start file:

from datetime import datetime, timedelta, timezone
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv, find_dotenv


# Load environment variables for authentication configuration
load_dotenv(find_dotenv("SB314.env"))

SECRET_KEY = os.getenv("SECRET_KEY_JWT", "")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY_JWT is not configured")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


# HTTP Bearer security scheme for Swagger and frontend authentication
security = HTTPBearer()


# Create JWT access token with expiration time
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# Validate and decode JWT token from request credentials
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# End file:
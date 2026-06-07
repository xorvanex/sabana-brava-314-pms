# File path: backend/app/auth/jwt_handler.py

"""
JWT token generation and verification module.

This module handles JWT access token creation, validation, and
authentication for API requests.
"""

import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv, find_dotenv
import jwt
from jwt.exceptions import InvalidTokenError, ExpiredSignatureError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

load_dotenv(find_dotenv("SB314.env"))

SECRET_KEY = os.getenv("SECRET_KEY_JWT", "")

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY_JWT is not configured")

# JWT configuration for token signing
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

security = HTTPBearer()


def create_access_token(data: dict) -> str:
    """Create JWT token with 24-hour expiration for authenticated requests."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Validate JWT token and extract payload for authorization decisions."""
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

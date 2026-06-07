# File path: backend/app/auth/hashing.py

"""
Password hashing and verification module.

This module provides bcrypt-based password hashing utilities for
secure credential storage and verification.
"""

from passlib.context import CryptContext

# Configure bcrypt for secure password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash plaintext password using bcrypt for secure storage."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against stored hash."""
    return pwd_context.verify(plain_password, hashed_password)

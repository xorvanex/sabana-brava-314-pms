# File path: backend/app/auth/hashing.py

# Security Layer:
# - Handles password hashing
# - Verifies encrypted passwords
# - Uses bcrypt hashing algorithm
# - Protects authentication credentials

# Start file:

from passlib.context import CryptContext


# Password hashing context configuration (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Hash a plain text password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


# Verify plain password against hashed password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# End file:
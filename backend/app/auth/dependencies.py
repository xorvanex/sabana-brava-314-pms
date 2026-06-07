# File path: backend/app/auth/dependencies.py

"""
Authentication and authorization dependency injection module.

This module provides FastAPI dependencies for role-based access control
and JWT token verification.
"""

from fastapi import Depends, HTTPException, status

from .jwt_handler import verify_token


# Restrict access to administrative users (OWNER or ADMINISTRATOR)
def require_admin_or_owner(payload: dict = Depends(verify_token)) -> dict:
    rol = payload.get("role")

    if rol not in ["OWNER", "ADMINISTRATOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action."
        )

    return payload


# Extend access to reception staff for read-only operations
def require_admin_owner_or_receptionist(payload: dict = Depends(verify_token)) -> dict:
    rol = payload.get("role")

    if rol not in ["OWNER", "ADMINISTRATOR", "RECEPTIONIST"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action."
        )

    return payload

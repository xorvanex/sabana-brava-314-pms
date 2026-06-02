# File path: backend/app/auth/dependencies.py

# Start file:

# Authorization Layer:
# - Handles role-based access control
# - Validates user permissions
# - Restricts protected endpoints
# - Uses JWT payload dependencies

from fastapi import Depends, HTTPException, status
from app.auth.jwt_handler import verify_token


# Authorization dependency: allows only ADMIN or OWNER roles
def require_admin_or_owner(payload: dict = Depends(verify_token)) -> dict:
    # Extract role from JWT payload
    rol = payload.get("role")

    # Validate role permissions
    if rol not in ["OWNER", "ADMINISTRATOR"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action."
        )

    return payload


# Authorization dependency: allows ADMIN, OWNER, or RECEPTIONIST roles
def require_admin_owner_or_receptionist(payload: dict = Depends(verify_token)) -> dict:
    # Extract role from JWT payload
    rol = payload.get("role")

    # Validate role permissions
    if rol not in ["OWNER", "ADMINISTRATOR", "RECEPTIONIST"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to perform this action."
        )

    return payload

# End file:

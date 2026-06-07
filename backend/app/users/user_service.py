# File path: backend/app/users/user_service.py

"""
User business logic module.

This module contains validation rules and business operations
related to user management.
"""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token

from . import user_repository, user_scheme


def create_receptionist(db: Session, user_in: user_scheme.ReceptionistCreate):
    """Create new receptionist account with email uniqueness check."""
    existing_user = user_repository.get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user_in.model_dump()
    user_data["password_hash"] = hash_password(user_data["password_hash"])
    user_data["role"] = user_scheme.UserRoleEnum.RECEPTIONIST

    return user_repository.create_user(db, user_data)


def get_all_receptionists(db: Session):
    """Retrieve all active receptionists for management."""
    return user_repository.get_users_by_role(db, user_scheme.UserRoleEnum.RECEPTIONIST.value)


def get_my_profile(db: Session, user_id: str):
    """Retrieve current user profile from JWT token."""
    user = user_repository.get_user_by_id(db, UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def update_my_profile(db: Session, user_id: str, profile_in: user_scheme.UserProfileUpdate):
    """Update authenticated user profile information."""
    user = user_repository.get_user_by_id(db, UUID(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = profile_in.model_dump(exclude_unset=True, exclude_none=True)

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    return user_repository.update_user(db, UUID(user_id), update_data)


def update_my_password(db: Session, user_id: str, old_password: str, new_password: str):
    """Update user password with current password verification."""
    user = user_repository.get_user_by_id(db, UUID(user_id))
    if not user or not verify_password(old_password, str(user.password_hash)):
        raise HTTPException(status_code=400, detail="Incorrect current password")

    user_data = {"password_hash": hash_password(new_password)}
    return user_repository.update_user(db, UUID(user_id), user_data)


def toggle_user_status(db: Session, user_id: UUID):
    """Toggle user active status for access control."""
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_status = not bool(user.is_active)
    return user_repository.update_user(db, user_id, {"is_active": new_status})


def authenticate_user(db: Session, email: str, password: str):
    """Authenticate user credentials and generate JWT token."""
    user = user_repository.get_user_by_email(db, email)

    if not user or not verify_password(password, str(user.password_hash)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not bool(user.is_active):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is deactivated"
        )

    token_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value
    }

    return {
        "access_token": create_access_token(token_payload),
        "token_type": "bearer",
        "user": {
            "name": user.name,
            "role": user.role.value
        }
    }

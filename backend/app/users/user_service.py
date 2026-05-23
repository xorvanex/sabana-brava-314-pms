
# File path: backend/app/users/user_service.py

# Service Layer:
# - Contains business rules
# - Validates domain logic
# - Calls repository for persistence
# - Never directly interacts with HTTP layer

# Start file:

from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.auth.hashing import hash_password, verify_password
from app.auth.jwt_handler import create_access_token

from . import user_repository, user_scheme


# Create receptionist user with hashed password
def create_receptionist(db: Session, user_in: user_scheme.ReceptionistCreate):
    existing_user = user_repository.get_user_by_email(db, user_in.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_data = user_in.model_dump()
    user_data["password"] = hash_password(user_data["password"])
    user_data["rol"] = user_scheme.UserRoleEnum.RECEPCIONISTA

    return user_repository.create_user(db, user_data)


# Retrieve all receptionist users
def get_all_receptionists(db: Session):
    return user_repository.get_users_by_role(db, user_scheme.UserRoleEnum.RECEPCIONISTA.value)


# Get authenticated user profile by ID
def get_my_profile(db: Session, user_id: str):
    user = user_repository.get_user_by_id(db, UUID(user_id))  
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# Update current user password after verification
def update_my_password(db: Session, user_id: str, old_password: str, new_password: str):
    user = user_repository.get_user_by_id(db, UUID(user_id))  
    if not user or not verify_password(old_password, str(user.password)):  
        raise HTTPException(status_code=400, detail="Incorrect current password")

    user_data = {"password": hash_password(new_password)}
    return user_repository.update_user(db, UUID(user_id), user_data)  


# Toggle user active status
def toggle_user_status(db: Session, user_id: UUID):
    user = user_repository.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_status = not bool(user.is_active) 
    return user_repository.update_user(db, user_id, {"is_active": new_status})


# Authenticate user and generate JWT token
def authenticate_user(db: Session, email: str, password: str):
    user = user_repository.get_user_by_email(db, email)

    if not user or not verify_password(password, str(user.password)):  
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
        "rol": user.rol.value
    }

    return {
        "access_token": create_access_token(token_payload),
        "token_type": "bearer",
        "usuario": {
            "nombre": user.nombre,
            "rol": user.rol.value
        }
    }


# End file:
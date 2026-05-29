# File path: backend/app/users/user_router.py


# Start file:

from fastapi import APIRouter, Depends, status, Form, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.database.sessions import get_db
from app.auth.jwt_handler import verify_token
from app.auth.dependencies import require_admin_or_owner

from . import user_scheme, user_service, user_repository


# Router definition for user-related endpoints
router = APIRouter(prefix="/users", tags=["Users"])


# User authentication endpoint (returns JWT token)
@router.post("/login")
def login(
    username: str = Form(..., description="User email"),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # Authenticate user credentials and return access token
    return user_service.authenticate_user(db, username, password)


# Register receptionist (admin/owner only)
@router.post(
    "/receptionist",
    response_model=user_scheme.UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register_receptionist(
    nombre: str = Form(...),
    email: str = Form(...),
    password: str = Form(..., min_length=6),
    telefono: str = Form(None),
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    # Build validated Pydantic schema from form data
    user_in = user_scheme.ReceptionistCreate(
        nombre=nombre,
        email=email,
        password=password,
        telefono=telefono
    )

    return user_service.create_receptionist(db, user_in)


# Get all receptionists (admin/owner only)
@router.get("/receptionists", response_model=List[user_scheme.UserResponse])
def get_receptionists(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    return user_service.get_all_receptionists(db)


# Get current authenticated user profile
@router.get("/me", response_model=user_scheme.UserResponse)
def get_me(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(verify_token)
):
    user_id = token_payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token: user not identified"
        )

    return user_service.get_my_profile(db, str(user_id))


# Update current user password
@router.put("/me/password")
def change_password(
    old_password: str = Form(...),
    new_password: str = Form(...),
    db: Session = Depends(get_db),
    token_payload: dict = Depends(verify_token)
):
    user_id = token_payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=401,
            detail="Invalid token: user not identified"
        )

    return user_service.update_my_password(db, str(user_id), old_password, new_password)


# Toggle user active/inactive status
@router.patch("/{user_id}/status")
def toggle_user_status(
    user_id: UUID,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    return user_service.toggle_user_status(db, user_id)


# Retrieve all users (admin/owner only)
@router.get("/", response_model=List[user_scheme.UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_admin_or_owner)
):
    return user_repository.get_all_users(db)


# End file:
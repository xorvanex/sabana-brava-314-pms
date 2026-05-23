# File path: backend/app/users/user_repository.py

# Repository Layer:
# - Handles database operations
# - Executes ORM queries
# - Manages entity persistence
# - Contains no business logic

# Start file:

from sqlalchemy.orm import Session
from uuid import UUID
from .user_model import User


# Retrieve user by email
def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


# Retrieve user by ID
def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


# Retrieve users filtered by role
def get_users_by_role(db: Session, rol: str):
    return db.query(User).filter(User.rol == rol).all()


# Retrieve all users
def get_all_users(db: Session):
    return db.query(User).all()


# Create a new user record
def create_user(db: Session, user_data: dict) -> User:
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# Update an existing user if found
def update_user(db: Session, user_id: UUID, user_data: dict) -> User | None:
    user = get_user_by_id(db, user_id)
    if user:
        for key, value in user_data.items():
            setattr(user, key, value)
        db.commit()
        db.refresh(user)
    return user


# End file:
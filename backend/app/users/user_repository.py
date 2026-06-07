# File path: backend/app/users/user_repository.py

"""
User database operations module.

This module provides database operations for user management.
"""

from uuid import UUID

from sqlalchemy.orm import Session

from .user_model import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: UUID) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def get_users_by_role(db: Session, role: str):
    return db.query(User).filter(User.role == role).all()


def get_all_users(db: Session):
    return db.query(User).all()


def create_user(db: Session, user_data: dict) -> User:
    new_user = User(**user_data)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def update_user(db: Session, user_id: UUID, user_data: dict) -> User | None:
    user = get_user_by_id(db, user_id)
    if user:
        for key, value in user_data.items():
            setattr(user, key, value)
        db.commit()
        db.refresh(user)
    return user

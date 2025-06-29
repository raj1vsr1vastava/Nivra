from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy.exc import IntegrityError
from passlib.context import CryptContext
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
import schemas
from database import get_db

router = APIRouter()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# User Management Endpoints
@router.get("/users/", response_model=List[schemas.User])
def get_users(
    skip: int = 0, 
    limit: int = 100,
    username: Optional[str] = None,
    email: Optional[str] = None,
    is_active: Optional[bool] = None,
    role_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    """
    Get all users with optional filtering.
    """
    query = db.query(models.User)
    
    if username:
        query = query.filter(models.User.username.ilike(f"%{username}%"))
    if email:
        query = query.filter(models.User.email.ilike(f"%{email}%"))
    if is_active is not None:
        query = query.filter(models.User.is_active == is_active)
    if role_id:
        query = query.filter(models.User.role_id == role_id)
    
    users = query.offset(skip).limit(limit).all()
    return users


@router.get("/users/{user_id}", response_model=schemas.User)
def get_user(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific user by ID.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"User with ID {user_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    return user


@router.post("/users/", response_model=schemas.User, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.
    """
    # Validate required fields first
    if not user.username or not user.email or not user.password or not user.full_name or not user.role_id:
        missing_fields = []
        if not user.username: missing_fields.append("username")
        if not user.email: missing_fields.append("email")
        if not user.password: missing_fields.append("password")
        if not user.full_name: missing_fields.append("full_name")
        if not user.role_id: missing_fields.append("role_id")
        
        error_detail = {
            "code": "VALIDATION_ERROR",
            "message": f"Missing required fields: {', '.join(missing_fields)}",
            "fields": missing_fields
        }
        
        raise HTTPException(
            status_code=400, 
            detail=error_detail
        )
    
    # Check if username already exists
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        error_detail = {
            "code": "DUPLICATE_USERNAME",
            "message": f"Username '{user.username}' is already registered",
            "field": "username"
        }
        
        raise HTTPException(
            status_code=400, 
            detail=error_detail
        )
    
    # Check if email already exists
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        error_detail = {
            "code": "DUPLICATE_EMAIL",
            "message": f"Email '{user.email}' is already registered",
            "field": "email"
        }
        
        raise HTTPException(
            status_code=400, 
            detail=error_detail
        )

    # Validate role_id exists
    db_role = db.query(models.Role).filter(models.Role.id == user.role_id).first()
    if not db_role:
        error_detail = {
            "code": "INVALID_ROLE",
            "message": f"Role ID '{user.role_id}' does not exist",
            "field": "role_id"
        }
        
        raise HTTPException(
            status_code=400, 
            detail=error_detail
        )
    
    # Hash the password
    hashed_password = pwd_context.hash(user.password)
    
    # Create user model
    db_user = models.User(
        username=user.username,
        password_hash=hashed_password,
        email=user.email,
        full_name=user.full_name,
        role_id=user.role_id,
        resident_id=user.resident_id,
        is_active=True
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        db.rollback()
        error_detail = {
            "code": "DATABASE_ERROR",
            "message": f"Database error: {str(e)}",
            "error_type": "integrity_error"
        }
        raise HTTPException(status_code=400, detail=error_detail)


@router.put("/users/{user_id}", response_model=schemas.User)
def update_user(
    user_id: UUID, 
    user_update: schemas.UserUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a user.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"User with ID {user_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    # Check for username or email conflicts if being updated
    if user_update.username and user_update.username != db_user.username:
        existing_user = db.query(models.User).filter(models.User.username == user_update.username).first()
        if existing_user:
            error_detail = {
                "code": "DUPLICATE_USERNAME",
                "message": f"Username '{user_update.username}' is already in use",
                "field": "username"
            }
            raise HTTPException(status_code=400, detail=error_detail)

    if user_update.email and user_update.email != db_user.email:
        existing_user = db.query(models.User).filter(models.User.email == user_update.email).first()
        if existing_user:
            error_detail = {
                "code": "DUPLICATE_EMAIL",
                "message": f"Email '{user_update.email}' is already in use",
                "field": "email"
            }
            raise HTTPException(status_code=400, detail=error_detail)
    
    # Update fields
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    try:
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError as e:
        db.rollback()
        error_detail = {
            "code": "DATABASE_ERROR",
            "message": f"Database error: {str(e)}",
            "error_type": "integrity_error"
        }
        raise HTTPException(status_code=400, detail=error_detail)


@router.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a user by setting is_active to False.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Soft delete - set is_active to False using setattr to work with SQLAlchemy column
    setattr(db_user, "is_active", False)
    db.commit()
    
    return None


@router.post("/users/{user_id}/reset-password", status_code=200)
def reset_user_password(
    user_id: UUID, 
    new_password: str, 
    db: Session = Depends(get_db)
):
    """
    Reset a user's password.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Hash the new password
    hashed_password = pwd_context.hash(new_password)
    setattr(db_user, "password_hash", hashed_password)
    
    db.commit()
    return {"message": "Password reset successful"}


@router.put("/users/{user_id}/toggle-active", response_model=schemas.User)
def toggle_user_active(
    user_id: UUID, 
    db: Session = Depends(get_db)
):
    """
    Toggle a user's active status.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle the active status
    # Get current value and toggle it
    current_active = db.query(models.User.is_active).filter(models.User.id == user_id).scalar()
    setattr(db_user, "is_active", not current_active)
    
    db.commit()
    db.refresh(db_user)
    return db_user


@router.put("/users/{user_id}/update-last-login", response_model=schemas.User)
def update_last_login(
    user_id: UUID, 
    db: Session = Depends(get_db)
):
    """
    Update the last_login timestamp for a user.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update last login time
    setattr(db_user, "last_login", datetime.utcnow())
    
    db.commit()
    db.refresh(db_user)
    return db_user

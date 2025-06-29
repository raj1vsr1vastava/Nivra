from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy.exc import IntegrityError

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
import schemas
from database import get_db

router = APIRouter()

# SocietyAdmin Management Endpoints
@router.get("/society-admins/", response_model=List[schemas.SocietyAdmin])
def get_society_admins(
    skip: int = 0, 
    limit: int = 100,
    user_id: Optional[UUID] = None,
    society_id: Optional[UUID] = None,
    is_primary_admin: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Get all society admins with optional filtering.
    """
    query = db.query(models.SocietyAdmin)
    
    if user_id:
        query = query.filter(models.SocietyAdmin.user_id == user_id)
    if society_id:
        query = query.filter(models.SocietyAdmin.society_id == society_id)
    if is_primary_admin is not None:
        query = query.filter(models.SocietyAdmin.is_primary_admin == is_primary_admin)
    
    society_admins = query.offset(skip).limit(limit).all()
    return society_admins


@router.get("/society-admins/{society_admin_id}", response_model=schemas.SocietyAdmin)
def get_society_admin(society_admin_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific society admin by ID.
    """
    society_admin = db.query(models.SocietyAdmin).filter(models.SocietyAdmin.id == society_admin_id).first()
    if society_admin is None:
        raise HTTPException(status_code=404, detail="Society admin record not found")
    return society_admin


@router.post("/society-admins/", response_model=schemas.SocietyAdmin, status_code=201)
def create_society_admin(society_admin: schemas.SocietyAdminCreate, db: Session = Depends(get_db)):
    """
    Create a new society admin record.
    """
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == society_admin.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if society exists
    society = db.query(models.Society).filter(models.Society.id == society_admin.society_id).first()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")
    
    # Check if mapping already exists
    existing = db.query(models.SocietyAdmin).filter(
        models.SocietyAdmin.user_id == society_admin.user_id,
        models.SocietyAdmin.society_id == society_admin.society_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already an admin for this society")
    
    # If this is a primary admin, update existing primary admins for this society
    if society_admin.is_primary_admin:
        existing_primary_admins = db.query(models.SocietyAdmin).filter(
            models.SocietyAdmin.society_id == society_admin.society_id,
            models.SocietyAdmin.is_primary_admin == True
        ).all()
        
        for admin in existing_primary_admins:
            setattr(admin, "is_primary_admin", False)
    
    # Create society admin model
    db_society_admin = models.SocietyAdmin(**society_admin.dict())
    
    try:
        db.add(db_society_admin)
        db.commit()
        db.refresh(db_society_admin)
        return db_society_admin
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.put("/society-admins/{society_admin_id}", response_model=schemas.SocietyAdmin)
def update_society_admin(
    society_admin_id: UUID, 
    society_admin_update: schemas.SocietyAdminUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a society admin record.
    """
    db_society_admin = db.query(models.SocietyAdmin).filter(models.SocietyAdmin.id == society_admin_id).first()
    if db_society_admin is None:
        raise HTTPException(status_code=404, detail="Society admin record not found")
    
    # If setting as primary admin, update other admins
    if society_admin_update.is_primary_admin and society_admin_update.is_primary_admin != db_society_admin.is_primary_admin:
        existing_primary_admins = db.query(models.SocietyAdmin).filter(
            models.SocietyAdmin.society_id == db_society_admin.society_id,
            models.SocietyAdmin.is_primary_admin == True,
            models.SocietyAdmin.id != society_admin_id
        ).all()
        
        for admin in existing_primary_admins:
            setattr(admin, "is_primary_admin", False)
    
    # Update fields
    update_data = society_admin_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_society_admin, key, value)
    
    try:
        db.commit()
        db.refresh(db_society_admin)
        return db_society_admin
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.delete("/society-admins/{society_admin_id}", status_code=204)
def delete_society_admin(society_admin_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a society admin record.
    """
    db_society_admin = db.query(models.SocietyAdmin).filter(models.SocietyAdmin.id == society_admin_id).first()
    if db_society_admin is None:
        raise HTTPException(status_code=404, detail="Society admin record not found")
    
    try:
        db.delete(db_society_admin)
        db.commit()
        return None
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.get("/users/{user_id}/administered-societies", response_model=List[schemas.Society])
def get_user_administered_societies(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get all societies administered by a specific user.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    societies = db.query(models.Society).join(
        models.SocietyAdmin,
        models.Society.id == models.SocietyAdmin.society_id
    ).filter(
        models.SocietyAdmin.user_id == user_id
    ).all()
    
    return societies


@router.get("/societies/{society_id}/administrators", response_model=List[schemas.User])
def get_society_administrators(society_id: UUID, db: Session = Depends(get_db)):
    """
    Get all administrators for a specific society.
    """
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if society is None:
        raise HTTPException(status_code=404, detail="Society not found")
    
    users = db.query(models.User).join(
        models.SocietyAdmin,
        models.User.id == models.SocietyAdmin.user_id
    ).filter(
        models.SocietyAdmin.society_id == society_id
    ).all()
    
    return users

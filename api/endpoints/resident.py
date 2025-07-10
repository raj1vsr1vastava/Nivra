from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from uuid import UUID

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
import schemas
from database import get_db

router = APIRouter()

# Resident Endpoints
@router.get("/residents/", response_model=List[schemas.Resident])
def get_residents(
    skip: int = 0, 
    limit: int = 100,
    society_id: Optional[UUID] = None,
    name: Optional[str] = None,
    unit_number: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all residents with optional filters.
    """
    query = db.query(models.Resident)
    
    if society_id:
        query = query.filter(models.Resident.society_id == society_id)
    
    if name:
        query = query.filter(
            (models.Resident.first_name.ilike(f"%{name}%")) | 
            (models.Resident.last_name.ilike(f"%{name}%"))
        )
    
    if unit_number:
        query = query.filter(models.Resident.unit_number == unit_number)
    
    # Order by unit_number alphabetically, then by last_name, then by first_name
    # Handle cases where unit_number might be None by putting them at the end
    query = query.order_by(
        models.Resident.unit_number.asc().nulls_last(),
        models.Resident.last_name.asc(),
        models.Resident.first_name.asc()
    )
    
    residents = query.offset(skip).limit(limit).all()
    return residents


@router.get("/residents/{resident_id}", response_model=schemas.Resident)
def get_resident(resident_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific resident by ID with society information.
    """
    resident = db.query(models.Resident).options(joinedload(models.Resident.society)).filter(models.Resident.id == resident_id).first()
    if resident is None:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    return resident


@router.get("/users/{user_id}/resident", response_model=schemas.Resident)
def get_resident_by_user_id(user_id: UUID, db: Session = Depends(get_db)):
    """
    Get resident information for a specific user.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.resident_id is None:
        raise HTTPException(status_code=404, detail="User is not associated with a resident")
    
    resident = db.query(models.Resident).options(joinedload(models.Resident.society)).filter(models.Resident.id == user.resident_id).first()
    if resident is None:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    return resident


@router.post("/residents/", response_model=schemas.Resident, status_code=201)
def create_resident(resident: schemas.ResidentCreate, db: Session = Depends(get_db)):
    """
    Create a new resident.
    """
    # Check if society exists
    society = db.query(models.Society).filter(models.Society.id == resident.society_id).first()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")
    
    # Check if unit already exists in the same society (only if unit_number is provided)
    if resident.unit_number:
        existing_unit = db.query(models.Resident).filter(
            models.Resident.society_id == resident.society_id,
            models.Resident.unit_number == resident.unit_number
        ).first()
        # Allow multiple residents in the same unit (family members)
        # Just log a warning but don't block the creation
        if existing_unit:
            print(f"Warning: Unit {resident.unit_number} already has residents in society {resident.society_id}")
    
    db_resident = models.Resident(**resident.dict())
    db.add(db_resident)
    db.commit()
    db.refresh(db_resident)
    return db_resident


@router.put("/residents/{resident_id}", response_model=schemas.Resident)
def update_resident(
    resident_id: UUID, 
    resident_update: schemas.ResidentUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a resident.
    """
    db_resident = db.query(models.Resident).filter(models.Resident.id == resident_id).first()
    if db_resident is None:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    # Check if society exists if society_id is being updated
    if resident_update.society_id:
        society = db.query(models.Society).filter(models.Society.id == resident_update.society_id).first()
        if not society:
            raise HTTPException(status_code=404, detail="Society not found")
    
    # Removed email uniqueness validation - multiple residents can share the same email (family members)
    # Just log if unit is being changed and already exists
    if resident_update.unit_number and resident_update.unit_number != db_resident.unit_number:
        society_id = resident_update.society_id or db_resident.society_id
        existing_unit = db.query(models.Resident).filter(
            models.Resident.society_id == society_id,
            models.Resident.unit_number == resident_update.unit_number,
            models.Resident.id != resident_id  # Exclude current resident
        ).first()
        if existing_unit:
            print(f"Warning: Unit {resident_update.unit_number} already has residents in society {society_id}")
    
    update_data = resident_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_resident, key, value)
    
    db.commit()
    db.refresh(db_resident)
    return db_resident


@router.delete("/residents/{resident_id}", status_code=204)
def delete_resident(resident_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a resident.
    """
    db_resident = db.query(models.Resident).filter(models.Resident.id == resident_id).first()
    if db_resident is None:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    db.delete(db_resident)
    db.commit()
    return None

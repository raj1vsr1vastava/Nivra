from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
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
    
    residents = query.offset(skip).limit(limit).all()
    return residents


@router.get("/residents/{resident_id}", response_model=schemas.Resident)
def get_resident(resident_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific resident by ID.
    """
    resident = db.query(models.Resident).filter(models.Resident.id == resident_id).first()
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
    
    # Check if email already exists
    if resident.email:
        existing_resident = db.query(models.Resident).filter(
            models.Resident.email == resident.email
        ).first()
        if existing_resident:
            raise HTTPException(status_code=400, detail="Email already registered")
    
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
    
    # Check if email already exists if email is being updated
    if resident_update.email and resident_update.email != db_resident.email:
        existing_resident = db.query(models.Resident).filter(
            models.Resident.email == resident_update.email
        ).first()
        if existing_resident:
            raise HTTPException(status_code=400, detail="Email already registered")
    
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

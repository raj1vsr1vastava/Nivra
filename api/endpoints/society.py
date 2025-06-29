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

# Society Endpoints
@router.get("/societies/", response_model=List[schemas.Society])
def get_societies(
    skip: int = 0, 
    limit: int = 100, 
    name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all societies or filter by name.
    """
    query = db.query(models.Society)
    
    if name:
        query = query.filter(models.Society.name.ilike(f"%{name}%"))
    
    societies = query.offset(skip).limit(limit).all()
    return societies


@router.get("/societies/{society_id}", response_model=schemas.Society)
def get_society(society_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific society by ID.
    """
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if society is None:
        raise HTTPException(status_code=404, detail="Society not found")
    return society


@router.post("/societies/", response_model=schemas.Society, status_code=201)
def create_society(society: schemas.SocietyCreate, db: Session = Depends(get_db)):
    """
    Create a new society.
    """
    db_society = models.Society(**society.dict())
    db.add(db_society)
    db.commit()
    db.refresh(db_society)
    return db_society


@router.put("/societies/{society_id}", response_model=schemas.Society)
def update_society(
    society_id: UUID, 
    society_update: schemas.SocietyUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a society.
    """
    db_society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if db_society is None:
        raise HTTPException(status_code=404, detail="Society not found")
    
    update_data = society_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_society, key, value)
    
    db.commit()
    db.refresh(db_society)
    return db_society


@router.delete("/societies/{society_id}", status_code=204)
def delete_society(society_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a society.
    """
    db_society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if db_society is None:
        raise HTTPException(status_code=404, detail="Society not found")
    
    db.delete(db_society)
    db.commit()
    return None


@router.get("/societies/{society_id}/residents", response_model=List[schemas.Resident])
def get_society_residents(
    society_id: UUID, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all residents belonging to a specific society.
    """
    # Check if society exists
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if society is None:
        raise HTTPException(status_code=404, detail="Society not found")
    
    # Get residents for the society
    residents = db.query(models.Resident).filter(
        models.Resident.society_id == society_id
    ).offset(skip).limit(limit).all()
    
    return residents

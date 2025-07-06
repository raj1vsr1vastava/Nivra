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
    order_by: Optional[str] = Query("name", description="Field to order by (name, created_at, updated_at)"),
    order_desc: bool = Query(False, description="Order in descending order"),
    db: Session = Depends(get_db)
):
    """
    Get all societies or filter by name, with optional sorting.
    """
    query = db.query(models.Society)
    
    if name:
        query = query.filter(models.Society.name.ilike(f"%{name}%"))
    
    # Add ordering
    if order_by == "name":
        if order_desc:
            query = query.order_by(models.Society.name.desc())
        else:
            query = query.order_by(models.Society.name.asc())
    elif order_by == "created_at":
        if order_desc:
            query = query.order_by(models.Society.created_at.desc())
        else:
            query = query.order_by(models.Society.created_at.asc())
    elif order_by == "updated_at":
        if order_desc:
            query = query.order_by(models.Society.updated_at.desc())
        else:
            query = query.order_by(models.Society.updated_at.asc())
    else:
        # Default to name ascending
        query = query.order_by(models.Society.name.asc())
    
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
    
    # Get residents for the society, ordered by unit_number alphabetically
    residents = db.query(models.Resident).filter(
        models.Resident.society_id == society_id
    ).order_by(
        models.Resident.unit_number.asc().nulls_last(),
        models.Resident.last_name.asc(),
        models.Resident.first_name.asc()
    ).offset(skip).limit(limit).all()
    
    return residents


@router.get("/societies/{society_id}/committee", response_model=List[schemas.Resident])
def get_society_committee_members(
    society_id: UUID, 
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all committee members belonging to a specific society.
    """
    # Check if society exists
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if society is None:
        raise HTTPException(status_code=404, detail="Society not found")
    
    # Get committee members for the society
    committee_members = db.query(models.Resident).filter(
        models.Resident.society_id == society_id,
        models.Resident.is_committee_member == True
    ).order_by(models.Resident.committee_role.asc()).offset(skip).limit(limit).all()
    
    return committee_members

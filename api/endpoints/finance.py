from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from uuid import UUID
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
import schemas
from database import get_db

router = APIRouter()

# ResidentFinance Endpoints
@router.get("/finances/", response_model=List[schemas.ResidentFinance])
def get_finances(
    skip: int = 0, 
    limit: int = 100,
    resident_id: Optional[UUID] = None,
    payment_status: Optional[str] = None,
    transaction_type: Optional[str] = None,
    due_date_start: Optional[date] = None,
    due_date_end: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Get all financial transactions with optional filters.
    """
    query = db.query(models.ResidentFinance)
    
    if resident_id:
        query = query.filter(models.ResidentFinance.resident_id == resident_id)
    
    if payment_status:
        query = query.filter(models.ResidentFinance.payment_status == payment_status)
    
    if transaction_type:
        query = query.filter(models.ResidentFinance.transaction_type == transaction_type)
    
    if due_date_start:
        query = query.filter(models.ResidentFinance.due_date >= due_date_start)
    
    if due_date_end:
        query = query.filter(models.ResidentFinance.due_date <= due_date_end)
    
    finances = query.offset(skip).limit(limit).all()
    return finances


@router.get("/finances/{finance_id}", response_model=schemas.ResidentFinance)
def get_finance(finance_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific financial transaction by ID.
    """
    finance = db.query(models.ResidentFinance).filter(models.ResidentFinance.id == finance_id).first()
    if finance is None:
        raise HTTPException(status_code=404, detail="Finance transaction not found")
    return finance


@router.post("/finances/", response_model=schemas.ResidentFinance, status_code=201)
def create_finance(finance: schemas.ResidentFinanceCreate, db: Session = Depends(get_db)):
    """
    Create a new financial transaction.
    """
    # Check if resident exists
    resident = db.query(models.Resident).filter(models.Resident.id == finance.resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    db_finance = models.ResidentFinance(**finance.dict())
    db.add(db_finance)
    db.commit()
    db.refresh(db_finance)
    return db_finance


@router.put("/finances/{finance_id}", response_model=schemas.ResidentFinance)
def update_finance(
    finance_id: UUID, 
    finance_update: schemas.ResidentFinanceUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a financial transaction.
    """
    db_finance = db.query(models.ResidentFinance).filter(models.ResidentFinance.id == finance_id).first()
    if db_finance is None:
        raise HTTPException(status_code=404, detail="Finance transaction not found")
    
    update_data = finance_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_finance, key, value)
    
    db.commit()
    db.refresh(db_finance)
    return db_finance


@router.delete("/finances/{finance_id}", status_code=204)
def delete_finance(finance_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a financial transaction.
    """
    db_finance = db.query(models.ResidentFinance).filter(models.ResidentFinance.id == finance_id).first()
    if db_finance is None:
        raise HTTPException(status_code=404, detail="Finance transaction not found")
    
    db.delete(db_finance)
    db.commit()
    return None


# Additional useful endpoints

@router.get("/residents/{resident_id}/finances/", response_model=List[schemas.ResidentFinance])
def get_resident_finances(
    resident_id: UUID,
    skip: int = 0,
    limit: int = 100,
    payment_status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all financial transactions for a specific resident.
    """
    # First check if resident exists
    resident = db.query(models.Resident).filter(models.Resident.id == resident_id).first()
    if not resident:
        raise HTTPException(status_code=404, detail="Resident not found")
    
    query = db.query(models.ResidentFinance).filter(models.ResidentFinance.resident_id == resident_id)
    
    if payment_status:
        query = query.filter(models.ResidentFinance.payment_status == payment_status)
    
    finances = query.offset(skip).limit(limit).all()
    return finances


@router.get("/societies/{society_id}/finances/summary")
def get_society_finance_summary(
    society_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get financial summary for a society.
    """
    # First check if society exists
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if not society:
        raise HTTPException(status_code=404, detail="Society not found")
    
    # Get all residents for the society
    resident_ids = [r.id for r in db.query(models.Resident.id).filter(models.Resident.society_id == society_id).all()]
    
    if not resident_ids:
        return {
            "total_due": Decimal('0.00'),
            "total_paid": Decimal('0.00'),
            "pending_count": 0,
            "paid_count": 0
        }
    
    # Get summary information
    # For demonstration, we'll compute some basic stats
    total_due_query = db.query(models.ResidentFinance).filter(
        models.ResidentFinance.resident_id.in_(resident_ids),
        models.ResidentFinance.payment_status == "pending"
    )
    
    total_paid_query = db.query(models.ResidentFinance).filter(
        models.ResidentFinance.resident_id.in_(resident_ids),
        models.ResidentFinance.payment_status == "paid"
    )
    
    # Use Decimal for precise financial calculations and handle None values
    total_due_amount = Decimal('0.00')
    for finance in total_due_query.all():
        if finance.amount is not None:
            total_due_amount += finance.amount
    
    total_paid_amount = Decimal('0.00')
    for finance in total_paid_query.all():
        if finance.amount is not None:
            total_paid_amount += finance.amount
            
    # Round to two decimal places
    total_due_amount = total_due_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    total_paid_amount = total_paid_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
    
    pending_count = total_due_query.count()
    paid_count = total_paid_query.count()
    
    # Convert Decimal to float for JSON serialization
    return {
        "total_due": float(total_due_amount),
        "total_paid": float(total_paid_amount),
        "pending_count": pending_count,
        "paid_count": paid_count
    }

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from uuid import UUID
from sqlalchemy.exc import IntegrityError
from datetime import datetime, date

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
import schemas
from database import get_db
# from rbac_utils import has_permission  # Import currently not used

router = APIRouter()


@router.get("/society_finances/", response_model=List[schemas.SocietyFinance])
def get_all_society_finances(
    skip: int = 0, 
    limit: int = 100,
    society_id: Optional[UUID] = None,
    expense_type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    payment_status: Optional[str] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """
    Get all society finances with optional filters.
    """
    query = db.query(models.SocietyFinance)
    
    if society_id:
        query = query.filter(models.SocietyFinance.society_id == society_id)
    
    if expense_type:
        query = query.filter(models.SocietyFinance.expense_type == expense_type)
    
    if category:
        query = query.filter(models.SocietyFinance.category == category)
    
    if start_date:
        query = query.filter(models.SocietyFinance.expense_date >= start_date)
    
    if end_date:
        query = query.filter(models.SocietyFinance.expense_date <= end_date)
    
    if payment_status:
        query = query.filter(models.SocietyFinance.payment_status == payment_status)
    
    if is_active is not None:
        query = query.filter(models.SocietyFinance.is_active == is_active)
    
    finances = query.order_by(models.SocietyFinance.expense_date.desc()).offset(skip).limit(limit).all()
    return finances


@router.get("/society_finances/{finance_id}", response_model=schemas.SocietyFinance)
def get_society_finance(finance_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific society finance record by ID.
    """
    finance = db.query(models.SocietyFinance).filter(models.SocietyFinance.id == finance_id).first()
    if finance is None:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Society finance record with ID {finance_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    return finance


@router.get("/societies/{society_id}/finances", response_model=List[schemas.SocietyFinance])
def get_society_finances(
    society_id: UUID,
    skip: int = 0, 
    limit: int = 100,
    expense_type: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    payment_status: Optional[str] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """
    Get all finances for a specific society.
    """
    # Check if society exists
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if not society:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Society with ID {society_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    query = db.query(models.SocietyFinance).filter(models.SocietyFinance.society_id == society_id)
    
    if expense_type:
        query = query.filter(models.SocietyFinance.expense_type == expense_type)
    
    if category:
        query = query.filter(models.SocietyFinance.category == category)
    
    if start_date:
        query = query.filter(models.SocietyFinance.expense_date >= start_date)
    
    if end_date:
        query = query.filter(models.SocietyFinance.expense_date <= end_date)
    
    if payment_status:
        query = query.filter(models.SocietyFinance.payment_status == payment_status)
    
    if is_active is not None:
        query = query.filter(models.SocietyFinance.is_active == is_active)
    
    finances = query.order_by(models.SocietyFinance.expense_date.desc()).offset(skip).limit(limit).all()
    return finances


@router.post("/society_finances/", response_model=schemas.SocietyFinance, status_code=201)
def create_society_finance(finance: schemas.SocietyFinanceCreate, db: Session = Depends(get_db)):
    """
    Create a new society finance record.
    """
    # Check if society exists
    society = db.query(models.Society).filter(models.Society.id == finance.society_id).first()
    if not society:
        error_detail = {
            "code": "INVALID_SOCIETY",
            "message": f"Society with ID {finance.society_id} does not exist",
            "field": "society_id"
        }
        raise HTTPException(status_code=400, detail=error_detail)
    
    # Validate expense_type
    valid_expense_types = ["regular", "adhoc"]
    if finance.expense_type not in valid_expense_types:
        error_detail = {
            "code": "INVALID_EXPENSE_TYPE",
            "message": f"Expense type must be one of: {', '.join(valid_expense_types)}",
            "field": "expense_type"
        }
        raise HTTPException(status_code=400, detail=error_detail)
    
    # Validate payment_status
    valid_payment_statuses = ["pending", "paid", "overdue", "partially_paid"]
    if finance.payment_status not in valid_payment_statuses:
        error_detail = {
            "code": "INVALID_PAYMENT_STATUS",
            "message": f"Payment status must be one of: {', '.join(valid_payment_statuses)}",
            "field": "payment_status"
        }
        raise HTTPException(status_code=400, detail=error_detail)
    
    # Validate recurring_frequency if recurring is True
    if finance.recurring:
        valid_frequencies = ["daily", "weekly", "monthly", "quarterly", "biannually", "annually"]
        if not finance.recurring_frequency or finance.recurring_frequency not in valid_frequencies:
            error_detail = {
                "code": "INVALID_RECURRING_FREQUENCY",
                "message": f"For recurring expenses, frequency must be one of: {', '.join(valid_frequencies)}",
                "field": "recurring_frequency"
            }
            raise HTTPException(status_code=400, detail=error_detail)
        
        # Ensure next_due_date is provided for recurring expenses
        if not finance.next_due_date:
            error_detail = {
                "code": "MISSING_NEXT_DUE_DATE",
                "message": "For recurring expenses, next_due_date must be provided",
                "field": "next_due_date"
            }
            raise HTTPException(status_code=400, detail=error_detail)
    
    # Create finance model
    db_finance = models.SocietyFinance(**finance.dict())
    
    try:
        db.add(db_finance)
        db.commit()
        db.refresh(db_finance)
        return db_finance
    except IntegrityError as e:
        db.rollback()
        error_detail = {
            "code": "DATABASE_ERROR",
            "message": f"Database error: {str(e)}",
            "error_type": "integrity_error"
        }
        raise HTTPException(status_code=400, detail=error_detail)


@router.put("/society_finances/{finance_id}", response_model=schemas.SocietyFinance)
def update_society_finance(
    finance_id: UUID,
    finance_update: schemas.SocietyFinanceUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a society finance record.
    """
    db_finance = db.query(models.SocietyFinance).filter(models.SocietyFinance.id == finance_id).first()
    if db_finance is None:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Society finance record with ID {finance_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    # Check expense_type if provided
    if finance_update.expense_type:
        valid_expense_types = ["regular", "adhoc"]
        if finance_update.expense_type not in valid_expense_types:
            error_detail = {
                "code": "INVALID_EXPENSE_TYPE",
                "message": f"Expense type must be one of: {', '.join(valid_expense_types)}",
                "field": "expense_type"
            }
            raise HTTPException(status_code=400, detail=error_detail)
    
    # Check payment_status if provided
    if finance_update.payment_status:
        valid_payment_statuses = ["pending", "paid", "overdue", "partially_paid"]
        if finance_update.payment_status not in valid_payment_statuses:
            error_detail = {
                "code": "INVALID_PAYMENT_STATUS",
                "message": f"Payment status must be one of: {', '.join(valid_payment_statuses)}",
                "field": "payment_status"
            }
            raise HTTPException(status_code=400, detail=error_detail)
    
    # Check recurring_frequency if recurring is True or being set to True
    if finance_update.recurring is True:
        valid_frequencies = ["daily", "weekly", "monthly", "quarterly", "biannually", "annually"]
        
        # Check if recurring frequency is being updated or use existing value
        # Using getattr to safely access model attributes
        frequency = finance_update.recurring_frequency
        if frequency is None and getattr(db_finance, 'recurring', False) is True:
            # Only use existing frequency if the record was already recurring
            frequency = getattr(db_finance, 'recurring_frequency', None)
            
        # Validate the frequency
        if frequency is None or frequency not in valid_frequencies:
            error_detail = {
                "code": "INVALID_RECURRING_FREQUENCY",
                "message": f"For recurring expenses, frequency must be one of: {', '.join(valid_frequencies)}",
                "field": "recurring_frequency"
            }
            raise HTTPException(status_code=400, detail=error_detail)
        
        # Ensure next_due_date is provided for recurring expenses
        next_due_date = finance_update.next_due_date
        if next_due_date is None and getattr(db_finance, 'recurring', False) is True:
            # Only use existing date if the record was already recurring
            next_due_date = getattr(db_finance, 'next_due_date', None)
            
        if next_due_date is None:
            error_detail = {
                "code": "MISSING_NEXT_DUE_DATE",
                "message": "For recurring expenses, next_due_date must be provided",
                "field": "next_due_date"
            }
            raise HTTPException(status_code=400, detail=error_detail)
    
    # Update finance record
    update_data = finance_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_finance, key, value)
    
    try:
        db.commit()
        db.refresh(db_finance)
        return db_finance
    except IntegrityError as e:
        db.rollback()
        error_detail = {
            "code": "DATABASE_ERROR",
            "message": f"Database error: {str(e)}",
            "error_type": "integrity_error"
        }
        raise HTTPException(status_code=400, detail=error_detail)


@router.delete("/society_finances/{finance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_society_finance(finance_id: UUID, db: Session = Depends(get_db)):
    """
    Soft delete a society finance record.
    """
    db_finance = db.query(models.SocietyFinance).filter(models.SocietyFinance.id == finance_id).first()
    if db_finance is None:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Society finance record with ID {finance_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    # Soft delete - use setattr to update the attribute value
    setattr(db_finance, 'is_active', False)
    db.commit()
    return None


@router.get("/societies/{society_id}/finance-categories", response_model=List[str])
def get_society_finance_categories(society_id: UUID, db: Session = Depends(get_db)):
    """
    Get all unique finance categories for a society.
    """
    # Check if society exists
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if not society:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Society with ID {society_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    # Get distinct categories
    categories = db.query(models.SocietyFinance.category).filter(
        models.SocietyFinance.society_id == society_id,
        models.SocietyFinance.is_active == True
    ).distinct().all()
    
    return [category[0] for category in categories]


@router.get("/societies/{society_id}/finance-summary", response_model=dict)
def get_society_finance_summary(
    society_id: UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    expense_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get a summary of society finances grouped by category.
    """
    # Check if society exists
    society = db.query(models.Society).filter(models.Society.id == society_id).first()
    if not society:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Society with ID {society_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    # Base query
    from sqlalchemy import func, distinct
    query = db.query(
        models.SocietyFinance.category,
        func.sum(models.SocietyFinance.amount).label("total_amount"),
        func.count(distinct(models.SocietyFinance.id)).label("count")
    ).filter(
        models.SocietyFinance.society_id == society_id,
        models.SocietyFinance.is_active == True
    )
    
    if start_date:
        query = query.filter(models.SocietyFinance.expense_date >= start_date)
    
    if end_date:
        query = query.filter(models.SocietyFinance.expense_date <= end_date)
    
    if expense_type:
        query = query.filter(models.SocietyFinance.expense_type == expense_type)
    
    # Group by category
    results = query.group_by(models.SocietyFinance.category).all()
    
    # Compile summary
    summary = {
        "categories": {},
        "total": {
            "amount": 0,
            "count": 0
        }
    }
    
    for category, amount, count in results:
        summary["categories"][category] = {
            "amount": float(amount),
            "count": count
        }
        summary["total"]["amount"] += float(amount)
        summary["total"]["count"] += count
    
    return summary

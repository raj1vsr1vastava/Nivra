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


@router.get("/resident_finances/", response_model=List[schemas.ResidentFinance])
def get_all_resident_finances(
    skip: int = 0, 
    limit: int = 100,
    resident_id: Optional[UUID] = None,
    transaction_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    payment_status: Optional[str] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """
    Get all resident finances with optional filters.
    """
    query = db.query(models.ResidentFinance)
    
    if resident_id:
        query = query.filter(models.ResidentFinance.resident_id == resident_id)
    
    if transaction_type:
        query = query.filter(models.ResidentFinance.transaction_type == transaction_type)
    
    if start_date:
        query = query.filter(models.ResidentFinance.due_date >= start_date)
    
    if end_date:
        query = query.filter(models.ResidentFinance.due_date <= end_date)
    
    if payment_status:
        query = query.filter(models.ResidentFinance.payment_status == payment_status)
    
    if is_active is not None:
        query = query.filter(models.ResidentFinance.is_active == is_active)
    
    finances = query.order_by(models.ResidentFinance.created_at.desc()).offset(skip).limit(limit).all()
    return finances


@router.get("/resident_finances/{finance_id}", response_model=schemas.ResidentFinance)
def get_resident_finance(finance_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific resident finance record by ID.
    """
    finance = db.query(models.ResidentFinance).filter(models.ResidentFinance.id == finance_id).first()
    if finance is None:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Resident finance record with ID {finance_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    return finance


@router.get("/residents/{resident_id}/finances", response_model=List[schemas.ResidentFinance])
def get_resident_finances(
    resident_id: UUID,
    skip: int = 0, 
    limit: int = 100,
    transaction_type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    payment_status: Optional[str] = None,
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """
    Get all finances for a specific resident.
    """
    # Check if resident exists
    resident = db.query(models.Resident).filter(models.Resident.id == resident_id).first()
    if not resident:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Resident with ID {resident_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    query = db.query(models.ResidentFinance).filter(models.ResidentFinance.resident_id == resident_id)
    
    if transaction_type:
        query = query.filter(models.ResidentFinance.transaction_type == transaction_type)
    
    if start_date:
        query = query.filter(models.ResidentFinance.due_date >= start_date)
    
    if end_date:
        query = query.filter(models.ResidentFinance.due_date <= end_date)
    
    if payment_status:
        query = query.filter(models.ResidentFinance.payment_status == payment_status)
    
    if is_active is not None:
        query = query.filter(models.ResidentFinance.is_active == is_active)
    
    finances = query.order_by(models.ResidentFinance.created_at.desc()).offset(skip).limit(limit).all()
    return finances


@router.post("/resident_finances/", response_model=schemas.ResidentFinance, status_code=201)
def create_resident_finance(finance: schemas.ResidentFinanceCreate, db: Session = Depends(get_db)):
    """
    Create a new resident finance record.
    """
    # Check if resident exists
    resident = db.query(models.Resident).filter(models.Resident.id == finance.resident_id).first()
    if not resident:
        error_detail = {
            "code": "INVALID_RESIDENT",
            "message": f"Resident with ID {finance.resident_id} does not exist",
            "field": "resident_id"
        }
        raise HTTPException(status_code=400, detail=error_detail)
    
    # Validate transaction_type
    valid_transaction_types = ["maintenance", "penalty", "special_charge", "payment", "refund"]
    if finance.transaction_type not in valid_transaction_types:
        error_detail = {
            "code": "INVALID_TRANSACTION_TYPE",
            "message": f"Transaction type must be one of: {', '.join(valid_transaction_types)}",
            "field": "transaction_type"
        }
        raise HTTPException(status_code=400, detail=error_detail)
    
    # Validate payment_status
    valid_payment_statuses = ["pending", "paid", "overdue"]
    if finance.payment_status not in valid_payment_statuses:
        error_detail = {
            "code": "INVALID_PAYMENT_STATUS",
            "message": f"Payment status must be one of: {', '.join(valid_payment_statuses)}",
            "field": "payment_status"
        }
        raise HTTPException(status_code=400, detail=error_detail)
    
    # Create finance model
    db_finance = models.ResidentFinance(**finance.dict())
    
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


@router.put("/resident_finances/{finance_id}", response_model=schemas.ResidentFinance)
def update_resident_finance(
    finance_id: UUID,
    finance_update: schemas.ResidentFinanceUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a resident finance record.
    """
    db_finance = db.query(models.ResidentFinance).filter(models.ResidentFinance.id == finance_id).first()
    if db_finance is None:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Resident finance record with ID {finance_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    # Check transaction_type if provided
    if finance_update.transaction_type:
        valid_transaction_types = ["maintenance", "penalty", "special_charge", "payment", "refund"]
        if finance_update.transaction_type not in valid_transaction_types:
            error_detail = {
                "code": "INVALID_TRANSACTION_TYPE",
                "message": f"Transaction type must be one of: {', '.join(valid_transaction_types)}",
                "field": "transaction_type"
            }
            raise HTTPException(status_code=400, detail=error_detail)
    
    # Check payment_status if provided
    if finance_update.payment_status:
        valid_payment_statuses = ["pending", "paid", "overdue"]
        if finance_update.payment_status not in valid_payment_statuses:
            error_detail = {
                "code": "INVALID_PAYMENT_STATUS",
                "message": f"Payment status must be one of: {', '.join(valid_payment_statuses)}",
                "field": "payment_status"
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


@router.delete("/resident_finances/{finance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resident_finance(finance_id: UUID, db: Session = Depends(get_db)):
    """
    Soft delete a resident finance record.
    """
    db_finance = db.query(models.ResidentFinance).filter(models.ResidentFinance.id == finance_id).first()
    if db_finance is None:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Resident finance record with ID {finance_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    # Soft delete - use setattr to update the attribute value
    setattr(db_finance, 'is_active', False)
    db.commit()
    return None


@router.get("/residents/{resident_id}/finance-summary", response_model=dict)
def get_resident_finance_summary(
    resident_id: UUID,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Get a summary of resident finances including dues, payments, and balance.
    """
    # Check if resident exists
    resident = db.query(models.Resident).filter(models.Resident.id == resident_id).first()
    if not resident:
        error_detail = {
            "code": "NOT_FOUND",
            "message": f"Resident with ID {resident_id} not found"
        }
        raise HTTPException(status_code=404, detail=error_detail)
    
    # Base query for both dues and payments
    from sqlalchemy import func, case, literal
    
    # Filter conditions for date range
    conditions = [models.ResidentFinance.resident_id == resident_id, 
                  models.ResidentFinance.is_active == True]
    
    if start_date:
        conditions.append(models.ResidentFinance.due_date >= start_date)
    
    if end_date:
        conditions.append(models.ResidentFinance.due_date <= end_date)
    
    # Calculate total dues (maintenance, penalty, special_charge)
    dues_query = db.query(func.sum(models.ResidentFinance.amount).label("total_dues")).filter(
        *conditions,
        models.ResidentFinance.transaction_type.in_(["maintenance", "penalty", "special_charge"])
    )
    
    # Calculate total payments (payment, refund)
    payments_query = db.query(func.sum(models.ResidentFinance.amount).label("total_payments")).filter(
        *conditions,
        models.ResidentFinance.transaction_type.in_(["payment", "refund"])
    )
    
    # Get recent transactions
    recent_transactions_query = db.query(models.ResidentFinance).filter(
        *conditions
    ).order_by(models.ResidentFinance.created_at.desc()).limit(5)
    
    # Execute queries
    dues_result = dues_query.scalar() or 0
    payments_result = payments_query.scalar() or 0
    recent_transactions = recent_transactions_query.all()
    
    # Calculate balance (dues - payments)
    balance = float(dues_result) - float(payments_result)
    
    # Format transaction data
    formatted_transactions = []
    for transaction in recent_transactions:
        transaction_type = "due" if transaction.transaction_type in ["maintenance", "penalty", "special_charge"] else "payment"
        
        formatted_transactions.append({
            "id": str(transaction.id),
            "title": transaction.description or transaction.transaction_type.capitalize(),
            "amount": float(transaction.amount),
            "date": transaction.due_date.isoformat() if transaction.due_date else transaction.created_at.date().isoformat(),
            "type": transaction_type,
            "status": transaction.payment_status if transaction_type == "due" else None
        })
    
    # Compile summary
    summary = {
        "dues": float(dues_result),
        "payments": float(payments_result),
        "balance": balance,
        "recentTransactions": formatted_transactions
    }
    
    return summary

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

# Permission Management Endpoints
@router.get("/permissions/", response_model=List[schemas.Permission])
def get_permissions(
    skip: int = 0, 
    limit: int = 100,
    name: Optional[str] = None,
    resource_type: Optional[str] = None,
    action: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all permissions with optional filtering.
    """
    query = db.query(models.Permission)
    
    if name:
        query = query.filter(models.Permission.name.ilike(f"%{name}%"))
    if resource_type:
        query = query.filter(models.Permission.resource_type == resource_type)
    if action:
        query = query.filter(models.Permission.action == action)
    
    permissions = query.offset(skip).limit(limit).all()
    return permissions


@router.get("/permissions/{permission_id}", response_model=schemas.Permission)
def get_permission(permission_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific permission by ID.
    """
    permission = db.query(models.Permission).filter(models.Permission.id == permission_id).first()
    if permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")
    return permission


@router.post("/permissions/", response_model=schemas.Permission, status_code=201)
def create_permission(permission: schemas.PermissionCreate, db: Session = Depends(get_db)):
    """
    Create a new permission.
    """
    # Check if permission name already exists
    db_permission = db.query(models.Permission).filter(models.Permission.name == permission.name).first()
    if db_permission:
        raise HTTPException(status_code=400, detail="Permission name already exists")
    
    # Create permission model
    db_permission = models.Permission(**permission.dict())
    
    try:
        db.add(db_permission)
        db.commit()
        db.refresh(db_permission)
        return db_permission
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.put("/permissions/{permission_id}", response_model=schemas.Permission)
def update_permission(
    permission_id: UUID, 
    permission_update: schemas.PermissionUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a permission.
    """
    db_permission = db.query(models.Permission).filter(models.Permission.id == permission_id).first()
    if db_permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Check if permission name is being changed and if it already exists
    if permission_update.name and permission_update.name != db_permission.name:
        existing_permission = db.query(models.Permission).filter(models.Permission.name == permission_update.name).first()
        if existing_permission:
            raise HTTPException(status_code=400, detail="Permission name already exists")
    
    # Update fields
    update_data = permission_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_permission, key, value)
    
    try:
        db.commit()
        db.refresh(db_permission)
        return db_permission
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.delete("/permissions/{permission_id}", status_code=204)
def delete_permission(permission_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a permission.
    """
    db_permission = db.query(models.Permission).filter(models.Permission.id == permission_id).first()
    if db_permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Check if permission is assigned to any role
    role_permissions = db.query(models.RolePermission).filter(
        models.RolePermission.permission_id == permission_id
    ).count()
    
    if role_permissions > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete permission: it is assigned to {role_permissions} roles"
        )
    
    try:
        db.delete(db_permission)
        db.commit()
        return None
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.get("/permissions/resource-types", status_code=200)
def get_resource_types(db: Session = Depends(get_db)):
    """
    Get all unique resource types used in permissions.
    """
    resource_types = [r[0] for r in db.query(models.Permission.resource_type).distinct().all()]
    return {"resource_types": resource_types}


@router.get("/permissions/actions", status_code=200)
def get_actions(db: Session = Depends(get_db)):
    """
    Get all unique actions used in permissions.
    """
    actions = [a[0] for a in db.query(models.Permission.action).distinct().all()]
    return {"actions": actions}

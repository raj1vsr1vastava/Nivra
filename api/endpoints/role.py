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

# Role Management Endpoints
@router.get("/roles/", response_model=List[schemas.Role])
def get_roles(
    skip: int = 0, 
    limit: int = 100,
    name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all roles with optional filtering.
    """
    query = db.query(models.Role)
    
    if name:
        query = query.filter(models.Role.name.ilike(f"%{name}%"))
    
    roles = query.offset(skip).limit(limit).all()
    return roles


@router.get("/roles/{role_id}", response_model=schemas.Role)
def get_role(role_id: UUID, db: Session = Depends(get_db)):
    """
    Get a specific role by ID.
    """
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    return role


@router.post("/roles/", response_model=schemas.Role, status_code=201)
def create_role(role: schemas.RoleCreate, db: Session = Depends(get_db)):
    """
    Create a new role.
    """
    # Check if role name already exists
    db_role = db.query(models.Role).filter(models.Role.name == role.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role name already exists")
    
    # Create role model
    db_role = models.Role(**role.dict())
    
    try:
        db.add(db_role)
        db.commit()
        db.refresh(db_role)
        return db_role
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.put("/roles/{role_id}", response_model=schemas.Role)
def update_role(
    role_id: UUID, 
    role_update: schemas.RoleUpdate, 
    db: Session = Depends(get_db)
):
    """
    Update a role.
    """
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if role name is being changed and if it already exists
    if role_update.name and role_update.name != db_role.name:
        existing_role = db.query(models.Role).filter(models.Role.name == role_update.name).first()
        if existing_role:
            raise HTTPException(status_code=400, detail="Role name already exists")
    
    # Update fields
    update_data = role_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_role, key, value)
    
    try:
        db.commit()
        db.refresh(db_role)
        return db_role
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.delete("/roles/{role_id}", status_code=204)
def delete_role(role_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a role.
    """
    db_role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if db_role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Check if the role is in use
    users_with_role = db.query(models.User).filter(models.User.role_id == role_id).count()
    if users_with_role > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete role: it is assigned to {users_with_role} users"
        )
    
    try:
        db.delete(db_role)
        db.commit()
        return None
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


# Role-Permission Management
@router.get("/roles/{role_id}/permissions", response_model=List[schemas.Permission])
def get_role_permissions(role_id: UUID, db: Session = Depends(get_db)):
    """
    Get all permissions for a specific role.
    """
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Query permissions through role_permissions
    permissions = db.query(models.Permission).join(
        models.RolePermission,
        models.Permission.id == models.RolePermission.permission_id
    ).filter(
        models.RolePermission.role_id == role_id
    ).all()
    
    return permissions


@router.post("/roles/{role_id}/permissions", status_code=201)
def add_permission_to_role(
    role_id: UUID, 
    permission_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Add a permission to a role.
    """
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    
    permission = db.query(models.Permission).filter(models.Permission.id == permission_id).first()
    if permission is None:
        raise HTTPException(status_code=404, detail="Permission not found")
    
    # Check if permission is already assigned to role
    existing = db.query(models.RolePermission).filter(
        models.RolePermission.role_id == role_id,
        models.RolePermission.permission_id == permission_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Permission already assigned to role")
    
    # Create role-permission relationship
    role_permission = models.RolePermission(role_id=role_id, permission_id=permission_id)
    
    try:
        db.add(role_permission)
        db.commit()
        return {"message": "Permission added to role successfully"}
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.delete("/roles/{role_id}/permissions/{permission_id}", status_code=204)
def remove_permission_from_role(
    role_id: UUID, 
    permission_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Remove a permission from a role.
    """
    role_permission = db.query(models.RolePermission).filter(
        models.RolePermission.role_id == role_id,
        models.RolePermission.permission_id == permission_id
    ).first()
    
    if role_permission is None:
        raise HTTPException(status_code=404, detail="Permission not assigned to role")
    
    try:
        db.delete(role_permission)
        db.commit()
        return None
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")


@router.put("/roles/{role_id}/permissions", status_code=200)
def update_role_permissions(
    role_id: UUID,
    permission_request: dict,  # Expecting {"permission_ids": [list of UUIDs]}
    db: Session = Depends(get_db)
):
    """
    Update all permissions for a role (bulk update).
    This will replace all existing permissions for the role with the provided list.
    """
    # Validate role exists
    role = db.query(models.Role).filter(models.Role.id == role_id).first()
    if role is None:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Get permission_ids from request body
    permission_ids = permission_request.get("permission_ids", [])
    
    # Validate all permission IDs exist
    if permission_ids:
        valid_permissions = db.query(models.Permission).filter(
            models.Permission.id.in_(permission_ids)
        ).all()
        
        if len(valid_permissions) != len(permission_ids):
            raise HTTPException(status_code=400, detail="One or more permission IDs are invalid")
    
    try:
        # Remove all existing permissions for this role
        db.query(models.RolePermission).filter(
            models.RolePermission.role_id == role_id
        ).delete()
        
        # Add new permissions
        for permission_id in permission_ids:
            role_permission = models.RolePermission(
                role_id=role_id,
                permission_id=UUID(permission_id)
            )
            db.add(role_permission)
        
        db.commit()
        return {"message": f"Successfully updated {len(permission_ids)} permissions for role"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {str(e)}")

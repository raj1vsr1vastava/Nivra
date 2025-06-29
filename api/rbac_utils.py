from typing import Optional, List, Dict, Any, Callable
from functools import wraps
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from endpoints.auth import get_current_active_user
from database import get_db
import models


class RBACDependency:
    """
    A dependency class for handling role-based access control.
    Use this to protect endpoints with permission checks.
    """
    
    def __init__(
        self, 
        resource_type: str, 
        action: str,
        check_society_access: bool = False
    ):
        """
        Initialize the RBAC dependency.
        
        :param resource_type: Type of resource (societies, residents, finances)
        :param action: Action to perform (create, read, update, delete)
        :param check_society_access: Whether to check if user has access to the specific society
        """
        self.resource_type = resource_type
        self.action = action
        self.check_society_access = check_society_access
    
    def __call__(
        self, 
        user = Depends(get_current_active_user), 
        db: Session = Depends(get_db)
    ):
        """
        Check if the user has the required permission.
        
        :param user: Current active user
        :param db: Database session
        :return: User if permission check passes
        :raises: HTTPException if permission check fails
        """
        # System admins have all permissions
        is_system_admin = db.query(models.Role).filter(
            models.Role.id == user.role_id,
            models.Role.name == "system_admin"
        ).first() is not None
        
        if is_system_admin:
            return user
        
        # Check for specific permission
        permission = db.query(models.Permission).join(
            models.RolePermission,
            models.Permission.id == models.RolePermission.permission_id
        ).filter(
            models.RolePermission.role_id == user.role_id,
            models.Permission.resource_type == self.resource_type,
            models.Permission.action == self.action
        ).first()
        
        if not permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {self.action} {self.resource_type}"
            )
        
        return user


# Helper function to check if a user has access to a specific society
def check_society_access(
    user: models.User, 
    society_id: UUID, 
    db: Session,
    role_names: Optional[List[str]] = None
) -> bool:
    """
    Check if a user has access to a specific society.
    
    :param user: User model
    :param society_id: Society UUID
    :param db: Database session
    :param role_names: Optional list of role names to check against
    :return: True if user has access, False otherwise
    """
    # System admin has access to all societies
    is_system_admin = db.query(models.Role).filter(
        models.Role.id == user.role_id,
        models.Role.name == "system_admin"
    ).first() is not None
    
    if is_system_admin:
        return True
    
    # If specific roles are provided, check if user has one of these roles
    if role_names:
        user_role = db.query(models.Role).filter(models.Role.id == user.role_id).first()
        if not user_role or user_role.name not in role_names:
            return False
    
    # Society admin case - check if user is admin for this society
    is_society_admin = db.query(models.SocietyAdmin).filter(
        models.SocietyAdmin.user_id == user.id,
        models.SocietyAdmin.society_id == society_id
    ).first() is not None
    
    if is_society_admin:
        return True
    
    # Check if user is linked to a resident in this society
    # Need to verify resident_id is not None without using the column directly in a conditional
    resident_query = db.query(models.Resident).filter(
        models.Resident.id == user.resident_id,
        models.Resident.society_id == society_id
    )
    
    resident_in_society = resident_query.first() is not None
    if resident_in_society:
        return True
    
    return False


# Decorator for checking society access
def require_society_access(society_id_param: str = 'society_id'):
    """
    Decorator to check if a user has access to a specific society.
    
    :param society_id_param: Name of the path parameter containing the society_id
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            user = kwargs.get('current_user')
            db = kwargs.get('db')
            society_id = kwargs.get(society_id_param)
            
            if not user or not db or not society_id:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Missing required dependencies for society access check"
                )
            
            if not check_society_access(user, society_id, db):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"No access to society {society_id}"
                )
            
            return await func(*args, **kwargs)
        
        return wrapper
    
    return decorator

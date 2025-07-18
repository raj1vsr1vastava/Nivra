from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from uuid import UUID
import os
from dotenv import load_dotenv

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import models
import schemas
from database import get_db

# Load environment variables
load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Create router
router = APIRouter()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


# Helper functions
def verify_password(plain_password, hashed_password):
    """Verify if plain password matches the hashed password."""
    # Convert SQLAlchemy Column object to string if needed
    hashed_str = str(hashed_password) if hashed_password is not None else ""
    return pwd_context.verify(plain_password, hashed_str)


def get_password_hash(password):
    """Generate password hash."""
    return pwd_context.hash(password)


def get_user_by_username_or_email(db: Session, username_or_email: str):
    """Get user by username or email."""
    user = db.query(models.User).filter(models.User.username == username_or_email).first()
    if not user:
        user = db.query(models.User).filter(models.User.email == username_or_email).first()
    return user


def authenticate_user(db: Session, username_or_email: str, password: str):
    """Authenticate user by username or email."""
    user = get_user_by_username_or_email(db, username_or_email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get current user from token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    # Make sure username is not None before using it
    if not token_data.username:
        raise credentials_exception
        
    user = get_user_by_username_or_email(db, token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    """Check if current user is active."""
    # Need to query the database to check is_active status
    is_active = db.query(models.User.is_active).filter(models.User.id == current_user.id).scalar()
    if not is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


# Endpoints
@router.post("/auth/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time
    setattr(user, "last_login", datetime.utcnow())
    db.commit()
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me", response_model=schemas.User)
async def read_users_me(current_user = Depends(get_current_active_user)):
    """
    Get current user information.
    """
    return current_user


@router.post("/auth/change-password", status_code=200)
async def change_password(
    current_password: str,
    new_password: str,
    current_user = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password.
    """
    # Verify current password
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Hash and set new password
    setattr(current_user, "password_hash", get_password_hash(new_password))
    db.commit()
    return {"message": "Password changed successfully"}


@router.get("/auth/user-permissions", response_model=List[schemas.Permission])
async def get_user_permissions(current_user = Depends(get_current_active_user), db: Session = Depends(get_db)):
    """
    Get all permissions for the current user based on their role.
    """
    permissions = db.query(models.Permission).join(
        models.RolePermission,
        models.Permission.id == models.RolePermission.permission_id
    ).filter(
        models.RolePermission.role_id == current_user.role_id
    ).all()
    
    return permissions


# Function to check if a user has a specific permission
def has_permission(
    resource_type: str, 
    action: str, 
    user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Check if a user has a specific permission.
    """
    # Check if user is system admin (has all permissions)
    is_system_admin = db.query(models.Role).filter(
        models.Role.id == user.role_id,
        models.Role.name == "system_admin"
    ).first() is not None
    
    if is_system_admin:
        return True
    
    # Check for specific permission
    has_specific_permission = db.query(models.Permission).join(
        models.RolePermission,
        models.Permission.id == models.RolePermission.permission_id
    ).filter(
        models.RolePermission.role_id == user.role_id,
        models.Permission.resource_type == resource_type,
        models.Permission.action == action
    ).first() is not None
    
    return has_specific_permission


@router.post("/auth/signup", response_model=schemas.User, status_code=201)
async def signup(
    user_data: schemas.SignupRequest,
    db: Session = Depends(get_db)
):
    """
    Create a new user account (signup).
    """
    # Check if username already exists
    db_username = db.query(models.User).filter(models.User.username == user_data.username).first()
    if db_username:
        raise HTTPException(
            status_code=400, 
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_email = db.query(models.User).filter(models.User.email == user_data.email).first()
    if db_email:
        raise HTTPException(
            status_code=400, 
            detail="Email already registered"
        )
    
    # Get default role (resident) for new signups
    default_role = db.query(models.Role).filter(models.Role.name == "resident").first()
    if not default_role:
        raise HTTPException(
            status_code=500, 
            detail="Default role not found"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    db_user = models.User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        password_hash=hashed_password,
        role_id=default_role.id,
        resident_id=None  # Will be set later when user joins a society
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user


@router.post("/auth/login", response_model=dict)
async def login(
    login_data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login endpoint for web app (alternative to OAuth2 token).
    """
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Update last login time
    setattr(user, "last_login", datetime.utcnow())
    db.commit()
    
    # Get role information
    role = db.query(models.Role).filter(models.Role.id == user.role_id).first()
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Split full_name into first and last names
    name_parts = user.full_name.split(' ', 1)
    first_name = name_parts[0] if name_parts else user.full_name
    last_name = name_parts[1] if len(name_parts) > 1 else ""
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "username": user.username,
            "email": user.email,
            "firstName": first_name,
            "lastName": last_name,
            "role": role.name if role else "resident",
            "userStatus": "active" if getattr(user, 'is_active', False) else "inactive",
            "societyId": str(user.resident.society_id) if user.resident else None,
            "avatar": None
        }
    }

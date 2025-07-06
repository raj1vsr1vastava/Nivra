from typing import Optional, List
from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, Field, validator
from pydantic.networks import EmailStr
from decimal import Decimal


# Society Schemas
class SocietyBase(BaseModel):
    name: str
    address: str
    city: str
    state: str
    zipcode: str
    country: str = "India"
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    registration_number: Optional[str] = None
    registration_date: Optional[date] = None
    total_units: int


class SocietyCreate(SocietyBase):
    pass


class SocietyUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zipcode: Optional[str] = None
    country: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    registration_number: Optional[str] = None
    registration_date: Optional[date] = None
    total_units: Optional[int] = None


class Society(SocietyBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Resident Schemas
class ResidentBase(BaseModel):
    society_id: UUID
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    unit_number: str
    is_owner: bool = False
    is_committee_member: bool = False
    committee_role: Optional[str] = None
    move_in_date: Optional[date] = None
    move_out_date: Optional[date] = None


class ResidentCreate(ResidentBase):
    pass


class ResidentUpdate(BaseModel):
    society_id: Optional[UUID] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    unit_number: Optional[str] = None
    is_owner: Optional[bool] = None
    is_committee_member: Optional[bool] = None
    committee_role: Optional[str] = None
    move_in_date: Optional[date] = None
    move_out_date: Optional[date] = None


class Resident(ResidentBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime
    # Include society data in resident responses
    society: Optional['Society'] = None

    class Config:
        from_attributes = True
        from_attributes = True


# ResidentFinance Schemas
class ResidentFinanceBase(BaseModel):
    resident_id: UUID
    transaction_type: str
    amount: Decimal = Field(..., decimal_places=2)
    currency: str = "INR"
    due_date: Optional[date] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    payment_status: str = "pending"
    description: Optional[str] = None
    invoice_number: Optional[str] = None
    receipt_number: Optional[str] = None


class ResidentFinanceCreate(ResidentFinanceBase):
    pass


class ResidentFinanceUpdate(BaseModel):
    transaction_type: Optional[str] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    due_date: Optional[date] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    payment_status: Optional[str] = None
    description: Optional[str] = None
    invoice_number: Optional[str] = None
    receipt_number: Optional[str] = None


class ResidentFinance(ResidentFinanceBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True


# RBAC Schemas
# Role Schemas
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class Role(RoleBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True


# Permission Schemas
class PermissionBase(BaseModel):
    name: str
    description: Optional[str] = None
    resource_type: str
    action: str


class PermissionCreate(PermissionBase):
    pass


class PermissionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    action: Optional[str] = None


class Permission(PermissionBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    role_id: UUID
    resident_id: Optional[UUID] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role_id: Optional[UUID] = None
    resident_id: Optional[UUID] = None
    is_active: Optional[bool] = None


class User(UserBase):
    id: UUID
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True


# RolePermission Schemas
class RolePermissionBase(BaseModel):
    role_id: UUID
    permission_id: UUID


class RolePermissionCreate(RolePermissionBase):
    pass


class RolePermission(RolePermissionBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True


# SocietyAdmin Schemas
class SocietyAdminBase(BaseModel):
    user_id: UUID
    society_id: UUID
    is_primary_admin: bool = False


class SocietyAdminCreate(SocietyAdminBase):
    pass


class SocietyAdminUpdate(BaseModel):
    is_primary_admin: Optional[bool] = None


class SocietyAdmin(SocietyAdminBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True


# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class UserInDB(User):
    password_hash: str


# Society Finance Schemas
class SocietyFinanceBase(BaseModel):
    society_id: UUID
    expense_type: str  # regular, adhoc
    category: str  # security, housekeeping, etc.
    vendor_name: Optional[str] = None
    expense_date: date
    amount: Decimal
    currency: str = "INR"
    payment_status: str = "pending"
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    invoice_number: Optional[str] = None
    receipt_number: Optional[str] = None
    description: Optional[str] = None
    recurring: bool = False
    recurring_frequency: Optional[str] = None  # monthly, quarterly, annually
    next_due_date: Optional[date] = None


class SocietyFinanceCreate(SocietyFinanceBase):
    pass


class SocietyFinanceUpdate(BaseModel):
    expense_type: Optional[str] = None
    category: Optional[str] = None
    vendor_name: Optional[str] = None
    expense_date: Optional[date] = None
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    payment_status: Optional[str] = None
    payment_date: Optional[date] = None
    payment_method: Optional[str] = None
    invoice_number: Optional[str] = None
    receipt_number: Optional[str] = None
    description: Optional[str] = None
    recurring: Optional[bool] = None
    recurring_frequency: Optional[str] = None
    next_due_date: Optional[date] = None
    is_active: Optional[bool] = None


class SocietyFinance(SocietyFinanceBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        from_attributes = True


class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str

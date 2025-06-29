import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, Date, DateTime, Numeric, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


class Society(Base):
    __tablename__ = "societies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    zipcode = Column(String(20), nullable=False)
    country = Column(String(100), nullable=False, default="India")
    contact_email = Column(String(255))
    contact_phone = Column(String(20))
    registration_number = Column(String(100))
    registration_date = Column(Date)
    total_units = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define the relationship with residents
    residents = relationship("Resident", back_populates="society", cascade="all, delete-orphan")
    # Define relationship with society_admins
    admins = relationship("SocietyAdmin", back_populates="society", cascade="all, delete-orphan")
    # Define relationship with society finances
    finances = relationship("SocietyFinance", back_populates="society", cascade="all, delete-orphan")


class Resident(Base):
    __tablename__ = "residents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    society_id = Column(UUID(as_uuid=True), ForeignKey("societies.id", ondelete="CASCADE"), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True)
    phone = Column(String(20))
    unit_number = Column(String(50), nullable=False)
    is_owner = Column(Boolean, default=False)
    is_committee_member = Column(Boolean, default=False)
    committee_role = Column(String(100))
    move_in_date = Column(Date)
    move_out_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define the relationships
    society = relationship("Society", back_populates="residents")
    finances = relationship("ResidentFinance", back_populates="resident", cascade="all, delete-orphan")
    # Define relationship with User model
    user = relationship("User", back_populates="resident", uselist=False)


class ResidentFinance(Base):
    __tablename__ = "resident_finances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resident_id = Column(UUID(as_uuid=True), ForeignKey("residents.id", ondelete="CASCADE"), nullable=False)
    transaction_type = Column(String(50), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="INR")
    due_date = Column(Date)
    payment_date = Column(Date)
    payment_method = Column(String(50))
    payment_status = Column(String(20), default="pending")
    description = Column(Text)
    invoice_number = Column(String(100))
    receipt_number = Column(String(100))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define the relationship
    resident = relationship("Resident", back_populates="finances")


# RBAC Models
class Role(Base):
    __tablename__ = "roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationships
    users = relationship("User", back_populates="role")
    permissions = relationship("RolePermission", back_populates="role", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    full_name = Column(String(255), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    resident_id = Column(UUID(as_uuid=True), ForeignKey("residents.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationships
    role = relationship("Role", back_populates="users")
    resident = relationship("Resident", back_populates="user")
    administered_societies = relationship("SocietyAdmin", back_populates="user", cascade="all, delete-orphan")


class Permission(Base):
    __tablename__ = "permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    resource_type = Column(String(50), nullable=False)  # societies, residents, finances, etc.
    action = Column(String(20), nullable=False)  # create, read, update, delete
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationships
    roles = relationship("RolePermission", back_populates="permission", cascade="all, delete-orphan")


class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    permission_id = Column(UUID(as_uuid=True), ForeignKey("permissions.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Define relationships
    role = relationship("Role", back_populates="permissions")
    permission = relationship("Permission", back_populates="roles")


class SocietyAdmin(Base):
    __tablename__ = "society_admins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    society_id = Column(UUID(as_uuid=True), ForeignKey("societies.id"), nullable=False)
    is_primary_admin = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationships
    user = relationship("User", back_populates="administered_societies")
    society = relationship("Society", back_populates="admins")


class SocietyFinance(Base):
    __tablename__ = "society_finances"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    society_id = Column(UUID(as_uuid=True), ForeignKey("societies.id"), nullable=False)
    expense_type = Column(String(50), nullable=False)  # regular, adhoc
    category = Column(String(50), nullable=False)  # security, housekeeping, etc.
    vendor_name = Column(String(255))
    expense_date = Column(Date, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="INR")
    payment_status = Column(String(20), nullable=False, default="pending")
    payment_date = Column(Date)
    payment_method = Column(String(50))
    invoice_number = Column(String(100))
    receipt_number = Column(String(100))
    description = Column(Text)
    recurring = Column(Boolean, default=False)
    recurring_frequency = Column(String(20))  # monthly, quarterly, annually
    next_due_date = Column(Date)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Define relationships
    society = relationship("Society", back_populates="finances")

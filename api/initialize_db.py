#!/usr/bin/env python3
"""
Script to initialize the database with sample data.
"""

import os
import sys
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from passlib.context import CryptContext

# Add parent directory to path to import models
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
import models
from database import engine, Base, get_db

# Load environment variables
load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_tables():
    """Create database tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

def insert_roles():
    """Insert roles into the database."""
    print("Inserting roles...")
    # Create a session
    db = next(get_db())
    
    # Check if roles already exist
    existing_roles = db.query(models.Role).all()
    if existing_roles:
        print(f"Roles already exist in the database ({len(existing_roles)} roles).")
        return existing_roles
    
    # Create roles
    roles = [
        models.Role(name="system_admin", description="Nivra system administrator with full access to all societies and features"),
        models.Role(name="society_admin", description="Administrator for specific societies with full CRUD access to their assigned societies"),
        models.Role(name="resident", description="Regular resident with limited access to their society and their own data"),
        models.Role(name="guest", description="Guest with read-only access to public society information")
    ]
    
    # Add to database
    for role in roles:
        db.add(role)
    
    db.commit()
    print(f"Added {len(roles)} roles to the database.")
    
    # Return the roles
    return db.query(models.Role).all()

def insert_permissions():
    """Insert permissions into the database."""
    print("Inserting permissions...")
    # Create a session
    db = next(get_db())
    
    # Check if permissions already exist
    existing_permissions = db.query(models.Permission).all()
    if existing_permissions:
        print(f"Permissions already exist in the database ({len(existing_permissions)} permissions).")
        return existing_permissions
    
    # Create permissions with required resource_type and action fields
    permissions = [
        # System Admin Permissions
        models.Permission(name="all_read", description="Read any data in the system", 
                          resource_type="all", action="read"),
        models.Permission(name="all_write", description="Create, update, or delete any data in the system", 
                          resource_type="all", action="write"),
        models.Permission(name="user_manage", description="Create, update, or delete users", 
                          resource_type="users", action="manage"),
        models.Permission(name="role_manage", description="Create, update, or delete roles", 
                          resource_type="roles", action="manage"),
        models.Permission(name="society_manage", description="Create, update, or delete societies", 
                          resource_type="societies", action="manage"),
        
        # Society Admin Permissions
        models.Permission(name="society_read", description="Read society data", 
                          resource_type="societies", action="read"),
        models.Permission(name="society_write", description="Update society data", 
                          resource_type="societies", action="write"),
        models.Permission(name="resident_manage", description="Create, update, or delete residents", 
                          resource_type="residents", action="manage"),
        models.Permission(name="finance_manage", description="Create, update, or delete financial records", 
                          resource_type="finances", action="manage"),
        models.Permission(name="notice_manage", description="Create, update, or delete notices", 
                          resource_type="notices", action="manage"),
        
        # Resident Permissions
        models.Permission(name="resident_read", description="Read resident data", 
                          resource_type="residents", action="read"),
        models.Permission(name="resident_update", description="Update own resident data", 
                          resource_type="residents", action="update"),
        models.Permission(name="payment_view", description="View payment history", 
                          resource_type="payments", action="read"),
        models.Permission(name="payment_make", description="Make payments", 
                          resource_type="payments", action="create"),
        models.Permission(name="notice_view", description="View notices", 
                          resource_type="notices", action="read"),
        
        # Guest Permissions
        models.Permission(name="public_view", description="View public information", 
                          resource_type="public", action="read")
    ]
    
    # Add to database
    for permission in permissions:
        db.add(permission)
    
    db.commit()
    print(f"Added {len(permissions)} permissions to the database.")
    
    # Return the permissions
    return db.query(models.Permission).all()

def assign_role_permissions(roles, permissions):
    """Assign permissions to roles."""
    print("Assigning permissions to roles...")
    # Create a session
    db = next(get_db())
    
    # Check if role_permissions already exist
    existing_role_permissions = db.query(models.RolePermission).all()
    if existing_role_permissions:
        print(f"Role permissions already exist in the database ({len(existing_role_permissions)} assignments).")
        return
    
    # Get role IDs by name
    role_ids = {role.name: role.id for role in roles}
    
    # Get permission IDs by name
    permission_ids = {permission.name: permission.id for permission in permissions}
    
    # Create role-permission assignments
    role_permissions = []
    
    # System Admin gets all permissions
    for perm_name, perm_id in permission_ids.items():
        role_permissions.append(models.RolePermission(
            role_id=role_ids["system_admin"],
            permission_id=perm_id
        ))
    
    # Society Admin gets society-scoped permissions
    society_admin_perms = [
        "society_read", "society_write",
        "resident_manage", "finance_manage", "notice_manage"
    ]
    for perm_name in society_admin_perms:
        if perm_name in permission_ids:
            role_permissions.append(models.RolePermission(
                role_id=role_ids["society_admin"],
                permission_id=permission_ids[perm_name]
            ))
    
    # Resident gets resident-scoped permissions
    resident_perms = [
        "resident_read", "resident_update",
        "payment_view", "payment_make", "notice_view"
    ]
    for perm_name in resident_perms:
        if perm_name in permission_ids:
            role_permissions.append(models.RolePermission(
                role_id=role_ids["resident"],
                permission_id=permission_ids[perm_name]
            ))
    
    # Guest gets only public view permission
    if "public_view" in permission_ids:
        role_permissions.append(models.RolePermission(
            role_id=role_ids["guest"],
            permission_id=permission_ids["public_view"]
        ))
    
    # Add to database
    for role_permission in role_permissions:
        db.add(role_permission)
    
    db.commit()
    print(f"Added {len(role_permissions)} role-permission assignments to the database.")

def create_admin_user(roles):
    """Create a default admin user."""
    print("Creating admin user...")
    # Create a session
    db = next(get_db())
    
    # Check if admin user already exists
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if admin_user:
        print("Admin user already exists.")
        return admin_user
    
    # Get system admin role ID
    system_admin_role = next((role for role in roles if role.name == "system_admin"), None)
    if not system_admin_role:
        print("Error: Could not find system_admin role.")
        return None
    
    # Hash the password
    password_hash = pwd_context.hash("changeme123")
    
    # Create admin user
    admin_user = models.User(
        username="admin",
        email="admin@nivra.com",
        password_hash=password_hash,
        full_name="System Administrator",
        role_id=system_admin_role.id,
        is_active=True
    )
    
    # Add to database
    db.add(admin_user)
    db.commit()
    print("Admin user created successfully.")
    
    return admin_user

def create_sample_society():
    """Create a sample society."""
    print("Creating sample society...")
    # Create a session
    db = next(get_db())
    
    # Check if society already exists - using a more direct approach
    try:
        # Try a more direct approach using SQL
        from sqlalchemy import text
        import uuid
        
        result = db.execute(text("SELECT COUNT(*) FROM societies WHERE name = 'Sample Society'"))
        count = result.scalar()
        exists = count is not None and count > 0
        
        if exists:
            print("Sample society already exists.")
            # Get the society ID
            result = db.execute(text("SELECT id FROM societies WHERE name = 'Sample Society'"))
            society_id = result.scalar()
            society = models.Society(id=society_id, name="Sample Society")  # Create a minimal object
            return society
    except Exception as e:
        print(f"Error checking for society: {str(e)}")
        # Continue with creation
    
    # Create a society with only the fields that exist in the database
    try:
        # Insert directly using SQL to avoid ORM issues
        from sqlalchemy import text
        import uuid
        
        result = db.execute(
            text("""
                INSERT INTO societies 
                (id, name, address, city, state, zipcode, country, registration_number, total_units, created_at, updated_at) 
                VALUES 
                (:id, :name, :address, :city, :state, :zipcode, :country, :reg_num, :units, NOW(), NOW())
                RETURNING id
            """), 
            {
                "id": str(uuid.uuid4()), 
                "name": "Sample Society", 
                "address": "123 Main St", 
                "city": "Sample City", 
                "state": "Sample State", 
                "zipcode": "12345", 
                "country": "India", 
                "reg_num": "REG12345", 
                "units": 100
            }
        )
        society_id = result.scalar()
        db.commit()
        
        # Create a minimal Society object to return
        society = models.Society(id=society_id, name="Sample Society")  # Create a minimal object
        print("Sample society created successfully.")
        return society
    except Exception as e:
        db.rollback()
        print(f"Error creating society: {str(e)}")
        return None

def create_society_admin(admin_user, society):
    """Create a society admin association."""
    print("Creating society admin association...")
    # Create a session
    db = next(get_db())
    
    # Check if society admin already exists
    society_admin = db.query(models.SocietyAdmin).filter(
        models.SocietyAdmin.user_id == admin_user.id,
        models.SocietyAdmin.society_id == society.id
    ).first()
    
    if society_admin:
        print("Society admin association already exists.")
        return society_admin
    
    # Create society admin
    society_admin = models.SocietyAdmin(
        user_id=admin_user.id,
        society_id=society.id,
        is_primary_admin=True
    )
    
    # Add to database
    db.add(society_admin)
    db.commit()
    print("Society admin association created successfully.")
    
    return society_admin

def main():
    """Main function to initialize the database."""
    print("Initializing Nivra database with sample data...")
    
    # Create tables
    create_tables()
    
    # Insert roles
    roles = insert_roles()
    
    # Insert permissions
    permissions = insert_permissions()
    
    # Assign permissions to roles
    assign_role_permissions(roles, permissions)
    
    # Create admin user
    admin_user = create_admin_user(roles)
    
    # Create sample society
    society = create_sample_society()
    
    # Create society admin association
    if admin_user and society:
        create_society_admin(admin_user, society)
    
    print("Database initialization complete!")

if __name__ == "__main__":
    main()

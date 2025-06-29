# Nivra Database

This directory contains the database setup scripts for the Nivra application.

## Database Structure

The database consists of the following tables:

### Core Tables
- `societies`: Store information about housing societies
- `residents`: Store information about residents living in the societies
- `resident_finances`: Store financial transactions related to residents

### Role-Based Access Control (RBAC) Tables
- `roles`: Defines user roles (system_admin, society_admin, committee_member, resident)
- `users`: User accounts with authentication information
- `permissions`: Available permissions in the system
- `role_permissions`: Mapping of permissions to roles
- `society_admins`: Mapping of admin users to societies they manage

## Setup Instructions

### Prerequisites
- PostgreSQL installed on your system
- PostgreSQL command-line tools (psql)

### Creating the Database

1. Connect to PostgreSQL as a user with create database privileges (usually postgres):
   ```
   psql -U postgres
   ```

2. Run the create database script:
   ```
   psql -U postgres -f create_database.sql
   ```

3. Create the tables:
   ```
   psql -U postgres -f create_tables.sql
   ```

4. (Optional) Load sample data:
   ```
   psql -U postgres -f sample_data.sql
   ```

5. (Optional) Load RBAC sample data:
   ```
   psql -U postgres -f rbac_sample_data.sql
   ```

### Reset Database

If you need to reset the database during development:
```
psql -U postgres -f reset_database.sql
```

Then follow the steps above to recreate the database and tables.

## Database Schema

### Societies Table
- `id`: UUID (Primary Key)
- `name`: Society name
- `address`: Complete address
- `city`: City name
- `state`: State/province name
- `zipcode`: Postal code
- `country`: Country name (default: India)
- `contact_email`: Contact email address
- `contact_phone`: Contact phone number
- `registration_number`: Society registration number
- `registration_date`: Date of registration
- `total_units`: Total number of housing units
- `created_at`: Timestamp of record creation
- `updated_at`: Timestamp of last update

### Residents Table
- `id`: UUID (Primary Key)
- `society_id`: Reference to societies table
- `first_name`: Resident's first name
- `last_name`: Resident's last name
- `email`: Resident's email (unique)
- `phone`: Resident's phone number
- `unit_number`: Apartment/unit number
- `is_owner`: Whether the resident owns the unit
- `is_committee_member`: Whether the resident is part of management committee
- `committee_role`: Role in the committee (if applicable)
- `move_in_date`: Date moved in
- `move_out_date`: Date moved out (if applicable)
- `created_at`: Timestamp of record creation
- `updated_at`: Timestamp of last update

### Resident Finances Table
- `id`: UUID (Primary Key)
- `resident_id`: Reference to residents table
- `transaction_type`: Type of financial transaction
- `amount`: Amount of the transaction
- `currency`: Currency code (default: INR)
- `due_date`: Date payment is due
- `payment_date`: Date payment was made
- `payment_method`: Method of payment
- `payment_status`: Status of payment (pending, paid, overdue)
- `description`: Description of the transaction
- `invoice_number`: Invoice reference number
- `receipt_number`: Receipt reference number
- `created_at`: Timestamp of record creation
- `updated_at`: Timestamp of last update

### Soft Delete Implementation

All primary tables include an `is_active` boolean flag (default TRUE). When a record needs to be "deleted", it should be marked as inactive (is_active = FALSE) rather than actually removed from the database. This allows for data recovery and maintains referential integrity.

### Role-Based Access Control System

The RBAC system is designed to control access to different parts of the application based on user roles:

1. **System Admin (Nivra Admin):**
   - Has full access to all societies and features
   - Can perform all CRUD operations on any data

2. **Society Admin:**
   - Has full CRUD access but only for their assigned societies
   - Can manage residents and finances within their society

3. **Committee Member:**
   - Can read, create, and update data but cannot delete
   - Limited to their own society

4. **Resident:**
   - Read-only access to society information
   - Can view their own financial records
   - Cannot modify data except their own profile

### Permission Structure

Permissions are structured as:
- `resource_type`: The type of resource (societies, residents, finances)
- `action`: The allowed action (create, read, update, delete)

For example, a committee member has permission `committee_society_update` which allows them to update society details but not delete them.

### Default Users

The sample data includes the following default users:
- System Admin: username `admin` / password `changeme123`
- Society Admin: username `societyadmin` / password `changeme123`
- Committee Member: username `committee1` / password `changeme123`
- Regular Resident: username `resident1` / password `changeme123`

**Important:** Change these passwords in production.

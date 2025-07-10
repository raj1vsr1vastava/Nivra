# Nivra Database

This directory contains the database setup scripts for the Nivra Society Management System.

## Files Overview

- `complete_schema.sql` - Complete database schema with all tables, indexes, triggers, and views (schema only, no data)
- `insert_data.sql` - Sample data for testing and development
- `reset_database.sql` - Utility script to reset the database
- `README.md` - This documentation file

## Database Structure

The database consists of the following tables:

### Core Tables
- `societies`: Store information about housing societies
- `residents`: Store information about residents living in the societies
- `resident_finances`: Store financial transactions related to residents
- `society_finances`: Store society-level income and expenses with categorization

### Role-Based Access Control (RBAC) Tables
- `roles`: Defines user roles (system_admin, society_admin, committee_member, resident, pending_user)
- `users`: User accounts with authentication information
- `permissions`: Available permissions in the system
- `role_permissions`: Mapping of permissions to roles
- `society_admins`: Mapping of admin users to societies they manage

### Society Join Request Workflow
- `society_join_requests`: Handles user requests to join societies
- `society_join_requests_with_details`: View for easy querying with user and society details

## Quick Setup

### Prerequisites
- PostgreSQL installed on your system
- PostgreSQL command-line tools (psql)

### One-Step Database Setup

1. **Create database schema:**
   ```bash
   psql -d postgres -f complete_schema.sql
   ```

2. **Add initial and sample data:**
   ```bash
   psql -d nivra -f insert_data.sql
   ```

### Manual Setup (Alternative)

If you prefer step-by-step setup:

1. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres
   ```

2. **Create database manually:**
   ```sql
   CREATE DATABASE nivra;
   \c nivra;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

3. **Run the schema file:**
   ```bash
   psql -d nivra -f complete_schema.sql
   ```

## Reset Database

To completely reset the database and start fresh:

```bash
psql -d postgres -f reset_database.sql
psql -d postgres -f complete_schema.sql
psql -d nivra -f insert_data.sql
```

## Default Login Credentials

After setup, you can login with:

- **System Admin:**
  - Username: `admin`
  - Password: `changeme123`

- **Society Admins (if sample data loaded):**
  - Green Valley: Username `gv_admin`, Password `changeme123`
  - Sunrise Towers: Username `st_admin`, Password `changeme123`
  - Metro Heights: Username `mh_admin`, Password `changeme123`

⚠️ **Important:** Change all default passwords after first login!

## Features

### Role-Based Access Control
- **System Admin:** Full access to all societies and features
- **Society Admin:** Access to specific societies they administer
- **Committee Member:** Read/write access with no delete permissions
- **Resident:** Read-only access to society information
- **Pending User:** Limited access until approved for a society

### Society Join Requests
- Users can request to join societies
- Admins can approve/reject requests
- Support for both user requests and admin invitations

### Financial Management
- Resident-level financial tracking
- Society-level income and expense tracking
- Categorized transactions (income vs expenses)
- Payment status tracking

### Multi-Society Support
- System supports multiple societies
- Role-based filtering ensures users only see relevant data
- Society admins manage only their assigned societies

## Database Schema Details

### Core Tables Structure

```
societies
├── id (UUID, primary key)
├── name, address, city, state, zipcode, country
├── contact_email, contact_phone
├── registration_number, registration_date
├── total_units, is_active
└── created_at, updated_at

residents
├── id (UUID, primary key)
├── society_id (foreign key)
├── first_name, last_name, email, phone
├── unit_number, is_owner
├── is_committee_member, committee_role
├── move_in_date, move_out_date, is_active
└── created_at, updated_at

resident_finances
├── id (UUID, primary key)
├── resident_id (foreign key)
├── transaction_type, amount, currency
├── due_date, payment_date, payment_method
├── payment_status, description
├── invoice_number, receipt_number, is_active
└── created_at, updated_at

society_finances
├── id (UUID, primary key)
├── society_id (foreign key)
├── expense_type, category, vendor_name
├── expense_date, amount, currency
├── payment_status, payment_date, payment_method
├── invoice_number, receipt_number, description
├── recurring, recurring_frequency, next_due_date
├── transaction_category (income/expense), is_active
└── created_at, updated_at
```

### RBAC Tables Structure

```
roles
├── id (UUID, primary key)
├── name (unique), description
└── created_at, updated_at

users
├── id (UUID, primary key)
├── username (unique), password_hash
├── email (unique), full_name
├── role_id (foreign key)
├── resident_id (foreign key, optional)
├── user_status, is_active, last_login
└── created_at, updated_at

permissions
├── id (UUID, primary key)
├── name (unique), description
├── resource_type, action
└── created_at, updated_at

society_admins
├── id (UUID, primary key)
├── user_id (foreign key)
├── society_id (foreign key)
├── is_primary_admin
└── created_at, updated_at
```

## Permission Structure

Permissions follow the pattern: `{scope}_{resource}_{action}`

- **Scope:** `all` (system-wide), `society` (society-specific), `committee`, `resident`
- **Resource:** `societies`, `residents`, `finances`, `join_requests`
- **Action:** `create`, `read`, `update`, `delete`, `approve`, `reject`, `cancel`

## Troubleshooting

### Common Issues

1. **Permission denied errors:**
   - Ensure you're running as a PostgreSQL superuser or user with database creation privileges

2. **Extension not found:**
   - Make sure PostgreSQL contrib package is installed: `postgresql-contrib`

3. **Database already exists:**
   - Use the reset script or manually drop the database first

### Support

For issues or questions, please refer to the main application documentation or contact the development team.

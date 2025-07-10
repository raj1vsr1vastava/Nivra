-- Nivra Society Management System - Complete Database Schema
-- This file contains all table creation statements for the Nivra database
-- Run this file to create the complete database structure

-- Create the Nivra database
CREATE DATABASE nivra;

-- Connect to the Nivra database
\c nivra;

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- CORE TABLES
-- ================================================

-- Create societies table
CREATE TABLE societies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zipcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'India',
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    registration_number VARCHAR(100),
    registration_date DATE,
    total_units INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create residents table
CREATE TABLE residents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255), -- Removed UNIQUE constraint to allow same person to have multiple units or family members to share
    phone VARCHAR(20),
    unit_number VARCHAR(50) NOT NULL, -- Multiple residents can share the same unit (family members)
    is_owner BOOLEAN DEFAULT FALSE,
    is_committee_member BOOLEAN DEFAULT FALSE,
    committee_role VARCHAR(100),
    move_in_date DATE,
    move_out_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create resident_finances table
CREATE TABLE resident_finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resident_id UUID NOT NULL REFERENCES residents(id),
    transaction_type VARCHAR(50) NOT NULL, -- maintenance, penalty, special_charge, etc.
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    due_date DATE,
    payment_date DATE,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, etc.
    description TEXT,
    invoice_number VARCHAR(100),
    receipt_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create society_finances table for common amenities and services
CREATE TABLE society_finances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    society_id UUID NOT NULL REFERENCES societies(id),
    expense_type VARCHAR(50) NOT NULL CHECK (expense_type IN ('income', 'expense', 'regular', 'adhoc', 'maintenance_fees', 'parking_fees', 'amenity_fees', 'late_fees', 'interest_income', 'rental_income', 'deposits', 'other_income')),
    category VARCHAR(50) NOT NULL, -- security, housekeeping, gardener, electricity, water, event, maintenance, parking, etc.
    vendor_name VARCHAR(255),
    expense_date DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, paid, overdue, partially_paid
    payment_date DATE,
    payment_method VARCHAR(50),
    invoice_number VARCHAR(100),
    receipt_number VARCHAR(100),
    description TEXT,
    recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency VARCHAR(20), -- monthly, quarterly, annually, etc.
    next_due_date DATE,
    transaction_category VARCHAR(20) DEFAULT 'expense' CHECK (transaction_category IN ('income', 'expense')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- RBAC TABLES (Role-Based Access Control)
-- ================================================

-- Create roles table for RBAC
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    resident_id UUID REFERENCES residents(id), -- Link to resident if applicable
    user_status VARCHAR(20) DEFAULT 'pending_society', -- 'pending_society', 'active', 'inactive'
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource_type VARCHAR(50) NOT NULL, -- societies, residents, finances, join_requests, etc.
    action VARCHAR(20) NOT NULL, -- create, read, update, delete
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create role_permissions table (many-to-many relationship)
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id),
    permission_id UUID NOT NULL REFERENCES permissions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, permission_id)
);

-- Create society_admins table to connect users to societies they administer
CREATE TABLE society_admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    society_id UUID NOT NULL REFERENCES societies(id),
    is_primary_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, society_id)
);

-- ================================================
-- SOCIETY JOIN REQUEST WORKFLOW TABLES
-- ================================================

-- Create society_join_requests table
CREATE TABLE society_join_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    society_id UUID NOT NULL REFERENCES societies(id),
    request_type VARCHAR(20) NOT NULL DEFAULT 'join', -- 'join' or 'invite'
    requested_unit_number VARCHAR(50),
    is_owner BOOLEAN DEFAULT FALSE,
    request_message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    reviewed_by UUID REFERENCES users(id), -- Admin who reviewed the request
    reviewed_at TIMESTAMP WITH TIME ZONE,
    review_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, society_id, status) -- Prevent duplicate pending requests
);

-- ================================================
-- TRIGGERS AND FUNCTIONS
-- ================================================

-- Add trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
CREATE TRIGGER update_societies_updated_at
    BEFORE UPDATE ON societies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_residents_updated_at
    BEFORE UPDATE ON residents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resident_finances_updated_at
    BEFORE UPDATE ON resident_finances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_society_finances_updated_at
    BEFORE UPDATE ON society_finances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at
    BEFORE UPDATE ON permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_society_admins_updated_at
    BEFORE UPDATE ON society_admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_society_join_requests_updated_at
    BEFORE UPDATE ON society_join_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Core table indexes
CREATE INDEX idx_residents_society_id ON residents(society_id);
CREATE INDEX idx_resident_finances_resident_id ON resident_finances(resident_id);
CREATE INDEX idx_resident_finances_payment_status ON resident_finances(payment_status);
CREATE INDEX idx_resident_finances_due_date ON resident_finances(due_date);
CREATE INDEX idx_society_finances_society_id ON society_finances(society_id);
CREATE INDEX idx_society_finances_category ON society_finances(category);
CREATE INDEX idx_society_finances_expense_type ON society_finances(expense_type);
CREATE INDEX idx_society_finances_expense_date ON society_finances(expense_date);
CREATE INDEX idx_society_finances_payment_status ON society_finances(payment_status);
CREATE INDEX idx_society_finances_transaction_category ON society_finances(transaction_category);

-- RBAC table indexes
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_resident_id ON users(resident_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_society_admins_user_id ON society_admins(user_id);
CREATE INDEX idx_society_admins_society_id ON society_admins(society_id);

-- Join request table indexes
CREATE INDEX idx_society_join_requests_user_id ON society_join_requests(user_id);
CREATE INDEX idx_society_join_requests_society_id ON society_join_requests(society_id);
CREATE INDEX idx_society_join_requests_status ON society_join_requests(status);
CREATE INDEX idx_society_join_requests_reviewed_by ON society_join_requests(reviewed_by);

-- ================================================
-- VIEWS
-- ================================================

-- Create a view for easy querying of join requests with user and society details
CREATE VIEW society_join_requests_with_details AS
SELECT 
    sjr.id,
    sjr.user_id,
    sjr.society_id,
    sjr.request_type,
    sjr.requested_unit_number,
    sjr.is_owner,
    sjr.request_message,
    sjr.status,
    sjr.reviewed_by,
    sjr.reviewed_at,
    sjr.review_message,
    sjr.created_at,
    sjr.updated_at,
    u.username,
    u.email,
    u.full_name as user_full_name,
    s.name as society_name,
    s.address as society_address,
    s.city as society_city,
    reviewer.full_name as reviewer_name
FROM society_join_requests sjr
JOIN users u ON sjr.user_id = u.id
JOIN societies s ON sjr.society_id = s.id
LEFT JOIN users reviewer ON sjr.reviewed_by = reviewer.id;

-- ================================================
-- COMMENTS FOR SCHEMA DOCUMENTATION
-- ================================================

-- Add comments to clarify the schema
COMMENT ON COLUMN society_finances.transaction_category IS 'Categorizes whether this is an income or expense transaction';
COMMENT ON COLUMN society_finances.expense_type IS 'For expenses: regular/adhoc. For income: type of income (maintenance_fees, parking_fees, etc.)';
COMMENT ON COLUMN society_finances.category IS 'Detailed category - for expenses: security, housekeeping, etc. For income: maintenance, parking, amenities, etc.';
COMMENT ON COLUMN users.user_status IS 'Status of user in the system: pending_society (waiting for society approval), active, inactive';
COMMENT ON TABLE society_join_requests IS 'Handles user requests to join societies and admin invitations';
COMMENT ON TABLE society_admins IS 'Maps users to societies they administer - supports multiple admins per society';

-- ================================================
-- COMPLETION MESSAGE
-- ================================================
\echo 'Nivra database schema created successfully!'
\echo 'Schema is now ready. Run insert_data.sql to populate with initial data.'

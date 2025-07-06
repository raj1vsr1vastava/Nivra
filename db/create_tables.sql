-- Connect to the Nivra database
\c nivra;

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
    expense_type VARCHAR(50) NOT NULL, -- regular, adhoc
    category VARCHAR(50) NOT NULL, -- security, housekeeping, gardener, electricity, water, event, etc.
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add income tracking to society_finances table
-- Update the expense_type to include income transactions
ALTER TABLE society_finances 
DROP CONSTRAINT IF EXISTS society_finances_expense_type_check;

ALTER TABLE society_finances 
ADD CONSTRAINT society_finances_transaction_type_check 
CHECK (expense_type IN ('income', 'expense', 'regular', 'adhoc'));

-- Add a new column to better categorize income vs expenses
ALTER TABLE society_finances 
ADD COLUMN transaction_category VARCHAR(20) DEFAULT 'expense' 
CHECK (transaction_category IN ('income', 'expense'));

-- Update existing records to mark them as expenses
UPDATE society_finances SET transaction_category = 'expense' WHERE transaction_category IS NULL;

-- Add some sample income categories for reference
-- Common income sources for societies:
-- - maintenance_fees (monthly maintenance from residents)
-- - parking_fees
-- - amenity_fees
-- - late_fees
-- - interest_income
-- - rental_income (from common areas)
-- - deposits
-- - other_income

-- Create an index for better performance on the new column
CREATE INDEX idx_society_finances_transaction_category ON society_finances(transaction_category);

-- Add comments to clarify the schema
COMMENT ON COLUMN society_finances.transaction_category IS 'Categorizes whether this is an income or expense transaction';
COMMENT ON COLUMN society_finances.expense_type IS 'For expenses: regular/adhoc. For income: type of income (maintenance_fees, parking_fees, etc.)';
COMMENT ON COLUMN society_finances.category IS 'Detailed category - for expenses: security, housekeeping, etc. For income: maintenance, parking, amenities, etc.';

-- Create indexes for better performance
CREATE INDEX idx_residents_society_id ON residents(society_id);
CREATE INDEX idx_resident_finances_resident_id ON resident_finances(resident_id);
CREATE INDEX idx_resident_finances_payment_status ON resident_finances(payment_status);
CREATE INDEX idx_resident_finances_due_date ON resident_finances(due_date);
CREATE INDEX idx_society_finances_society_id ON society_finances(society_id);
CREATE INDEX idx_society_finances_category ON society_finances(category);
CREATE INDEX idx_society_finances_expense_type ON society_finances(expense_type);
CREATE INDEX idx_society_finances_expense_date ON society_finances(expense_date);
CREATE INDEX idx_society_finances_payment_status ON society_finances(payment_status);

-- Add trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
    resource_type VARCHAR(50) NOT NULL, -- societies, residents, finances, etc.
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

-- Add triggers for the new tables
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

-- Create indexes for better performance
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_resident_id ON users(resident_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_society_admins_user_id ON society_admins(user_id);
CREATE INDEX idx_society_admins_society_id ON society_admins(society_id);

-- Insert initial RBAC roles
INSERT INTO roles (name, description) VALUES 
('system_admin', 'Nivra system administrator with full access to all societies and features'),
('society_admin', 'Administrator for specific societies with full CRUD access to their assigned societies'),
('committee_member', 'Committee members with read, create, and update permissions but no delete permissions'),
('resident', 'Regular residents with read-only access to society information');

-- Insert initial permissions
-- System Admin Permissions
INSERT INTO permissions (name, description, resource_type, action) VALUES
('all_societies_create', 'Create any society', 'societies', 'create'),
('all_societies_read', 'View any society', 'societies', 'read'),
('all_societies_update', 'Update any society', 'societies', 'update'),
('all_societies_delete', 'Mark any society as deleted', 'societies', 'delete'),

('all_residents_create', 'Create any resident', 'residents', 'create'),
('all_residents_read', 'View any resident', 'residents', 'read'),
('all_residents_update', 'Update any resident', 'residents', 'update'),
('all_residents_delete', 'Mark any resident as deleted', 'residents', 'delete'),

('all_finances_create', 'Create any financial record', 'finances', 'create'),
('all_finances_read', 'View any financial record', 'finances', 'read'),
('all_finances_update', 'Update any financial record', 'finances', 'update'),
('all_finances_delete', 'Mark any financial record as deleted', 'finances', 'delete'),

-- Society Admin Permissions (scoped to their society)
('society_create', 'Create society details for assigned society', 'societies', 'create'),
('society_read', 'View society details for assigned society', 'societies', 'read'),
('society_update', 'Update society details for assigned society', 'societies', 'update'),
('society_delete', 'Mark assigned society as deleted', 'societies', 'delete'),

('society_residents_create', 'Create residents in assigned society', 'residents', 'create'),
('society_residents_read', 'View residents in assigned society', 'residents', 'read'),
('society_residents_update', 'Update residents in assigned society', 'residents', 'update'),
('society_residents_delete', 'Mark residents in assigned society as deleted', 'residents', 'delete'),

('society_finances_create', 'Create financial records in assigned society', 'finances', 'create'),
('society_finances_read', 'View financial records in assigned society', 'finances', 'read'),
('society_finances_update', 'Update financial records in assigned society', 'finances', 'update'),
('society_finances_delete', 'Mark financial records in assigned society as deleted', 'finances', 'delete'),

-- Committee Member Permissions
('committee_society_read', 'View society details', 'societies', 'read'),
('committee_society_update', 'Update society details', 'societies', 'update'),
('committee_residents_read', 'View residents', 'residents', 'read'),
('committee_residents_create', 'Create residents', 'residents', 'create'),
('committee_residents_update', 'Update residents', 'residents', 'update'),
('committee_finances_read', 'View financial records', 'finances', 'read'),
('committee_finances_create', 'Create financial records', 'finances', 'create'),
('committee_finances_update', 'Update financial records', 'finances', 'update'),

-- Resident Permissions (read-only)
('resident_society_read', 'View society details', 'societies', 'read'),
('resident_residents_read', 'View residents', 'residents', 'read'),
('resident_finances_read', 'View financial records', 'finances', 'read'),
('resident_own_profile_update', 'Update own profile information', 'residents', 'update');

-- Assign permissions to roles
-- System Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'system_admin'),
    id
FROM permissions;

-- Society Admin gets society-scoped permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'society_admin'),
    id
FROM permissions 
WHERE name LIKE 'society_%';

-- Committee Member gets committee permissions (no delete)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'committee_member'),
    id
FROM permissions 
WHERE name LIKE 'committee_%';

-- Resident gets read-only permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'resident'),
    id
FROM permissions 
WHERE name LIKE 'resident_%';

-- Create a default system admin user (password should be changed immediately)
INSERT INTO users (username, password_hash, email, full_name, role_id)
VALUES (
    'admin', 
    -- This is a placeholder hash for 'changeme123' - in a real app, generate a proper hash
    '$2b$12$szDrnX9jtz4JE64v4QE14.2gkhIQx/NpA/ProxHHBniH7iAyFCBEC', 
    'admin@nivra.com', 
    'System Administrator',
    (SELECT id FROM roles WHERE name = 'system_admin')
);

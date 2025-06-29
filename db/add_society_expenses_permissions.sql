-- Connect to the Nivra database
\c nivra;

-- Add new permissions for society expenses
INSERT INTO permissions (name, description, resource_type, action) VALUES
-- System Admin Permissions
('all_society_expenses_create', 'Create any society expense record', 'society_expenses', 'create'),
('all_society_expenses_read', 'View any society expense record', 'society_expenses', 'read'),
('all_society_expenses_update', 'Update any society expense record', 'society_expenses', 'update'),
('all_society_expenses_delete', 'Mark any society expense record as deleted', 'society_expenses', 'delete'),

-- Society Admin Permissions
('society_expenses_create', 'Create expense records for assigned society', 'society_expenses', 'create'),
('society_expenses_read', 'View expense records for assigned society', 'society_expenses', 'read'),
('society_expenses_update', 'Update expense records for assigned society', 'society_expenses', 'update'),
('society_expenses_delete', 'Mark expense records for assigned society as deleted', 'society_expenses', 'delete'),

-- Committee Member Permissions
('committee_expenses_read', 'View society expense records', 'society_expenses', 'read'),
('committee_expenses_create', 'Create society expense records', 'society_expenses', 'create'),
('committee_expenses_update', 'Update society expense records', 'society_expenses', 'update'),

-- Resident Permissions (read-only)
('resident_expenses_read', 'View society expense records', 'society_expenses', 'read');

-- Assign permissions to roles
-- System Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'system_admin'),
    id
FROM permissions 
WHERE name IN (
    'all_society_expenses_create',
    'all_society_expenses_read',
    'all_society_expenses_update',
    'all_society_expenses_delete'
);

-- Society Admin gets society-scoped permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'society_admin'),
    id
FROM permissions 
WHERE name IN (
    'society_expenses_create',
    'society_expenses_read',
    'society_expenses_update',
    'society_expenses_delete'
);

-- Committee Member gets committee permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'committee_member'),
    id
FROM permissions 
WHERE name IN (
    'committee_expenses_read',
    'committee_expenses_create',
    'committee_expenses_update'
);

-- Resident gets read-only permission
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'resident'),
    id
FROM permissions 
WHERE name = 'resident_expenses_read';

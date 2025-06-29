-- Connect to the Nivra database
\c nivra;

-- Add new permissions for society finances
INSERT INTO permissions (name, description, resource_type, action) VALUES
-- System Admin Permissions
('all_society_finances_create', 'Create any society finance record', 'society_finances', 'create'),
('all_society_finances_read', 'View any society finance record', 'society_finances', 'read'),
('all_society_finances_update', 'Update any society finance record', 'society_finances', 'update'),
('all_society_finances_delete', 'Mark any society finance record as deleted', 'society_finances', 'delete'),

-- Society Admin Permissions
('society_finances_create', 'Create finance records for assigned society', 'society_finances', 'create'),
('society_finances_read', 'View finance records for assigned society', 'society_finances', 'read'),
('society_finances_update', 'Update finance records for assigned society', 'society_finances', 'update'),
('society_finances_delete', 'Mark finance records for assigned society as deleted', 'society_finances', 'delete'),

-- Committee Member Permissions
('committee_finances_read', 'View society finance records', 'society_finances', 'read'),
('committee_finances_create', 'Create society finance records', 'society_finances', 'create'),
('committee_finances_update', 'Update society finance records', 'society_finances', 'update'),

-- Resident Permissions (read-only)
('resident_finances_read', 'View society finance records', 'society_finances', 'read');

-- Assign permissions to roles
-- System Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'system_admin'),
    id
FROM permissions 
WHERE name IN (
    'all_society_finances_create',
    'all_society_finances_read',
    'all_society_finances_update',
    'all_society_finances_delete'
);

-- Society Admin gets society-scoped permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'society_admin'),
    id
FROM permissions 
WHERE name IN (
    'society_finances_create',
    'society_finances_read',
    'society_finances_update',
    'society_finances_delete'
);

-- Committee Member gets committee permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'committee_member'),
    id
FROM permissions 
WHERE name IN (
    'committee_finances_read',
    'committee_finances_create',
    'committee_finances_update'
);

-- Resident gets read-only permission
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'resident'),
    id
FROM permissions 
WHERE name = 'resident_finances_read';

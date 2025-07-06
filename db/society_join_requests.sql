-- Additional tables for society join request workflow
-- Connect to the Nivra database
\c nivra;

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

-- Create indexes for better performance
CREATE INDEX idx_society_join_requests_user_id ON society_join_requests(user_id);
CREATE INDEX idx_society_join_requests_society_id ON society_join_requests(society_id);
CREATE INDEX idx_society_join_requests_status ON society_join_requests(status);
CREATE INDEX idx_society_join_requests_reviewed_by ON society_join_requests(reviewed_by);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_society_join_requests_updated_at
    BEFORE UPDATE ON society_join_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add user_status to users table to track if user is waiting for society approval
ALTER TABLE users ADD COLUMN user_status VARCHAR(20) DEFAULT 'pending_society'; -- 'pending_society', 'active', 'inactive'

-- Create a new role for users who signed up but haven't joined any society yet
INSERT INTO roles (name, description) VALUES 
('pending_user', 'User who signed up but hasn\'t been approved to join any society yet');

-- Add permissions for managing society join requests
INSERT INTO permissions (name, description, resource_type, action) VALUES
('society_join_requests_read', 'View society join requests', 'join_requests', 'read'),
('society_join_requests_approve', 'Approve society join requests', 'join_requests', 'update'),
('society_join_requests_reject', 'Reject society join requests', 'join_requests', 'update'),
('society_join_requests_cancel', 'Cancel own society join requests', 'join_requests', 'update');

-- Assign permissions to society admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'society_admin'),
    id
FROM permissions 
WHERE name IN ('society_join_requests_read', 'society_join_requests_approve', 'society_join_requests_reject');

-- Assign cancel permission to pending users
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'pending_user'),
    id
FROM permissions 
WHERE name = 'society_join_requests_cancel';

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

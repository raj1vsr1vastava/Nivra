-- Nivra Database Data Export
-- This file contains INSERT statements for all data in the Nivra database
-- Run this after creating the tables to populate the database with existing data

-- Connect to the Nivra database
\c nivra;

-- Disable foreign key checks temporarily for easier insertion
SET session_replication_role = replica;

-- Insert roles data (matching actual database values)
INSERT INTO roles (id, name, description, created_at, updated_at) VALUES 
('00cfc5e6-823b-4d8a-820f-69e8e8117b88', 'Super User', 'Nivra system administrator with full access to all societies and features', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('598878a9-171c-4389-a50c-055065354e1e', 'Society Admin', 'Administrator for specific societies with full CRUD access to their assigned societies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('0943d1c1-eca2-4741-b399-7fae9a59a37b', 'Committee Member', 'RWA member', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('36c3ea70-cf1a-4ddd-be73-60eb583042ee', 'resident', 'Regular resident with limited access to their society and their own data', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('24155c91-c14e-4217-8849-a97a243e14ea', 'guest', 'Guest with read-only access to public society information', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert permissions data
INSERT INTO permissions (id, name, description, resource_type, action, created_at, updated_at) VALUES
-- System Admin Permissions
('650e8400-e29b-41d4-a716-446655440001', 'all_societies_create', 'Create any society', 'societies', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440002', 'all_societies_read', 'View any society', 'societies', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440003', 'all_societies_update', 'Update any society', 'societies', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440004', 'all_societies_delete', 'Mark any society as deleted', 'societies', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('650e8400-e29b-41d4-a716-446655440005', 'all_residents_create', 'Create any resident', 'residents', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440006', 'all_residents_read', 'View any resident', 'residents', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440007', 'all_residents_update', 'Update any resident', 'residents', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440008', 'all_residents_delete', 'Mark any resident as deleted', 'residents', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('650e8400-e29b-41d4-a716-446655440009', 'all_finances_create', 'Create any financial record', 'finances', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440010', 'all_finances_read', 'View any financial record', 'finances', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440011', 'all_finances_update', 'Update any financial record', 'finances', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440012', 'all_finances_delete', 'Mark any financial record as deleted', 'finances', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Society Admin Permissions
('650e8400-e29b-41d4-a716-446655440013', 'society_create', 'Create society details for assigned society', 'societies', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440014', 'society_read', 'View society details for assigned society', 'societies', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440015', 'society_update', 'Update society details for assigned society', 'societies', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440016', 'society_delete', 'Mark assigned society as deleted', 'societies', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('650e8400-e29b-41d4-a716-446655440017', 'society_residents_create', 'Create residents in assigned society', 'residents', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440018', 'society_residents_read', 'View residents in assigned society', 'residents', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440019', 'society_residents_update', 'Update residents in assigned society', 'residents', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440020', 'society_residents_delete', 'Mark residents in assigned society as deleted', 'residents', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('650e8400-e29b-41d4-a716-446655440021', 'society_finances_create', 'Create financial records in assigned society', 'finances', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440022', 'society_finances_read', 'View financial records in assigned society', 'finances', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440023', 'society_finances_update', 'Update financial records in assigned society', 'finances', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440024', 'society_finances_delete', 'Mark financial records in assigned society as deleted', 'finances', 'delete', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Committee Member Permissions
('650e8400-e29b-41d4-a716-446655440025', 'committee_society_read', 'View society details', 'societies', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440026', 'committee_society_update', 'Update society details', 'societies', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440027', 'committee_residents_read', 'View residents', 'residents', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440028', 'committee_residents_create', 'Create residents', 'residents', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440029', 'committee_residents_update', 'Update residents', 'residents', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440030', 'committee_finances_read', 'View financial records', 'finances', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440031', 'committee_finances_create', 'Create financial records', 'finances', 'create', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440032', 'committee_finances_update', 'Update financial records', 'finances', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Resident Permissions
('650e8400-e29b-41d4-a716-446655440033', 'resident_society_read', 'View society details', 'societies', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440034', 'resident_residents_read', 'View residents', 'residents', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440035', 'resident_finances_read', 'View financial records', 'finances', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440036', 'resident_own_profile_update', 'Update own profile information', 'residents', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Join Request Permissions
('650e8400-e29b-41d4-a716-446655440037', 'society_join_requests_read', 'View society join requests', 'join_requests', 'read', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440038', 'society_join_requests_approve', 'Approve society join requests', 'join_requests', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440039', 'society_join_requests_reject', 'Reject society join requests', 'join_requests', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('650e8400-e29b-41d4-a716-446655440040', 'society_join_requests_cancel', 'Cancel own society join requests', 'join_requests', 'update', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert role_permissions mapping
INSERT INTO role_permissions (id, role_id, permission_id, created_at) VALUES
-- System Admin gets all permissions
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440002', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440003', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440004', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440005', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440006', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440007', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440008', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440009', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440010', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440011', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440012', CURRENT_TIMESTAMP),

-- Society Admin gets society-scoped permissions
('750e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440013', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440014', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440015', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440016', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440017', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440018', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440019', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440020', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440021', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440022', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440023', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440024', CURRENT_TIMESTAMP),

-- Committee Member gets committee permissions
('750e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440025', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440026', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440027', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440028', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440029', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440030', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440031', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440032', CURRENT_TIMESTAMP),

-- Resident gets read-only permissions
('750e8400-e29b-41d4-a716-446655440045', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440033', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440034', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440047', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440035', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440036', CURRENT_TIMESTAMP),

-- System Admin gets new join request permissions (37-40)
('750e8400-e29b-41d4-a716-446655440049', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440037', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440038', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440039', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440040', CURRENT_TIMESTAMP),

-- Society Admin gets join request read/approve/reject permissions 
('750e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440037', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440038', CURRENT_TIMESTAMP),
('750e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440039', CURRENT_TIMESTAMP),

-- Pending user gets cancel permission for join requests
('750e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440040', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample societies data
INSERT INTO societies (id, name, address, city, state, zipcode, country, contact_email, contact_phone, registration_number, registration_date, total_units, is_active, created_at, updated_at) VALUES
('7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Natura', 'Chambenahalli, Sarjapur Road', 'Bangalore', 'Karnataka', '562125', 'India', 'contact@natura.com', '9876543210', 'GVA-12345-2020', '2020-04-15', 47, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('23a1e919-b938-44ed-a80d-343a3645b64c', 'Natura Phase 2', 'Sarjapur road', 'Bengaluru', 'Karnataka', '562125', 'India', 'naturaphase2@natura.com', '9988776655', 'REG12345', NULL, 35, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3771805e-a609-4434-a8f2-603301ba2019', 'Nivra', 'Default', 'Default', 'Default', '100001', 'Default', 'Default@default.com', '1234567890', 'Default', NULL, 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert default system admin user
INSERT INTO users (id, username, password_hash, email, full_name, role_id, resident_id, is_active, last_login, created_at, updated_at) VALUES
('e4e99eef-b4bb-44ad-afba-5d1e97790220', 'admin', '$2b$12$szDrnX9jtz4JE64v4QE14.2gkhIQx/NpA/ProxHHBniH7iAyFCBEC', 'admin@nivra.com', 'Nivra Admin', '550e8400-e29b-41d4-a716-446655440001', NULL, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample society admin users
INSERT INTO users (id, username, password_hash, email, full_name, role_id, resident_id, is_active, last_login, created_at, updated_at) VALUES
('ad7cddc4-612e-4c40-ba76-dddd4fe61c65', 'Shimjit', '$2b$12$szDrnX9jtz4JE64v4QE14.2gkhIQx/NpA/ProxHHBniH7iAyFCBEC', 'shimjit@gmail.com', 'Shimjit', '550e8400-e29b-41d4-a716-446655440002', NULL, true, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert society_admins mapping
INSERT INTO society_admins (id, user_id, society_id, is_primary_admin, created_at, updated_at) VALUES
('6d5318de-cc73-4cba-b789-5ed047c95a9f', 'ad7cddc4-612e-4c40-ba76-dddd4fe61c65', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('25bd7608-936b-4225-9256-dfe844ea752f', 'e4e99eef-b4bb-44ad-afba-5d1e97790220', '23a1e919-b938-44ed-a80d-343a3645b64c', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert all residents data from the running database (47 total residents)
INSERT INTO residents (id, society_id, first_name, last_name, email, phone, unit_number, is_owner, is_committee_member, committee_role, move_in_date, move_out_date, is_active, created_at, updated_at) VALUES
('c3c162df-6fcd-453b-9320-ae2414859732', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Sandhya', 'Sathish', 'sandhya@sathish.com', '1918334414', 'A-01', true, false, NULL, '2017-04-01', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f38bc53e-13ba-42be-8fc2-e84ee281abf2', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Vidya', 'Singh', 'vidya@singh.com', '1426862461', 'A-02', true, false, NULL, '2017-04-02', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ffb46bf2-8831-415e-84c5-370bc4cf5eea', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Almas', 'Zaidi', 'almas@zaidi.com', '5610142338', 'A-03', true, false, NULL, '2017-04-03', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('37b54d01-1bbb-4118-a2ad-4d3f52ddb06a', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Saurabh', 'Saurabh', 'saurabh@saurabh.com', '80186692', 'A-04', true, false, NULL, '2017-04-04', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('815c4c84-9350-4611-8522-ec8e4115477a', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Pratap', 'Reddy', 'pratap@reddy.com', '379763869', 'A-05', false, false, NULL, '2017-04-05', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('0dbd81e5-197f-4c61-8723-40c32dba8dbe', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Naveen', 'Reddy', 'naveen@reddy.com', '9985186736', 'A-06', true, true, 'Secretary', '2017-04-06', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('8b01d9c7-4678-437a-8ce8-19511e1ac7b3', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Pradeep', 'Pradeep', 'pradeep@pradeep.com', '6932095553', 'A-07', true, false, NULL, '2017-04-07', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('9bbb72d6-3f65-404a-b048-41d3d3211f86', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'SHASHANK', 'SHASHANK', 'shashank@shashank.com', '9063899258', 'A-08', false, false, NULL, '2017-04-08', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('929046a7-a62f-4cab-b7cc-9b7f8c9a6e9a', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Chandrashekaran', 'Vamsee', 'chandrashekaran@vamsee.com', '893648150', 'A-09', false, false, NULL, '2017-04-09', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('310a14e4-b06d-466c-a0d7-5d178bf33e1b', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'CV', 'Subramanniyam', 'c@subramanniyam.com', '9519113763', 'A-10', true, false, NULL, '2017-04-10', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('6c1f4a12-359c-426b-8e89-18ae77a34890', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'CV', 'Subramanniyam', 'c@subramanniyam.com', '6201949903', 'A-11', false, false, NULL, '2017-04-11', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ae2a49d6-9ed7-4da5-a18d-6c29b68f1779', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Shanu', 'Saha', 'shanu@saha.com', '5921177130', 'A-12', true, false, NULL, '2017-04-12', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('876b08c7-8638-4ab7-a1d1-4cb7d79e5365', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Tanjamma', 'Tanjamma', 'tanjamma@tanjamma.com', '996746332', 'A-13', false, false, NULL, '2017-04-13', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f3ec48ad-2f43-48c0-8a84-330413f50b37', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'SHASHANK', 'SHASHANK', 'shashank@shashank.com', '3819316142', 'A-14', false, false, NULL, '2017-04-14', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e0e750b4-39dc-403f-9dbd-0b5e09e9c5b3', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'SHASHANK', 'SHASHANK', 'shashank@shashank.com', '1826096416', 'A-15', false, false, NULL, '2017-04-15', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d77944af-ad45-476a-b6a4-2f4d8f19b3c7', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Suchit', 'Prasanna', 'suchit@prasanna.com', '6327002766', 'A-16', true, false, NULL, '2017-04-16', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c41616a3-4157-46fe-9fc4-59400a5921d9', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Pratyush', 'Dutta', 'pratyush@dutta.com', '5824530274', 'A-17', true, false, NULL, '2017-04-17', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c235ab77-5530-4af8-89a9-2ad08c22f9c4', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'SHASHANK', 'SHASHANK', 'shashank@shashank.com', '231819926', 'A-18', false, false, NULL, '2017-04-18', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('86b3cb25-1eea-4188-811a-47cd42859671', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Sudeep', 'Singh', 'sudeep@singh.com', '6143298055', 'A-19', false, false, NULL, '2017-04-19', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d584f2bb-68a9-4584-b0b9-3069b9d4b6fb', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Susanta', 'Sahoo', 'susanta@sahoo.com', '9261129064', 'A-20', false, false, NULL, '2017-04-20', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('5dcc9e10-3004-43f3-b43a-9fe57fa0ac65', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Santosh', 'Kumar', 'santosh@kumar.com', '4848278112', 'A-21', true, false, NULL, '2017-04-21', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('82447ddd-c784-42ef-9d5f-15e9f5af2f12', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Tanjamma', 'Tanjamma', 'tanjamma@tanjamma.com', '6414003653', 'B-01', false, false, NULL, '2017-04-22', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('31aded5f-ad68-4292-9435-611f6a52222c', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Chandrashekaran', 'Vamsee', 'chandrashekaran@vamsee.com', '4524131814', 'B-02', false, false, NULL, '2017-04-23', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55d4952f-f164-4ef8-9b2a-43be803196de', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Ritesh', 'Dubey', 'ritesh@dubey.com', '1057248642', 'B-03', true, false, NULL, '2017-04-24', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d19a679f-c558-47b1-96fe-63f01c63f569', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Shinoj', 'Prabhakaran', 'shinoj@prabhakaran.com', '7751945869', 'B-04', true, false, NULL, '2017-04-25', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('138f452a-a841-431d-8b28-9238808a817b', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Tanjamma', 'Tanjamma', 'tanjamma@tanjamma.com', '2385229786', 'B-05', false, false, NULL, '2017-04-26', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('85aa850d-01e5-4446-a962-dcc357f3d50e', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Navneet', 'Sinha', 'navneet@sinha.com', '873209194', 'B-06', true, false, NULL, '2017-04-27', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('fd40c6a9-e49c-48d2-a473-1185b20a0013', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'SHASHANK', 'SHASHANK', 'shashank@shashank.com', '2638240721', 'B-07', false, false, NULL, '2017-04-28', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('3007c7cf-a8fd-43cb-8582-fd2a479d4743', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Shalini', 'Sinha', 'shalini@sinha.com', '714784188', 'B-08', false, false, NULL, '2017-04-29', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('732f14a3-6735-4872-a681-cc146af8f710', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Rajiv', 'Srivastava', 'rajiv@srivastava.com', '3111474323', 'B-09', true, false, NULL, '2017-04-30', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a9e3f3df-6ab6-4fd0-a43a-2130a4b2a68f', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Avishek', 'Saha', 'avishek@saha.com', '3302518060', 'B-10', true, false, NULL, '2017-05-01', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1f8ba6e4-5f90-44e5-a252-74dbd2abdc6f', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Navneet', 'Nischal', 'navneet@nischal.com', '2106144517', 'B-11', true, false, NULL, '2017-05-02', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b97e56b6-256f-491e-9269-82bc1a12a7c1', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Srinivas', 'Reddy', 'srinivas@reddy.com', '9338883107', 'B-12', false, false, NULL, '2017-05-03', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('43c8f4af-dc6c-4911-af17-b8d6bb57176d', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Achal', 'Sinha', 'achal@sinha.com', '7325572304', 'B-13', true, false, NULL, '2017-05-04', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b3816ab6-03b1-4d0c-96c9-1ad2ab9b7916', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Ujjwal', 'Sinha', 'ujjwal@sinha.com', '3182995999', 'B-14', false, false, NULL, '2017-05-05', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('0f28f483-60b0-4c43-b066-0f4f9815b6ff', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Anand', 'Khedkar', 'anand@khedkar.com', '7424266275', 'B-15', false, false, NULL, '2017-05-06', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bc673c5f-bf6c-4cc7-9902-46080fcaf281', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Vertika', 'Verma', 'vertika@verma.com', '9044409874', 'C-01', true, false, NULL, '2017-05-07', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('94a2f0d5-0975-4304-a3ab-4cf9b5eef366', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Yogi', 'Singh', 'sushma@singh.com', '1750707882', 'C-02', true, true, 'President', '2017-05-08', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('0a07591e-4d17-4d3a-848f-5a356725e672', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Ashish', 'Anand', 'ashish@anand.com', '2593248971', 'C-03', true, false, NULL, '2017-05-09', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('1e6983e1-07e8-4516-ac42-fb82220ed07e', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Dhruv', 'Chadha', 'dhruv@chadha.com', '2368210396', 'C-04', false, false, NULL, '2017-05-10', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('4503de46-513c-49c8-b48c-5d5f590a288e', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Himanshu', 'Varshney', 'himanshu@varshney.com', '124442835', 'C-05', true, false, NULL, '2017-05-11', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e1f7bcb9-a55c-47d4-8742-dadf3288bfb3', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Ashwani', 'Gupta', 'ashwani@gupta.com', '6500313756', 'C-06', true, false, NULL, '2017-05-12', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ecea6bda-80be-4ae7-b056-2e85cade31a1', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Sandeep', 'Singh', 'sandeep@singh.com', '3572662775', 'C-07', false, false, NULL, '2017-05-13', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('7acb0678-8caa-43f1-a98b-b972c2a3044f', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Sripathi', 'Krishnan', 'sripathi@krishnan.com', '6325706640', 'C-08', false, false, NULL, '2017-05-14', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a6f43a46-1107-4c3b-9b27-585d86c05a4d', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Dr.', 'Swamy', 'dr@swamy.com', '2368210396', 'C-09', false, false, NULL, '2017-05-15', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a89f6efd-7559-4716-8d4e-cfef052070b3', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Anshuman', 'Singh', 'anshuman@singh.com', '124442835', 'C-10', true, false, NULL, '2017-05-16', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d775200a-c109-4139-85bd-3a553fb673cd', '7d7d4e3e-7bf8-40c8-a78d-67b2b61dbdc5', 'Tanjamma', 'Tanjamma', 'tanjamma@tanjamma.com', '6500313756', 'C-11', false, false, NULL, '2017-05-17', NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Note: Resident finances table is currently empty in the running database
-- No resident finance records exist yet
-- INSERT INTO resident_finances would go here when actual data is available

-- Note: Society finances table is currently empty in the running database  
-- No society finance records exist yet
-- INSERT INTO society_finances would go here when actual data is available

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Update sequences to prevent conflicts (if using SERIAL columns in the future)
-- This ensures that auto-generated IDs won't conflict with manually inserted UUIDs

\echo 'Data insertion completed successfully!'
\echo 'Default login credentials:'
\echo 'System Admin - Username: admin, Password: changeme123'
\echo 'Society Admins:'
\echo '  Green Valley - Username: gv_admin, Password: changeme123'
\echo '  Sunrise Towers - Username: st_admin, Password: changeme123'
\echo '  Metro Heights - Username: mh_admin, Password: changeme123'
\echo ''
\echo 'Please change all default passwords after first login!'

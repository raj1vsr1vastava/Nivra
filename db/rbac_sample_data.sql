-- Add sample RBAC data
-- Link some sample residents as users with appropriate roles

-- Create a sample society admin user
INSERT INTO users (username, password_hash, email, full_name, role_id)
VALUES (
    'societyadmin', 
    '$2b$12$szDrnX9jtz4JE64v4QE14.2gkhIQx/NpA/ProxHHBniH7iAyFCBEC', -- 'changeme123' 
    'societyadmin@example.com', 
    'Society Admin User',
    (SELECT id FROM roles WHERE name = 'society_admin')
);

-- Assign the society admin to all sample societies
INSERT INTO society_admins (user_id, society_id, is_primary_admin)
SELECT 
    (SELECT id FROM users WHERE username = 'societyadmin'),
    id,
    TRUE
FROM societies;

-- Find a resident who is a committee member
DO $$
DECLARE
    committee_resident_id UUID;
    committee_society_id UUID;
BEGIN
    SELECT id, society_id INTO committee_resident_id, committee_society_id FROM residents 
    WHERE is_committee_member = TRUE 
    LIMIT 1;
    
    IF FOUND THEN
        -- Create a user account for this committee member
        INSERT INTO users (username, password_hash, email, full_name, role_id, resident_id)
        SELECT
            'committee1',
            '$2b$12$szDrnX9jtz4JE64v4QE14.2gkhIQx/NpA/ProxHHBniH7iAyFCBEC', -- 'changeme123'
            r.email,
            r.first_name || ' ' || r.last_name,
            (SELECT id FROM roles WHERE name = 'committee_member'),
            r.id
        FROM residents r
        WHERE r.id = committee_resident_id;
    END IF;
END $$;

-- Find a regular resident (not committee member)
DO $$
DECLARE
    regular_resident_id UUID;
BEGIN
    SELECT id INTO regular_resident_id FROM residents 
    WHERE is_committee_member = FALSE
    LIMIT 1;
    
    IF FOUND THEN
        -- Create a user account for this regular resident
        INSERT INTO users (username, password_hash, email, full_name, role_id, resident_id)
        SELECT
            'resident1',
            '$2b$12$szDrnX9jtz4JE64v4QE14.2gkhIQx/NpA/ProxHHBniH7iAyFCBEC', -- 'changeme123'
            r.email,
            r.first_name || ' ' || r.last_name,
            (SELECT id FROM roles WHERE name = 'resident'),
            r.id
        FROM residents r
        WHERE r.id = regular_resident_id;
    END IF;
END $$;

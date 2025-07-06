-- Migration script to remove email unique constraint 
-- Multiple residents can share the same unit (family members)
-- Connect to the Nivra database
\c nivra;

-- Drop the existing unique constraint on email
ALTER TABLE residents DROP CONSTRAINT IF EXISTS residents_email_key;

-- Add comment for clarity that multiple residents can share the same unit
COMMENT ON COLUMN residents.unit_number IS 'Unit number - multiple residents (family members) can share the same unit';
COMMENT ON COLUMN residents.email IS 'Email address - can be shared by family members in the same unit';

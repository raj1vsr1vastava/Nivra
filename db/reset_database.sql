-- Reset script to drop and recreate the database
-- Warning: This will delete all data!

DROP DATABASE IF EXISTS nivra;

-- Recreation steps:
-- 1. Run create_database.sql to create the database with UUID extension
-- 2. Run create_tables.sql to create all tables including RBAC
-- 3. Run sample_data.sql to add sample society, resident, and finance data
-- 4. Run rbac_sample_data.sql to add sample RBAC users and permissions

-- Execute this to reset and recreate everything:
-- psql -U postgres -f reset_database.sql
-- psql -U postgres -f create_database.sql
-- psql -U postgres -f create_tables.sql
-- psql -U postgres -f sample_data.sql
-- psql -U postgres -f rbac_sample_data.sql

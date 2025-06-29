-- Create the Nivra database
CREATE DATABASE nivra;

-- Connect to the Nivra database
\c nivra;

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

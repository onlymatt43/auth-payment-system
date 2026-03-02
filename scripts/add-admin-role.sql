-- Migration: Add admin role support
-- Run this to add role column to users table

ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
-- Values: 'user' (default) or 'admin'

-- Create index for faster role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- To make an existing user admin, run:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

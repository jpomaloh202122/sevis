-- Create Admin User Script
-- Run this script in your Supabase SQL Editor to promote a user to admin

-- First, check existing users
SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC;

-- To promote a user to admin, replace 'user@example.com' with the actual email
-- UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- To verify the change
-- SELECT id, email, name, role FROM users WHERE email = 'user@example.com';

-- Example: If you registered with admin@sevis.gov.pg, run:
-- UPDATE users SET role = 'admin' WHERE email = 'admin@sevis.gov.pg';

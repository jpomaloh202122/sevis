-- Fix RLS Policies for User Registration
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies that allow user registration
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can create profile" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (true);

-- Also fix applications policies to be more permissive for demo
DROP POLICY IF EXISTS "Users can view own applications" ON applications;
DROP POLICY IF EXISTS "Users can create own applications" ON applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON applications;
DROP POLICY IF EXISTS "Admins can update applications" ON applications;

CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (true);

CREATE POLICY "Users can create own applications" ON applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all applications" ON applications
    FOR SELECT USING (true);

CREATE POLICY "Admins can update applications" ON applications
    FOR UPDATE USING (true);

-- Services should remain public
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone" ON services
    FOR SELECT USING (true);

-- Add policy for service creation (admin only)
CREATE POLICY "Admins can create services" ON services
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can update services" ON services
    FOR UPDATE USING (true);

-- Note: These policies are more permissive for demo purposes
-- In production, you would want more restrictive policies 
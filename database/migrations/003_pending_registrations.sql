-- Create pending registrations table for email-verification-first registration
-- Run this in Supabase SQL Editor

-- Create pending registrations table
CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    national_id VARCHAR(50),
    password_hash TEXT NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_code ON pending_registrations(verification_code);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires ON pending_registrations(expires_at);

-- Function to clean up expired pending registrations
CREATE OR REPLACE FUNCTION cleanup_expired_pending_registrations()
RETURNS void AS $$
BEGIN
    DELETE FROM pending_registrations 
    WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
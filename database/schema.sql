-- SEVIS PORTAL Database Schema
-- Run these SQL commands in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    national_id VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    phone_verified BOOLEAN DEFAULT false,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    verification_method VARCHAR(20) DEFAULT 'email' CHECK (verification_method IN ('email', 'sms')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email verifications table
CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SMS verifications table
CREATE TABLE IF NOT EXISTS sms_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT[] NOT NULL,
    processing_time VARCHAR(100) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    application_data JSONB NOT NULL,
    reference_number VARCHAR(50) UNIQUE,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_phone ON sms_verifications(phone_number);
CREATE INDEX IF NOT EXISTS idx_sms_verifications_code ON sms_verifications(verification_code);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample services data
INSERT INTO services (name, category, description, requirements, processing_time, fee, is_active) VALUES
('Business Registration', 'Business & Commerce', 'Register a new business entity in Papua New Guinea', ARRAY['Business plan', 'Proof of identity', 'Address verification'], '5-10 business days', 500.00, true),
('Driver License Renewal', 'Transportation', 'Renew your driver license', ARRAY['Current license', 'Medical certificate', 'Passport photo'], '3-5 business days', 150.00, true),
('National ID Application', 'Citizen Services', 'Apply for a new National ID card', ARRAY['Birth certificate', 'Proof of residence', 'Passport photo'], '10-15 business days', 50.00, true),
('Tax Registration', 'Business & Commerce', 'Register for tax purposes', ARRAY['Business registration', 'Bank account details', 'Contact information'], '2-3 business days', 200.00, true),
('Building Permit', 'Legal Services', 'Apply for building construction permit', ARRAY['Architectural plans', 'Land ownership documents', 'Environmental assessment'], '15-20 business days', 1000.00, true),
('Passport Application', 'Citizen Services', 'Apply for a new passport', ARRAY['Birth certificate', 'National ID', 'Passport photo'], '20-25 business days', 300.00, true),
('Voter Registration', 'Citizen Services', 'Register to vote in elections', ARRAY['National ID', 'Proof of residence'], '1-2 business days', 0.00, true),
('Medical Certificate', 'Health Services', 'Obtain medical fitness certificate', ARRAY['Medical examination', 'Blood test results'], '1-3 business days', 100.00, true),
('Police Clearance', 'Public Safety', 'Obtain police clearance certificate', ARRAY['National ID', 'Fingerprint form'], '5-7 business days', 75.00, true),
('Import License', 'Business & Commerce', 'Apply for import business license', ARRAY['Business registration', 'Tax clearance', 'Bank guarantee'], '10-15 business days', 800.00, true);

-- Insert demo users (password: "pawword")
INSERT INTO users (email, name, role, national_id, phone, email_verified, phone_verified, verification_method) VALUES
('admin@sevis.gov.pg', 'Admin User', 'admin', 'ADMIN001', '+67512345678', true, true, 'email'),
('user@example.com', 'Demo User', 'user', 'USER001', '+67587654321', true, true, 'email');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Anyone can create a user (for registration)
CREATE POLICY "Anyone can create users" ON users
    FOR INSERT WITH CHECK (true);

-- Services are public
CREATE POLICY "Services are public" ON services
    FOR SELECT USING (true);

-- Users can view their own applications
CREATE POLICY "Users can view own applications" ON applications
    FOR SELECT USING (auth.uid() = user_id);

-- Users can create applications
CREATE POLICY "Users can create applications" ON applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Email verifications are public (for verification process)
CREATE POLICY "Email verifications are public" ON email_verifications
    FOR ALL USING (true);

-- SMS verifications are public (for verification process)
CREATE POLICY "SMS verifications are public" ON sms_verifications
    FOR ALL USING (true);

-- Password reset tokens are public (for reset process)
CREATE POLICY "Password reset tokens are public" ON password_reset_tokens
    FOR ALL USING (true); 
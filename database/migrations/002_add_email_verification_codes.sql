-- Add support for 6-digit email verification codes
-- Run this in Supabase SQL Editor

-- Create email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_email ON email_verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_code ON email_verification_codes(verification_code);
CREATE INDEX IF NOT EXISTS idx_email_verification_codes_expires ON email_verification_codes(expires_at);

-- Add function to generate 6-digit codes
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS VARCHAR(6) AS $$
BEGIN
    RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Add function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verification_codes 
    WHERE expires_at < NOW() OR is_used = true;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired codes (uncomment if needed)
-- SELECT cron.schedule('cleanup-verification-codes', '0 */6 * * *', 'SELECT cleanup_expired_verification_codes();');
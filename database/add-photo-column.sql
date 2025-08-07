-- Add photo_url column to users table
-- Run this script in your Supabase SQL Editor to add photo support

-- Add photo_url column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Add verification columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_method VARCHAR(20) DEFAULT 'email' CHECK (verification_method IN ('email', 'sms'));

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('photo_url', 'email_verified', 'phone_verified', 'verification_method')
ORDER BY column_name;

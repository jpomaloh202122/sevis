-- Add password_hash column to users table
-- Run this in your Supabase SQL editor if the table already exists without this column

-- Add password_hash column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash TEXT;
    END IF;
END $$;

-- Also make national_id optional if it's currently required
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'national_id' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE users ALTER COLUMN national_id DROP NOT NULL;
    END IF;
END $$;

-- Update the check constraint to allow optional national_id
-- (This will safely handle both cases - whether constraint exists or not)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
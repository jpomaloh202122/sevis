-- Remove Demo Users from SEVIS PORTAL Database
-- Run this script in your Supabase SQL Editor to remove demo accounts

-- Remove demo users
DELETE FROM users WHERE email IN (
    'admin@sevis.gov.pg',
    'user@example.com'
);

-- Remove any applications associated with demo users
DELETE FROM applications WHERE user_id IN (
    SELECT id FROM users WHERE email IN (
        'admin@sevis.gov.pg',
        'user@example.com'
    )
);

-- Remove any email verifications for demo users
DELETE FROM email_verifications WHERE email IN (
    'admin@sevis.gov.pg',
    'user@example.com'
);

-- Remove any SMS verifications for demo users
DELETE FROM sms_verifications WHERE phone_number IN (
    '+67512345678',
    '+67587654321'
);

-- Remove any password reset tokens for demo users
DELETE FROM password_reset_tokens WHERE email IN (
    'admin@sevis.gov.pg',
    'user@example.com'
);

-- Verify removal
SELECT 'Remaining users:' as info, COUNT(*) as count FROM users;
SELECT 'Remaining applications:' as info, COUNT(*) as count FROM applications;

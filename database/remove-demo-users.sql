-- Remove Demo Users from SEVIS PORTAL Database
-- Run this script in your Supabase SQL Editor to remove demo accounts

-- Remove demo users
DELETE FROM users WHERE email IN (
    '[ADMIN_EMAIL]',
    '[USER_EMAIL]'
);

-- Remove any applications associated with demo users
DELETE FROM applications WHERE user_id IN (
    SELECT id FROM users WHERE email IN (
        '[ADMIN_EMAIL]',
        '[USER_EMAIL]'
    )
);

-- Remove any email verifications for demo users
DELETE FROM email_verifications WHERE email IN (
    '[ADMIN_EMAIL]',
    '[USER_EMAIL]'
);

-- Remove any SMS verifications for demo users
DELETE FROM sms_verifications WHERE phone_number IN (
    '[ADMIN_PHONE]',
    '[USER_PHONE]'
);

-- Remove any password reset tokens for demo users
DELETE FROM password_reset_tokens WHERE email IN (
    '[ADMIN_EMAIL]',
    '[USER_EMAIL]'
);

-- Verify removal
SELECT 'Remaining users:' as info, COUNT(*) as count FROM users;
SELECT 'Remaining applications:' as info, COUNT(*) as count FROM applications;

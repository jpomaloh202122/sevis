# Email Verification Setup Guide

## Overview

The SEVIS PORTAL now includes email verification functionality for user registration. This guide explains how to set up email verification for both development and production environments.

## Dependencies Added

The following packages have been added to support email verification:

```json
{
  "nodemailer": "^6.9.7",
  "@types/nodemailer": "^6.4.14"
}
```

## Environment Variables Required

Add the following environment variables to your `.env.local` file:

### SMTP Configuration
```bash
# SMTP Server Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### For Production (Netlify)
Add these to your Netlify environment variables:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
NEXT_PUBLIC_BASE_URL=https://your-site.netlify.app
```

## Email Provider Setup

### Gmail Setup (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

### Other Email Providers

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

#### Yahoo
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

#### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Database Schema Updates

The following tables have been added to support email verification:

### Users Table Updates
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
```

### New Tables
```sql
-- Email verifications table
CREATE TABLE email_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features Implemented

### 1. Email Verification Flow
- ✅ User registration creates verification token
- ✅ Verification email sent with secure link
- ✅ Email verification page with status handling
- ✅ Database updates for verified users
- ✅ Welcome email after successful verification

### 2. Email Templates
- ✅ Professional HTML email templates
- ✅ PNG government branding
- ✅ Responsive design
- ✅ Clear call-to-action buttons

### 3. Security Features
- ✅ Secure token generation (32-byte random)
- ✅ Token expiration (24 hours)
- ✅ One-time use tokens
- ✅ Email validation

### 4. User Experience
- ✅ Clear success/error messages
- ✅ Demo mode for testing
- ✅ Resend verification option
- ✅ Graceful fallback handling

## API Endpoints

### Email Verification
- **POST** `/api/auth/verify-email` - Verify email with token
- **GET** `/api/auth/verify-email` - Verify email via link

### Pages
- **GET** `/verify-email` - Email verification page

## Testing Email Verification

### Development Testing
1. Set up Gmail SMTP credentials
2. Register a new user
3. Check email for verification link
4. Click link to verify email
5. Login with verified account

### Demo Mode
If SMTP is not configured, the system will:
- Show "Demo: Account created successfully!"
- Allow login without verification
- Display demo mode indicators

## Troubleshooting

### Common Issues

#### Email Not Sending
- Check SMTP credentials
- Verify 2FA is enabled (Gmail)
- Check firewall/network settings
- Review email provider limits

#### Verification Link Not Working
- Check `NEXT_PUBLIC_BASE_URL` setting
- Verify database connection
- Check token expiration
- Review API route logs

#### Database Errors
- Run updated schema SQL
- Check Supabase connection
- Verify table permissions
- Review RLS policies

### Debug Mode
Enable debug logging by adding:
```bash
DEBUG=nodemailer:*
```

## Production Considerations

### Email Service Providers
For production, consider:
- **SendGrid** - High deliverability
- **Mailgun** - Developer-friendly
- **Amazon SES** - Cost-effective
- **Postmark** - Transactional emails

### Security Best Practices
- Use environment variables for credentials
- Enable SSL/TLS for SMTP
- Implement rate limiting
- Monitor email delivery rates
- Set up email authentication (SPF, DKIM)

### Monitoring
- Track email delivery rates
- Monitor verification completion rates
- Set up alerts for failures
- Log verification attempts

## Support

For issues with email verification:
1. Check environment variables
2. Verify SMTP configuration
3. Review application logs
4. Test with different email providers
5. Contact support if needed

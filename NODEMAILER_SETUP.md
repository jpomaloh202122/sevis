# Nodemailer Email Verification Setup Guide

## Overview

The SEVIS PORTAL now uses Nodemailer for sending email verification during user registration. This guide will help you configure the email service for both development and production environments.

## Features Implemented

### ✅ Email Verification Flow
- **Registration**: Creates verification token in database
- **Email Sending**: Sends professional HTML emails via Nodemailer
- **Verification**: Users click link to verify email
- **Welcome Email**: Sends welcome email after successful verification
- **Password Reset**: Supports password reset via email

### ✅ Email Templates
- **Professional Design**: PNG government theme (black, gold, red)
- **Responsive HTML**: Works on all email clients
- **Clear Call-to-Action**: Prominent verification buttons
- **Fallback Links**: Text links if buttons don't work

## Environment Variables

Add these to your `.env.local` file:

```bash
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Email Service Setup

### 1. Gmail Setup (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to Google Account settings
2. Navigate to Security → App passwords
3. Select "Mail" and "Other (Custom name)"
4. Enter "SEVIS PORTAL" as the name
5. Copy the generated 16-character password

#### Step 3: Update Environment Variables
```bash
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

### 2. Other Email Providers

#### Outlook/Hotmail
```bash
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

#### Yahoo
```bash
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
```

#### Custom SMTP Server
Update the `createTransporter` function in `lib/email-service.ts`:

```typescript
return nodemailer.createTransport({
  host: 'your-smtp-server.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})
```

## Database Schema

The following tables support email verification:

### Users Table Updates
```sql
ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP WITH TIME ZONE;
```

### Email Verifications Table
```sql
CREATE TABLE email_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Email Verification
- **POST** `/api/auth/send-verification` - Send verification email
- **POST** `/api/auth/verify-email` - Verify email with token
- **GET** `/api/auth/verify-email` - Verify email via link

### Pages
- **GET** `/verify-email` - Email verification page

## Testing Email Verification

### Development Testing
1. Set up your email credentials in `.env.local`
2. Start the development server: `npm run dev`
3. Register a new user in the application
4. Check your email for the verification link
5. Click the verification link to complete registration
6. Login with verified account

### Console Monitoring
- Check server console for email sending logs
- Look for: `📧 Email sent successfully: [messageId]`
- Check for any error messages

## Production Deployment

### Environment Variables for Production
```bash
# Email Configuration
EMAIL_USER=noreply@sevis.gov.pg
EMAIL_PASSWORD=your-production-app-password

# Application Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Recommended Email Services for Production

#### 1. SendGrid
- High deliverability
- Good free tier (100 emails/day)
- Professional API

#### 2. Mailgun
- Transactional emails
- Good API documentation
- Reliable delivery

#### 3. Amazon SES
- Cost-effective
- AWS integration
- High scalability

#### 4. Postmark
- Transactional emails
- Great deliverability
- Developer-friendly

## Email Templates

### Verification Email Features
- **Professional Header**: SEVIS PORTAL branding
- **Clear Instructions**: Step-by-step verification process
- **Verification Button**: Prominent call-to-action
- **Fallback Link**: Text link for email clients that block buttons
- **Security Notice**: 24-hour expiration warning
- **Support Contact**: Help information

### Welcome Email Features
- **Success Confirmation**: Clear verification success message
- **Service Overview**: What users can do now
- **Dashboard Link**: Direct access to user dashboard
- **Support Information**: Contact details for help

## Troubleshooting

### Common Issues

#### Email Not Sending
- Check `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Verify 2FA is enabled for Gmail
- Check app password is generated correctly
- Review server console for error messages

#### Email Going to Spam
- Use a professional email domain
- Set up SPF, DKIM records
- Avoid spam trigger words
- Use consistent sender address

#### Verification Link Not Working
- Check `NEXT_PUBLIC_BASE_URL` setting
- Verify database connection
- Check token expiration (24 hours)
- Review API route logs

#### Database Errors
- Run updated schema SQL
- Check Supabase connection
- Verify table permissions
- Review RLS policies

### Error Messages

#### "Invalid login"
- Check email and app password
- Verify 2FA is enabled
- Regenerate app password

#### "Authentication failed"
- Check email credentials
- Verify SMTP settings
- Test with different email provider

#### "Connection timeout"
- Check internet connection
- Verify SMTP server settings
- Try different email provider

## Security Considerations

### Email Security
- Use app passwords, not regular passwords
- Enable 2FA on email accounts
- Use secure SMTP connections
- Regularly rotate app passwords

### Token Security
- Tokens expire in 24 hours
- One-time use tokens
- Secure random generation
- Database storage with encryption

### Privacy Compliance
- Include unsubscribe options
- Respect user preferences
- Follow GDPR guidelines
- Secure data handling

## Monitoring and Analytics

### Email Metrics to Track
- **Delivery Rate**: Percentage of emails delivered
- **Open Rate**: Percentage of emails opened
- **Click Rate**: Percentage of verification links clicked
- **Bounce Rate**: Percentage of failed deliveries

### Logging
- Email sending success/failure
- Verification attempts
- Error messages and stack traces
- Performance metrics

## Support

For issues with email verification:
1. Check server console logs
2. Verify environment variables
3. Test email credentials
4. Review database connection
5. Check email provider status

### Next Steps
1. **Configure Email**: Set up your email credentials
2. **Test Integration**: Register users and verify emails
3. **Monitor Delivery**: Check email delivery rates
4. **Optimize Templates**: Customize email content
5. **Scale for Production**: Choose production email service

## Migration from Demo Mode

If you were previously using the demo email service:

1. **Install Nodemailer**: Already completed
2. **Configure Environment**: Add email credentials
3. **Update Email Service**: Already completed
4. **Test Integration**: Register new users
5. **Monitor Logs**: Check for successful email sending

The system will now send real emails instead of logging to console!

# Resend Email Service Setup Guide

This guide will help you set up Resend for email verification in the SEVIS PORTAL registration process.

## What is Resend?

Resend is a modern email API for developers that provides:
- High deliverability rates
- Simple API
- Real-time analytics
- Webhook support
- Developer-friendly dashboard

## Setup Steps

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your API Key

1. Log in to your Resend dashboard
2. Go to the "API Keys" section
3. Click "Create API Key"
4. Give it a name (e.g., "SEVIS Portal Production")
5. Copy the API key (it starts with `re_`)

### 3. Verify Your Domain (Optional but Recommended)

For production use, you should verify your domain:

1. In the Resend dashboard, go to "Domains"
2. Click "Add Domain"
3. Enter your domain (e.g., `sevis.gov.pg`)
4. Follow the DNS setup instructions
5. Wait for verification (usually takes a few minutes)

### 4. Update Environment Variables

Add these variables to your `.env.local` file:

```env
# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=SEVIS Portal <noreply@yourdomain.com>

# Remove or comment out old email variables
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
```

### 5. Test the Setup

You can test the email service by:

1. Starting your development server: `npm run dev`
2. Going to the registration page
3. Creating a new account
4. Checking if the verification email is received

## Email Templates

The application includes three email templates:

### 1. Email Verification
- **Trigger**: User registration
- **Purpose**: Verify user's email address
- **Content**: Welcome message + verification link

### 2. Password Reset
- **Trigger**: Password reset request
- **Purpose**: Allow user to reset password
- **Content**: Reset instructions + reset link

### 3. Welcome Email
- **Trigger**: Email verification success
- **Purpose**: Welcome verified user
- **Content**: Welcome message + dashboard link

## Configuration Options

### From Email Address

You can customize the "from" email address:

```env
RESEND_FROM_EMAIL=SEVIS Portal <noreply@sevis.gov.pg>
```

### Base URL

Set your application's base URL for email links:

```env
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Ensure the API key is correct
   - Check if the key has proper permissions
   - Verify the key is not expired

2. **Emails Not Sending**
   - Check the Resend dashboard for errors
   - Verify your domain is properly configured
   - Check the console logs for error messages

3. **Emails Going to Spam**
   - Verify your domain with Resend
   - Set up proper SPF and DKIM records
   - Use a professional "from" address

### Error Messages

- `Invalid API key`: Check your `RESEND_API_KEY` environment variable
- `Domain not verified`: Verify your domain in Resend dashboard
- `Rate limit exceeded`: You've hit the sending limit (check your plan)

## Production Deployment

For production deployment:

1. **Environment Variables**: Ensure all Resend variables are set in your production environment
2. **Domain Verification**: Verify your production domain with Resend
3. **Monitoring**: Set up webhooks for email delivery tracking
4. **Rate Limits**: Monitor your sending limits and upgrade if needed

## Free Tier Limits

Resend's free tier includes:
- 3,000 emails per month
- 100 emails per day
- Basic analytics
- Webhook support

For higher volumes, consider upgrading to a paid plan.

## Security Best Practices

1. **API Key Security**: Never commit API keys to version control
2. **Environment Variables**: Use environment variables for all sensitive data
3. **Domain Verification**: Always verify your sending domain
4. **Rate Limiting**: Implement rate limiting on your registration endpoint

## Support

- **Resend Documentation**: [docs.resend.com](https://docs.resend.com)
- **Resend Support**: Available through the dashboard
- **Community**: Join the Resend Discord for community support

## Migration from Nodemailer

If you're migrating from Nodemailer:

1. **Install Resend**: `npm install resend`
2. **Update Environment Variables**: Replace SMTP variables with Resend variables
3. **Update Code**: The email service has been updated to use Resend
4. **Test**: Verify all email functionality works correctly
5. **Remove Nodemailer**: `npm uninstall nodemailer` (optional)

The migration is complete and the application now uses Resend for all email functionality.

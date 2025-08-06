# Twilio SMS Verification Setup Guide

## Overview

The SEVIS PORTAL now supports SMS verification using Twilio as an alternative to email verification. This guide explains how to set up Twilio SMS verification for both development and production environments.

## Dependencies Added

The following package has been added to support SMS verification:

```json
{
  "twilio": "^4.19.0"
}
```

## Environment Variables Required

Add the following environment variables to your `.env.local` file:

### Twilio Configuration
```bash
# Twilio SMS Configuration
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Test Configuration (optional)
TEST_PHONE_NUMBER=your-test-phone-number

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### For Production (Netlify)
Add these to your Netlify environment variables:
```bash
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number
NEXT_PUBLIC_BASE_URL=https://your-site.netlify.app
```

## Twilio Account Setup

### Step 1: Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a free account
3. Verify your email and phone number

### Step 2: Get Your Credentials
1. In the Twilio Console, go to **Dashboard**
2. Copy your **Account SID** and **Auth Token**
3. These will be used as `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN`

### Step 3: Get a Phone Number
1. In Twilio Console, go to **Phone Numbers** → **Manage** → **Active numbers**
2. Click **Get a trial number** (free for development)
3. Choose a number and copy it as `TWILIO_PHONE_NUMBER`

### Step 4: Verify Your Phone Number (for testing)
1. Go to **Phone Numbers** → **Manage** → **Verified Caller IDs**
2. Add your personal phone number for testing
3. Use this as `TEST_PHONE_NUMBER` in development

## Database Schema Updates

The following tables have been added to support SMS verification:

### Users Table Updates
```sql
ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN phone_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN verification_method VARCHAR(20) DEFAULT 'email' CHECK (verification_method IN ('email', 'sms'));
```

### New SMS Verifications Table
```sql
CREATE TABLE sms_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    is_used BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Features Implemented

### 1. SMS Verification Flow
- ✅ User registration creates SMS verification code
- ✅ SMS sent with 6-digit verification code
- ✅ Code expires after 10 minutes
- ✅ Database updates for verified users
- ✅ Welcome SMS after successful verification

### 2. SMS Templates
- ✅ Professional SMS templates
- ✅ PNG government branding
- ✅ Clear verification codes
- ✅ Welcome messages

### 3. Security Features
- ✅ 6-digit verification codes
- ✅ 10-minute expiration
- ✅ One-time use codes
- ✅ Phone number validation

### 4. User Experience
- ✅ Clear success/error messages
- ✅ Demo mode for testing
- ✅ Resend verification option
- ✅ Graceful fallback handling

## API Endpoints

### SMS Verification
- **POST** `/api/auth/send-sms-verification` - Send SMS verification code
- **POST** `/api/auth/verify-sms` - Verify SMS code

## Testing SMS Verification

### Development Testing
1. Set up Twilio credentials
2. Run the test script:
   ```bash
   node test-twilio.js
   ```
3. Register a new user with phone number
4. Check SMS for verification code
5. Enter code to verify phone number

### Demo Mode
If Twilio is not configured, the system will:
- Show "Demo: Account created successfully!"
- Allow login without verification
- Display demo mode indicators

## Phone Number Formats

### Supported Formats
- `+67512345678` (PNG with country code)
- `+1234567890` (US format)
- `1234567890` (will be formatted automatically)

### PNG Phone Numbers
For Papua New Guinea:
- Country code: `+675`
- Format: `+675XXXXXXXX`
- Example: `+67512345678`

## Troubleshooting

### Common Issues

#### 1. "Authentication failed" Error
- **Solution**: Check Account SID and Auth Token
- **Steps**: Verify credentials in Twilio Console

#### 2. "Invalid phone number" Error
- **Solution**: Use international format
- **Format**: `+countrycodeXXXXXXXX`
- **Example**: `+67512345678`

#### 3. "Unverified phone number" Error
- **Solution**: Verify your phone number in Twilio Console
- **Steps**: Go to Verified Caller IDs and add your number

#### 4. "Rate limit exceeded" Error
- **Solution**: Wait a few minutes and try again
- **Note**: Free accounts have sending limits

### Debug Mode

Enable detailed logging by adding to your `.env.local`:
```bash
DEBUG=twilio:*
```

### Test Without Real SMS

For development, you can:
1. Use Twilio's test credentials
2. Check SMS logs in Twilio Console
3. Use verified phone numbers only

## Production Considerations

### Twilio Pricing
- **Free Trial**: 1,000 SMS credits
- **Paid Plans**: Pay per SMS sent
- **Volume Discounts**: Available for high usage

### Phone Number Costs
- **Trial Numbers**: Free (limited functionality)
- **Regular Numbers**: Monthly fee + per SMS
- **Toll-Free Numbers**: Available for US

### Best Practices
- Monitor SMS delivery rates
- Set up webhooks for delivery status
- Implement rate limiting
- Use verified sender IDs
- Monitor costs and usage

### Alternative SMS Providers
For production, consider:
- **AWS SNS** - Cost-effective
- **MessageBird** - Global coverage
- **Vonage** - Enterprise features
- **Infobip** - High deliverability

## Cost Optimization

### Free Trial Usage
- 1,000 SMS credits included
- Perfect for development and testing
- Upgrade when ready for production

### Production Optimization
- Use webhooks for delivery status
- Implement retry logic
- Monitor failed deliveries
- Set up alerts for high costs

## Security Best Practices

### Phone Number Validation
- Validate format before sending
- Check against spam lists
- Implement rate limiting
- Monitor for abuse

### Verification Code Security
- Use cryptographically secure random codes
- Set appropriate expiration times
- Limit verification attempts
- Log verification attempts

## Support

For issues with SMS verification:
1. Check Twilio Console for errors
2. Verify environment variables
3. Test with Twilio test script
4. Check phone number format
5. Review Twilio documentation

## Next Steps

Once Twilio is working:
1. **Test the full flow**: Register → SMS → Verify → Login
2. **Test error scenarios**: Invalid codes, expired codes
3. **Set up production phone number**: Upgrade from trial
4. **Monitor delivery rates**: Track SMS success rates
5. **Implement webhooks**: Real-time delivery status

# SMTP Testing Guide for SEVIS PORTAL

## Quick Start Testing

### Step 1: Set Up Environment Variables

Create a `.env.local` file in your project root with:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Application Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Step 2: Configure Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to [Google Account settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password as `SMTP_PASS`

### Step 3: Test SMTP Configuration

Run the test script:

```bash
node test-smtp.js
```

This will:
- ✅ Check your environment variables
- ✅ Test SMTP connection
- ✅ Send a test email to yourself
- ✅ Show detailed error messages if something fails

### Step 4: Test Email Verification in the App

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/register`

3. Register a new user with your email

4. Check your email for the verification link

5. Click the verification link to complete registration

## Alternative Email Providers

### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

### Yahoo
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

### Custom SMTP Server
```bash
SMTP_HOST=your-smtp-server.com
SMTP_PORT=587
SMTP_USER=your-username
SMTP_PASS=your-password
```

## Troubleshooting

### Common Issues

#### 1. "Authentication failed" Error
- **Solution**: Use App Password instead of regular password for Gmail
- **Steps**: Enable 2FA → Generate App Password → Use App Password

#### 2. "Connection timeout" Error
- **Solution**: Check firewall settings or try different port
- **Alternative**: Use port 465 with `secure: true`

#### 3. "Invalid credentials" Error
- **Solution**: Double-check email and password
- **Note**: Make sure to use the App Password, not your regular Gmail password

#### 4. "Rate limit exceeded" Error
- **Solution**: Wait a few minutes and try again
- **Note**: Gmail has daily sending limits

### Debug Mode

Enable detailed logging by adding to your `.env.local`:

```bash
DEBUG=nodemailer:*
```

### Test Without Real Email

If you want to test without sending real emails, you can use Ethereal Email (fake SMTP):

```bash
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-email
SMTP_PASS=your-ethereal-password
```

## Production Testing

### For Netlify Deployment

1. Add environment variables in Netlify dashboard:
   - Go to Site settings → Environment variables
   - Add all SMTP variables
   - Set `NEXT_PUBLIC_BASE_URL` to your Netlify URL

2. Test registration on live site:
   - Go to your deployed site
   - Register a new user
   - Check email for verification link

### Email Delivery Monitoring

- Check spam/junk folders
- Monitor email delivery rates
- Set up email authentication (SPF, DKIM)
- Use email service providers for better deliverability

## Success Indicators

✅ **SMTP Test Successful**: You receive the test email
✅ **Registration Works**: New user registration completes
✅ **Verification Email Sent**: User receives verification email
✅ **Email Verification Works**: Clicking link marks email as verified
✅ **Login After Verification**: User can login with verified account

## Next Steps

Once SMTP is working:

1. **Test the full flow**: Register → Verify → Login
2. **Test error scenarios**: Invalid tokens, expired links
3. **Set up production email service**: Consider SendGrid, Mailgun, etc.
4. **Monitor email delivery**: Track verification completion rates
5. **Add email templates**: Customize email appearance

## Support

If you encounter issues:

1. Check the error messages in the test script
2. Verify your SMTP credentials
3. Test with a different email provider
4. Check the application logs
5. Review the `EMAIL_SETUP.md` file for detailed configuration

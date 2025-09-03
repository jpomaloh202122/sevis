# Digital ID Integration Setup Guide

This guide explains how to set up and configure digital ID authentication for your SEVIS Portal.

## Overview

The digital ID integration allows users to login using:
- **PNG Digital ID** (Papua New Guinea official digital identity)
- **Google** (OAuth 2.0)
- **Facebook** (Facebook Login)
- **Microsoft** (Azure AD/Microsoft Account)

## Environment Variables

Add these to your `.env.local` file:

```env
# PNG Digital ID (Official PNG Government Digital ID)
PNG_DIGITAL_ID_API_URL=https://api.digitalid.gov.pg/v1
PNG_DIGITAL_ID_API_KEY=your_png_digital_id_api_key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Facebook App
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Microsoft Azure AD
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

## Provider Setup Instructions

### 1. PNG Digital ID
1. Contact PNG Government Digital Services
2. Register your application for Digital ID access
3. Obtain API credentials (URL and API Key)
4. Add the provided credentials to your environment variables

### 2. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API and Google OAuth2 API
4. Create OAuth 2.0 credentials
5. Add your domain to authorized origins
6. Add redirect URIs: `http://localhost:3000` and your production URL

### 3. Facebook Login Setup
1. Go to [Facebook for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Add your domain to App Domains

### 4. Microsoft Authentication Setup
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to Azure Active Directory > App registrations
3. Create new registration
4. Configure redirect URIs
5. Generate client secret
6. Grant necessary API permissions

## SDK Integration

Add these scripts to your `app/layout.tsx` or create a separate script loader:

```typescript
// Add to your layout.tsx head section
<script src="https://accounts.google.com/gsi/client" async defer></script>
<script 
  src="https://connect.facebook.net/en_US/sdk.js" 
  onLoad={() => {
    if (typeof window !== 'undefined') {
      (window as any).fbAsyncInit = function() {
        (window as any).FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };
    }
  }}
></script>
<script src="https://alcdn.msauth.net/browser/2.32.2/js/msal-browser.min.js"></script>
```

## Security Considerations

### Token Validation
- All tokens are verified server-side before authentication
- Invalid or expired tokens are rejected
- Provider APIs are called to validate authenticity

### User Data Mapping
- Digital ID data is mapped to your user schema
- Missing fields are handled gracefully
- Existing users are linked by email address

### Privacy & Consent
- Users must consent to data sharing
- Only necessary scopes are requested
- User data is stored according to your privacy policy

## API Endpoints

### POST `/api/auth/digital-id`
Authenticates users with digital ID tokens.

**Request:**
```json
{
  "token": "provider_access_token",
  "provider": "png_digital_id|google|facebook|microsoft"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_uuid",
    "name": "Full Name",
    "email": "user@example.com",
    "role": "user",
    "national_id": "123456789",
    "phone": "+675123456789",
    "photo_url": "https://...",
    "provider": "png_digital_id"
  }
}
```

## Usage Examples

### Basic Implementation
```tsx
import DigitalIdLogin from '@/components/DigitalIdLogin'

export default function LoginPage() {
  return (
    <div>
      <DigitalIdLogin 
        onSuccess={() => console.log('Login successful')}
        onError={(error) => console.error('Login failed:', error)}
      />
    </div>
  )
}
```

### Custom Styling
```tsx
<DigitalIdLogin 
  className="max-w-md mx-auto"
  onSuccess={() => {
    // Handle success
    router.push('/dashboard')
  }}
  onError={(error) => {
    // Handle error
    setError(error)
  }}
/>
```

## Troubleshooting

### Common Issues

1. **"Digital ID service not available"**
   - Ensure SDK scripts are loaded
   - Check network connectivity
   - Verify API credentials

2. **"Token verification failed"**
   - Check provider API credentials
   - Verify token hasn't expired
   - Ensure correct scopes are requested

3. **"User creation failed"**
   - Check database permissions
   - Verify user schema compatibility
   - Review required vs optional fields

### Debug Mode
Set `NODE_ENV=development` to enable detailed logging of the authentication flow.

## Testing

### Test with Development Credentials
1. Use test/sandbox credentials for each provider
2. Test all authentication flows
3. Verify user data mapping
4. Check error handling

### Production Checklist
- [ ] Production credentials configured
- [ ] HTTPS enabled
- [ ] Redirect URIs updated
- [ ] Error monitoring in place
- [ ] User consent flows tested
- [ ] Privacy policy updated

## Support

For implementation support:
1. Check provider documentation
2. Review server logs for authentication errors  
3. Test with minimal implementation first
4. Contact provider support for API issues
# SEVIS Pass Integration Guide

## Overview

This guide explains how to integrate your SEVIS Portal with SEVIS Pass (https://sevispass.netlify.app/) - Papua New Guinea's official digital identity service.

## What is SEVIS Pass?

SEVIS Pass is Papua New Guinea's digital identity platform that provides:
- **Single Sign-On (SSO)** across government and private services
- **Multi-factor authentication** with biometric verification
- **Government-verified identity** with document verification
- **Consent-based data sharing** with granular permissions
- **Access to integrated services** (G2C, G2G, G2B)

## Integration Features

### ✅ What's Implemented

1. **SEVIS Pass Authentication**
   - OAuth-like flow with popup authentication
   - Secure token exchange and validation
   - User data mapping to your system

2. **Government Services Integration**
   - G2C: CPF Board, HDB Services, MOH Services
   - G2B: IRAS Business, ACRA Services, Enterprise SG
   - G2G: Inter-Ministry Data, Agency Integration

3. **Security Features**
   - Rate limiting and IP tracking
   - Token format validation
   - Data sanitization and suspicious activity detection
   - Comprehensive security logging

4. **User Experience**
   - Branded SEVIS Pass login component
   - Seamless integration with existing auth flow
   - Error handling and fallback options

## Environment Configuration

Add these variables to your `.env.local`:

```env
# SEVIS Pass Integration
NEXT_PUBLIC_SEVIS_PASS_CLIENT_ID=your_sevis_pass_client_id
SEVIS_PASS_CLIENT_SECRET=your_sevis_pass_client_secret
SEVIS_PASS_REDIRECT_URI=http://localhost:3000/auth/sevis-pass/callback

# Production URLs (update for production)
SEVIS_PASS_API_URL=https://sevispass.netlify.app/api
SEVIS_PASS_AUTH_URL=https://sevispass.netlify.app/auth
```

## API Endpoints Created

### 1. `/api/auth/sevis-pass/exchange`
Exchanges authorization code for access token and user data.

**Request:**
```json
{
  "code": "authorization_code_from_sevis_pass",
  "state": "optional_state_parameter",
  "grant_type": "authorization_code"
}
```

**Response:**
```json
{
  "success": true,
  "access_token": "sevis_pass_access_token",
  "expires_at": "2024-01-01T12:00:00Z",
  "user": {
    "id": "user_uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "national_id": "1234567890",
    "phone": "+675123456789",
    "verification_level": "verified",
    "government_services": ["cpf", "hdb", "moh"]
  }
}
```

### 2. `/auth/sevis-pass/callback`
Handles OAuth callback and completes authentication flow.

## Components

### 1. `<SevisPassLogin />`
Main SEVIS Pass authentication component with full branding.

```tsx
import SevisPassLogin from '@/components/SevisPassLogin'

<SevisPassLogin 
  onSuccess={() => console.log('Login successful')}
  onError={(error) => console.error('Login failed:', error)}
  showServices={true}
/>
```

### 2. `<SevisPassLoginCompact />`
Compact version for smaller spaces.

```tsx
import { SevisPassLoginCompact } from '@/components/SevisPassLogin'

<SevisPassLoginCompact 
  onSuccess={() => router.push('/dashboard')}
  onError={setError}
/>
```

## Integration Library

The `sevis-pass-integration.ts` library provides:

```typescript
// Initiate authentication
const authCode = await initiateSevisPassAuth({
  scope: ['identity', 'email', 'government_services'],
  redirect_uri: 'http://localhost:3000/auth/sevis-pass/callback'
})

// Exchange code for user data
const result = await exchangeSevisPassCode(authCode)

// Access government services
const integration = new SevisPassServiceIntegration(accessToken)
const cpfData = await integration.accessCPFBoard()
```

## Setup Steps

### 1. Register with SEVIS Pass
1. Visit https://sevispass.netlify.app/
2. Contact SEVIS Pass team for developer access
3. Register your application for OAuth integration
4. Obtain client ID and secret

### 2. Configure Environment
1. Copy environment variables to `.env.local`
2. Update redirect URIs for production
3. Configure CORS settings if needed

### 3. Test Integration
1. Start your development server
2. Navigate to `/login`
3. Click "Login with SEVIS Pass"
4. Complete authentication flow

### 4. Production Deployment
1. Update environment variables for production
2. Configure production redirect URIs
3. Test with SEVIS Pass staging environment
4. Go live with production credentials

## User Data Mapping

SEVIS Pass users are mapped to your system as follows:

| SEVIS Pass Field | Your System Field | Notes |
|------------------|-------------------|--------|
| `email` | `email` | Primary identifier |
| `name` | `name` | Full display name |
| `national_id` | `national_id` | PNG National ID |
| `phone` | `phone` | Contact number |
| `photo_url` | `photo_url` | Profile picture |
| `verification_level` | Custom field | Verification status |
| `services_access` | Custom field | Available government services |

## Government Services Access

Once authenticated with SEVIS Pass, users can access:

### G2C (Government to Citizen)
- **CPF Board**: Retirement savings and benefits
- **HDB Services**: Housing and property services  
- **MOH Services**: Health records and services

### G2B (Government to Business)
- **IRAS Business**: Tax and revenue services
- **ACRA Services**: Company registration and compliance
- **Enterprise SG**: Business development support

### G2G (Government to Government)
- **Inter-Ministry Data**: Cross-department information sharing
- **Agency Integration**: Streamlined government processes
- **Shared Services**: Common government platforms

## Security Considerations

1. **Token Security**
   - Access tokens are validated server-side
   - Tokens have expiration times
   - Refresh tokens handled automatically

2. **Data Privacy**
   - Only requested scopes are accessed
   - User consent required for data sharing
   - Data retention follows PNG privacy laws

3. **Rate Limiting**
   - 5 authentication attempts per 15 minutes
   - IP-based blocking for suspicious activity
   - Comprehensive security logging

## Troubleshooting

### Common Issues

1. **"SEVIS Pass client ID not configured"**
   - Check `NEXT_PUBLIC_SEVIS_PASS_CLIENT_ID` in environment
   - Restart development server after adding variables

2. **"Failed to open authentication popup"**
   - Ensure popup blockers are disabled
   - Check CORS configuration
   - Verify redirect URI matches registration

3. **"Token verification failed"**
   - Confirm client secret is correct
   - Check network connectivity to SEVIS Pass
   - Verify token hasn't expired

### Demo Mode

If SEVIS Pass API is not available, the system falls back to demo mode:
- Demo user data is returned
- All authentication flows work normally
- Useful for development and testing

## Support

For technical support:
1. Check SEVIS Pass developer documentation
2. Review server logs for authentication errors
3. Contact SEVIS Pass support team
4. Test with minimal implementation first

## Example Implementation

Here's a complete example of adding SEVIS Pass to a login form:

```tsx
'use client'

import { useState } from 'react'
import SevisPassLogin from '@/components/SevisPassLogin'

export default function LoginPage() {
  const [error, setError] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        {/* Traditional Login Form */}
        <form>
          {/* ... email/password fields ... */}
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        {/* SEVIS Pass Login */}
        <SevisPassLogin 
          onSuccess={() => {
            // Handle successful login
          }}
          onError={(error) => {
            setError(error)
          }}
          showServices={true}
        />

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
```

This integration provides a seamless, secure, and feature-rich connection to Papua New Guinea's official digital identity platform.
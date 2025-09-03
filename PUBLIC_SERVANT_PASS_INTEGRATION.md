# Public Servant Pass G2G Integration

This document outlines the implementation of Public Servant Pass, a Government-to-Government (G2G) authentication service for Papua New Guinea public servants.

## Overview

Public Servant Pass provides secure authentication and access control for government employees, featuring:

- **Multi-factor Authentication**: Biometric verification and security clearance validation
- **Inter-agency Collaboration**: Seamless access across government departments
- **Security Clearance Management**: Role-based access based on security levels
- **Employment Status Verification**: Real-time validation of active employment

## Architecture

### Core Components

1. **Integration Library**: `lib/public-servant-pass-integration.ts`
2. **API Routes**: `app/api/auth/public-servant-pass/`
3. **UI Components**: `components/PublicServantPassLogin.tsx`
4. **Callback Handler**: `app/auth/public-servant-pass/callback/page.tsx`

### Authentication Flow

```
1. User clicks "Login with Public Servant Pass"
2. Popup window opens to G2G authentication portal
3. User authenticates with government credentials
4. System validates employment status and security clearance
5. User data is exchanged and validated
6. User is logged into the application
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Public Servant Pass G2G Service URLs
PUBLIC_SERVANT_PASS_API_URL=https://gov-auth.png.gov.pg/api
NEXT_PUBLIC_PUBLIC_SERVANT_PASS_URL=https://gov-auth.png.gov.pg

# OAuth Configuration
PUBLIC_SERVANT_PASS_CLIENT_ID=your_client_id_here
PUBLIC_SERVANT_PASS_CLIENT_SECRET=your_client_secret_here
PUBLIC_SERVANT_PASS_API_KEY=your_api_key_here

# Security Configuration
MINIMUM_SECURITY_CLEARANCE=basic

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Security Features

### Security Clearance Levels

- **Basic**: Standard government employee access
- **Confidential**: Access to confidential government information
- **Secret**: Access to secret government information
- **Top Secret**: Highest level security access

### Employment Status Validation

All authentication attempts validate:
- Active employment status
- Department verification
- Position validation
- Security clearance verification

### Rate Limiting

- 5 attempts per 15 minutes per IP
- 1 hour block after exceeding limits
- Separate limits for different endpoints

## Usage

### Basic Integration

```typescript
import { PublicServantPassLogin } from '@/components/PublicServantPassLogin'

export default function LoginPage() {
  return (
    <PublicServantPassLogin
      onSuccess={() => console.log('Login successful')}
      onError={(error) => console.error('Login failed:', error)}
      showServices={true}
    />
  )
}
```

### Compact Version

```typescript
import { PublicServantPassLoginCompact } from '@/components/PublicServantPassLogin'

export default function Header() {
  return (
    <PublicServantPassLoginCompact
      onSuccess={() => router.push('/dashboard')}
      className="ml-4"
    />
  )
}
```

### User Badge Display

```typescript
import { PublicServantBadge } from '@/components/PublicServantPassLogin'

export default function UserProfile({ user }) {
  return (
    <div>
      <PublicServantBadge 
        user={user}
        showDepartment={true}
        showClearance={false}
      />
    </div>
  )
}
```

## API Endpoints

### POST /api/auth/public-servant-pass/exchange

Exchanges authorization code for access token and user data.

**Request:**
```json
{
  "code": "auth_code_from_callback",
  "state": "random_state_parameter",
  "grant_type": "authorization_code"
}
```

**Response:**
```json
{
  "access_token": "bearer_token",
  "expires_at": "2024-01-01T00:00:00Z",
  "user": {
    "id": "user_id",
    "email": "user@gov.pg",
    "name": "John Doe",
    "employee_id": "EMP001",
    "department": "Ministry of Finance",
    "security_clearance": "confidential",
    "employment_status": "active"
  }
}
```

### POST /api/auth/public-servant-pass/verify

Verifies an existing access token.

**Request:**
```json
{
  "token": "bearer_token"
}
```

### GET /api/auth/public-servant-pass/permissions

Gets user's G2G service permissions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "services": ["personnel", "payroll", "procurement"],
  "security_clearance": "confidential",
  "department_access": ["finance", "treasury"],
  "g2g_services": ["inter_agency", "classified"],
  "inter_agency_access": ["education", "health"]
}
```

## G2G Services Integration

The `PublicServantPassServiceIntegration` class provides access to government services:

```typescript
import { PublicServantPassServiceIntegration } from '@/lib/public-servant-pass-integration'

const g2gService = new PublicServantPassServiceIntegration(userToken)

// Access personnel management
const personnel = await g2gService.accessPersonnelManagement()

// Access payroll services
const payroll = await g2gService.accessPayrollServices()

// Access procurement system
const procurement = await g2gService.accessProcurementSystem()

// Validate security clearance for specific service
const access = await g2gService.validateSecurityClearance('classified_docs', 'secret')
```

## Database Schema Updates

The integration extends the user schema with government-specific fields:

```typescript
interface EnhancedUser {
  // ... existing fields
  provider?: 'database' | 'sevis_pass' | 'digital_id' | 'public_servant_pass'
  employee_id?: string
  department?: string
  position?: string
  security_clearance?: 'basic' | 'confidential' | 'secret' | 'top_secret'
  verification_level?: string
  government_services_access?: string[]
  employment_status?: 'active' | 'suspended' | 'terminated'
  last_verified?: string
}
```

## Security Considerations

### Data Protection
- All communications use HTTPS
- Tokens are securely stored and transmitted
- Personal data is handled according to government privacy policies

### Access Control
- Employment status must be 'active' for authentication
- Security clearance levels are enforced
- Inter-agency access is role-based

### Monitoring
- All authentication attempts are logged
- Security events are tracked
- Suspicious activity is detected and reported

## Testing

### Test Authentication Flow

1. Set up test environment variables
2. Configure test G2G service endpoints
3. Test with valid government employee credentials
4. Verify security clearance enforcement
5. Test employment status validation

### Security Testing

- Test rate limiting functionality
- Verify token validation
- Test security clearance enforcement
- Validate employment status checks

## Deployment

### Production Checklist

- [ ] Configure production G2G service URLs
- [ ] Set up OAuth client credentials
- [ ] Configure security clearance requirements
- [ ] Enable security event logging
- [ ] Set up monitoring and alerting
- [ ] Test inter-agency service access
- [ ] Verify employment status integration

### Environment-Specific Configuration

- **Development**: Use test G2G services with mock data
- **Staging**: Use staging G2G services with test employee accounts
- **Production**: Use production G2G services with live employee data

## Support and Maintenance

### Regular Tasks

- Monitor authentication success rates
- Review security event logs
- Update security clearance mappings
- Validate employment status data
- Test inter-agency service connectivity

### Troubleshooting

Common issues and solutions:

1. **Authentication Popup Blocked**: Ensure popup blockers allow the G2G domain
2. **Invalid Security Clearance**: Check minimum clearance requirements
3. **Employment Status Error**: Verify employee record in HR system
4. **Token Expiration**: Implement token refresh mechanism
5. **Service Access Denied**: Review user's department permissions

## Integration Notes

This G2G service integrates with:
- Papua New Guinea government HR systems
- Inter-agency collaboration platforms
- Security clearance management systems
- Department-specific services and applications

For support, contact the PNG Government Digital Services team.
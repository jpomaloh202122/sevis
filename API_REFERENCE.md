# SEVIS Portal API Reference

## Overview
This document provides detailed information about all API endpoints available in the SEVIS Portal system.

## Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

## Authentication
Most API endpoints require authentication. Include the user session data in request headers or body as specified.

---

## Authentication APIs

### Send Email Verification
Send verification email to user during registration.

**Endpoint**: `POST /api/auth/send-verification`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "Verification email sent successfully"
}
```

**Error Responses**:
```json
{
  "error": "Email is required"
}
```

---

### Verify Email Address
Verify user email address with token.

**Endpoint**: `POST /api/auth/verify-email`

**Request Body**:
```json
{
  "token": "verification_token_string"
}
```

**Response**:
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "email_verified": true
  }
}
```

---

### Send SMS Verification
Send SMS verification code to phone number.

**Endpoint**: `POST /api/auth/send-sms-verification`

**Request Body**:
```json
{
  "phoneNumber": "+675XXXXXXXX"
}
```

**Response**:
```json
{
  "message": "SMS verification code sent successfully"
}
```

---

### Verify SMS Code
Verify SMS verification code.

**Endpoint**: `POST /api/auth/verify-sms`

**Request Body**:
```json
{
  "phoneNumber": "+675XXXXXXXX",
  "verificationCode": "123456"
}
```

**Response**:
```json
{
  "message": "SMS verified successfully",
  "user": {
    "id": "user_uuid",
    "phone": "+675XXXXXXXX",
    "phone_verified": true
  }
}
```

---

## Application APIs

### Delete Application
Delete a user's application (users can only delete their own applications).

**Endpoint**: `DELETE /api/applications/[id]`

**Request Body**:
```json
{
  "userId": "user_uuid"
}
```

**Response**:
```json
{
  "message": "Application deleted successfully",
  "data": {
    "id": "application_uuid",
    "reference_number": "REF123456"
  }
}
```

**Error Responses**:
```json
{
  "error": "Application not found or access denied"
}
```

---

### Update Application Status (User)
Update application status (limited to resubmission).

**Endpoint**: `PATCH /api/applications/[id]`

**Request Body**:
```json
{
  "userId": "user_uuid",
  "status": "pending"
}
```

**Response**:
```json
{
  "message": "Application status updated",
  "data": {
    "id": "application_uuid",
    "status": "pending"
  }
}
```

---

## Admin APIs

### Admin Authentication
Authenticate admin user.

**Endpoint**: `POST /api/admin/auth/login`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin_password"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "user": {
    "id": "admin_uuid",
    "email": "admin@example.com",
    "role": "admin",
    "admin_level": {
      "level": "super_admin",
      "permissions": ["all"]
    }
  }
}
```

---

### Update Application Status (Admin)
Update application status with admin privileges.

**Endpoint**: `POST /api/admin/applications/[id]/status`

**Request Body**:
```json
{
  "status": "completed",
  "adminId": "admin_uuid",
  "adminRole": "super_admin",
  "notes": "Application approved after document verification",
  "vettingData": {
    "all_documents_verified": true,
    "vetted_by": "admin_uuid",
    "vetted_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response**:
```json
{
  "message": "Application status updated successfully",
  "data": {
    "id": "application_uuid",
    "status": "completed",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Status Options**:
- `pending`: Initial application status
- `in_progress`: Under review/vetting
- `completed`: Approved and processed
- `rejected`: Application rejected

---

### Verify Documents
Verify application documents (Admin only).

**Endpoint**: `POST /api/admin/applications/[id]/verify-documents`

**Request Body**:
```json
{
  "national_id_verified": true,
  "address_proof_verified": true,
  "category_doc_verified": false,
  "verified_by": "admin_uuid",
  "verification_notes": "National ID and address proof verified. Category document requires resubmission."
}
```

**Response**:
```json
{
  "message": "Document verification updated successfully",
  "data": {
    "id": "application_uuid",
    "application_data": {
      "documentVerifications": {
        "national_id_verified": true,
        "address_proof_verified": true,
        "category_doc_verified": false,
        "verified_by": "admin_uuid",
        "verified_at": "2024-01-15T10:30:00Z",
        "verification_notes": "National ID and address proof verified..."
      }
    }
  }
}
```

---

### Manual Verification
Manually verify user account (Super Admin only).

**Endpoint**: `POST /api/admin/manual-verify`

**Request Body**:
```json
{
  "email": "user@example.com",
  "adminId": "admin_uuid"
}
```

**Response**:
```json
{
  "message": "User manually verified successfully",
  "user": {
    "id": "user_uuid",
    "email": "user@example.com",
    "email_verified": true,
    "phone_verified": true
  }
}
```

---

### Check Admin Roles
Verify admin roles and permissions.

**Endpoint**: `GET /api/admin/check-roles`

**Query Parameters**:
- `userId`: Admin user UUID (optional)

**Response**:
```json
{
  "roles": [
    {
      "id": "admin_uuid",
      "email": "admin@example.com",
      "role": "admin",
      "admin_level": {
        "level": "super_admin",
        "permissions": ["all"],
        "can_create_admins": true,
        "can_modify_applications": true
      }
    }
  ]
}
```

---

### System Setup
Initialize system configuration (Super Admin only).

**Endpoint**: `POST /api/admin/setup`

**Request Body**:
```json
{
  "adminEmail": "admin@example.com",
  "adminPassword": "secure_password",
  "adminName": "System Administrator"
}
```

**Response**:
```json
{
  "message": "System setup completed successfully",
  "admin": {
    "id": "admin_uuid",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

---

### Create Three-Tier Admin System
Set up multi-tier admin structure.

**Endpoint**: `POST /api/admin/create-three-tier`

**Request Body**:
```json
{
  "superAdmin": {
    "email": "super@example.com",
    "password": "password",
    "name": "Super Administrator"
  },
  "approvingAdmin": {
    "email": "approving@example.com",
    "password": "password",
    "name": "Approving Administrator"
  },
  "vettingAdmin": {
    "email": "vetting@example.com",
    "password": "password",
    "name": "Vetting Administrator"
  }
}
```

**Response**:
```json
{
  "message": "Three-tier admin system created successfully",
  "admins": {
    "super_admin": { "id": "uuid1", "email": "super@example.com" },
    "approving_admin": { "id": "uuid2", "email": "approving@example.com" },
    "vetting_admin": { "id": "uuid3", "email": "vetting@example.com" }
  }
}
```

---

## Debug APIs

### Check Admin Level
Debug endpoint to check admin levels.

**Endpoint**: `GET /api/debug/admin-level`

**Query Parameters**:
- `userId`: User UUID to check

**Response**:
```json
{
  "userId": "admin_uuid",
  "role": "admin",
  "adminLevel": {
    "level": "super_admin",
    "permissions": ["all"]
  }
}
```

---

### Email Configuration Debug
Check email service configuration.

**Endpoint**: `GET /api/debug/email-config`

**Response**:
```json
{
  "emailService": "resend",
  "configured": true,
  "fromEmail": "noreply@example.com",
  "lastTest": "2024-01-15T10:30:00Z"
}
```

---

### Test Email
Test email sending functionality.

**Endpoint**: `POST /api/test/email`

**Request Body**:
```json
{
  "to": "test@example.com",
  "subject": "Test Email",
  "message": "This is a test email from SEVIS Portal"
}
```

**Response**:
```json
{
  "message": "Test email sent successfully",
  "emailId": "resend_email_id"
}
```

---

## Error Codes

### Common HTTP Status Codes

- `200`: Success
- `400`: Bad Request - Invalid request data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Access denied
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error

### Custom Error Messages

```json
{
  "error": "User ID is required"
}
```

```json
{
  "error": "Application not found or access denied"
}
```

```json
{
  "error": "Failed to delete application: Database error"
}
```

```json
{
  "error": "Invalid admin role or status"
}
```

---

## Rate Limiting

### Default Limits
- **Authentication endpoints**: 5 requests per minute per IP
- **Application endpoints**: 10 requests per minute per user
- **Admin endpoints**: 20 requests per minute per admin
- **Debug endpoints**: 2 requests per minute per IP

### Rate Limit Headers
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1642694400
```

---

## Webhooks

### Application Status Updates
Send webhook notifications when application status changes.

**Webhook URL Configuration**:
Set in environment variables or admin panel.

**Payload Example**:
```json
{
  "event": "application.status_changed",
  "data": {
    "application_id": "app_uuid",
    "user_id": "user_uuid",
    "old_status": "pending",
    "new_status": "in_progress",
    "changed_by": "admin_uuid",
    "changed_at": "2024-01-15T10:30:00Z"
  }
}
```

---

## SDK and Libraries

### JavaScript/TypeScript Client
```javascript
import { SevisApi } from '@sevis/api-client';

const client = new SevisApi({
  baseUrl: 'https://your-domain.com',
  apiKey: 'your-api-key'
});

// Send verification email
await client.auth.sendVerification({ email: 'user@example.com' });

// Delete application
await client.applications.delete('app-id', { userId: 'user-id' });
```

### Python Client
```python
from sevis_api import SevisClient

client = SevisClient(
    base_url='https://your-domain.com',
    api_key='your-api-key'
)

# Send verification email
client.auth.send_verification(email='user@example.com')

# Delete application
client.applications.delete('app-id', user_id='user-id')
```

---

## Testing

### Test Endpoints
All API endpoints can be tested using:
- **Postman**: Import the provided collection
- **curl**: Command line testing
- **Insomnia**: REST client testing

### Example curl Commands

```bash
# Send verification email
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Delete application
curl -X DELETE http://localhost:3000/api/applications/app-uuid \
  -H "Content-Type: application/json" \
  -d '{"userId": "user-uuid"}'
```

### Test Data
Use the provided demo accounts and sample data for testing API endpoints.

---

*Last Updated: December 2024*
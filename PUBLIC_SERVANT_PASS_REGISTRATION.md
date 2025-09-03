# Public Servant Pass Registration Service

This document outlines the implementation of the Public Servant Pass Registration service, a Government-to-Government (G2G) application system for Papua New Guinea public servants.

## Overview

The Public Servant Pass Registration service allows eligible government employees to apply for digital identity credentials that provide secure access to inter-agency systems, classified information, and collaborative government platforms.

## Features

### 🏢 **Government Employee Verification**
- Real-time Public Servant ID validation
- Department employment verification
- Government email domain validation
- HR system integration

### 🔐 **Security Clearance Integration**
- Support for all clearance levels (Basic to Top Secret)
- Background check requirements
- Security clearance expiry tracking
- Automated clearance verification

### 📝 **Multi-Step Application Process**
- 4-step guided application form
- Real-time validation and feedback
- Auto-population from government records
- Progress tracking and save functionality

### 🚀 **G2G Service Integration**
- Access to inter-agency services
- Single Sign-On (SSO) capabilities
- Department-specific permissions
- Real-time status updates

## Data Structure

The registration system captures the following data sets as specified:

### Required Fields
- **First Name** - Government employee's first name
- **Last Name** - Government employee's last name  
- **Date of Birth** - For identity verification
- **Gender** - Male, Female, or Other
- **Public Servant ID Number** - Format: PS-DEPT-YYYY-NNNN
- **Work Email** - Must be from *.gov.pg domain
- **Department** - Full department name
- **Phone Number** - Contact number with PNG format

### Additional Information
- **Position/Title** - Job role within department
- **Security Clearance** - Current clearance level if any
- **Work Address** - Office location details
- **Emergency Contact** - Name, phone, relationship

## Application Process

### Step 1: Personal Information
- Basic personal details collection
- Phone number and date of birth validation
- Gender selection

### Step 2: Employment Information  
- Public Servant ID validation with government database
- Work email verification against department records
- Department selection from approved list
- Position and employment details

### Step 3: Security & Contact Information
- Security clearance declaration and verification
- Background check requirements assessment
- Work address and emergency contact details

### Step 4: Declarations & Submission
- Legal declarations and terms acceptance
- Security policy agreement
- Background check authorization
- Final application submission

## API Endpoints

### Application Submission
```
POST /api/applications/public-servant-pass
```

**Request Body:**
```json
{
  "userId": "string",
  "formData": {
    "personalInfo": {
      "firstName": "string",
      "lastName": "string",
      "dateOfBirth": "YYYY-MM-DD",
      "gender": "Male|Female|Other",
      "phoneNumber": "string"
    },
    "employmentInfo": {
      "publicServantId": "PS-DEPT-YYYY-NNNN",
      "workEmail": "user@department.gov.pg",
      "department": "string",
      "position": "string",
      "employmentStartDate": "YYYY-MM-DD",
      "officeLocation": "string"
    },
    "securityInfo": {
      "hasSecurityClearance": boolean,
      "currentClearanceLevel": "basic|confidential|secret|top_secret",
      "clearanceExpiryDate": "YYYY-MM-DD",
      "requiresBackgroundCheck": boolean
    },
    "contactInfo": {
      "workAddress": "string",
      "alternateEmail": "string",
      "emergencyContactName": "string",
      "emergencyContactPhone": "string",
      "emergencyContactRelationship": "string"
    },
    "declarations": {
      "informationAccurate": true,
      "agreesToTerms": true,
      "agreesToSecurityPolicy": true,
      "authorizeBackgroundCheck": true,
      "underststandsPenalties": true
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "application": {
    "id": "string",
    "reference_number": "string",
    "status": "pending",
    "submitted_at": "ISO_DATE"
  },
  "message": "Application submitted successfully",
  "nextSteps": [
    "Employment verification will be conducted",
    "Background check will be initiated if required",
    "You will receive email updates"
  ]
}
```

### Employee Validation
```
POST /api/applications/public-servant-pass/validate
```

**Request Body:**
```json
{
  "publicServantId": "PS-DEPT-YYYY-NNNN",
  "workEmail": "user@department.gov.pg",
  "firstName": "string",
  "lastName": "string"
}
```

**Response:**
```json
{
  "valid": true,
  "employee": {
    "publicServantId": "PS-DEPT-YYYY-NNNN",
    "firstName": "John",
    "lastName": "Doe", 
    "department": "Ministry of Finance",
    "position": "Senior Policy Analyst",
    "workEmail": "john.doe@finance.gov.pg",
    "employmentStartDate": "2020-03-15",
    "currentSecurityClearance": "confidential",
    "yearsOfService": 4
  },
  "validationStatus": {
    "employeeFound": true,
    "activeStatus": true,
    "emailMatch": true,
    "nameMatch": true
  },
  "eligibility": {
    "eligible": true,
    "canApplyForClearance": false,
    "backgroundCheckRequired": true
  }
}
```

### Department Information
```
GET /api/applications/public-servant-pass/validate
```

**Response:**
```json
{
  "departments": [
    {
      "code": "FINANCE",
      "name": "Ministry of Finance",
      "fullName": "Ministry of Finance and Treasury"
    }
  ],
  "validation": {
    "idFormat": "PS-{DEPT_CODE}-{YEAR}-{NUMBER}",
    "example": "PS-FINANCE-2023-0001",
    "emailDomains": ["gov.pg", "finance.gov.pg"]
  }
}
```

## Validation Rules

### Public Servant ID Format
- Pattern: `PS-[A-Z]{2,6}-\d{4}-\d{4}`
- Example: `PS-FINANCE-2023-0001`
- Department codes: FINANCE, HEALTH, EDUC, POLICE, etc.

### Email Validation
- Must end with `.gov.pg` or government department domain
- Examples: `@gov.pg`, `@finance.gov.pg`, `@health.gov.pg`

### Security Requirements
- All declarations must be accepted
- Background check authorization required for classified access
- Security clearance verification for existing clearances

## Processing Workflow

### Standard Processing (14 days)
1. **Application Submission** (Day 0)
2. **Employment Verification** (Days 1-3)
3. **Department Authorization** (Days 4-7)
4. **Document Review** (Days 8-10)
5. **Final Approval** (Days 11-14)

### Enhanced Processing (30 days)
1. **Application Submission** (Day 0)
2. **Employment Verification** (Days 1-3)
3. **Background Check Initiation** (Days 4-7)
4. **Security Clearance Verification** (Days 8-21)
5. **Interview (if required)** (Days 22-25)
6. **Final Approval** (Days 26-30)

## Mock Database Integration

The system includes a mock government employee database for demonstration:

```javascript
const mockGovEmployeeDB = {
  'PS-FINANCE-2023-0001': {
    firstName: 'John',
    lastName: 'Doe',
    department: 'Ministry of Finance',
    workEmail: 'john.doe@finance.gov.pg',
    isActive: true,
    securityClearance: 'confidential'
  }
}
```

In production, this integrates with:
- PNG Government HR Management System
- Department Personnel Databases
- Security Clearance Management System
- Background Check Services

## File Structure

```
├── app/
│   ├── api/applications/public-servant-pass/
│   │   ├── route.ts                    # Main application API
│   │   └── validate/route.ts           # Employee validation API
│   └── services/g2g/public-servant-pass/
│       └── page.tsx                    # Service information page
├── components/forms/
│   └── PublicServantPassForm.tsx       # Registration form component
├── lib/
│   └── database-types.ts               # Enhanced with PS Pass types
└── scripts/
    └── add-public-servant-pass-service.js # Database initialization
```

## Security Considerations

### Data Protection
- All employee data encrypted in transit and at rest
- PII handled according to PNG Privacy Act
- Secure API endpoints with rate limiting
- Audit logging for all access attempts

### Validation Security
- Server-side validation of all input data
- Government domain email verification
- Public Servant ID format validation
- Department authorization checks

### Background Checks
- Integration with security clearance systems
- Automated background check workflows
- Security event logging and monitoring
- Regular clearance status updates

## Testing

### Mock Employee Records
Test applications can use these mock Public Servant IDs:
- `PS-FINANCE-2023-0001` (Active, Confidential clearance)
- `PS-HEALTH-2022-0045` (Active, Basic clearance)
- `PS-EDUC-2021-0123` (Inactive - for testing rejection)

### Test Scenarios
1. **Valid Application**: Complete form with valid PS ID
2. **Invalid PS ID**: Test ID format validation
3. **Inactive Employee**: Test with inactive employee record
4. **Email Mismatch**: Test email validation against records
5. **Background Check**: Test clearance upgrade workflow

## Deployment Setup

### Environment Variables
```bash
# Add to .env.local
PUBLIC_SERVANT_PASS_ENABLED=true
GOV_HR_SYSTEM_API_URL=https://hr.gov.pg/api
SECURITY_CLEARANCE_API_URL=https://security.gov.pg/api
BACKGROUND_CHECK_API_URL=https://background.gov.pg/api
```

### Database Setup
```bash
# Run the service initialization script
node scripts/add-public-servant-pass-service.js
```

### Production Integration
- Replace mock database with actual HR system API
- Configure security clearance verification service
- Set up background check automation
- Enable department notification workflows

## Admin Features

Administrators can:
- View all Public Servant Pass applications
- Track application statistics by department
- Monitor background check requirements
- Approve/reject applications
- Generate compliance reports

## Support Information

### Technical Support
- **Email**: support@sevisportal.com
- **Hours**: Mon-Fri, 8:00 AM - 5:00 PM

### Personnel Management Division
- **Email**: pmd@gov.pg  
- **Phone**: +675 321 4567
- **Address**: Government Offices, Waigani

### Security Clearance Office
- **Email**: security@gov.pg
- **Phone**: +675 321 9876
- **Clearance Inquiries**: clearance@security.gov.pg

This comprehensive G2G registration service ensures secure, efficient, and compliant onboarding of government employees to the Public Servant Pass system.
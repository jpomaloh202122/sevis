# SEVIS Portal - Complete Project Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Installation & Setup](#installation--setup)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Frontend Components](#frontend-components)
8. [Authentication System](#authentication-system)
9. [Admin System](#admin-system)
10. [Features](#features)
11. [Configuration](#configuration)
12. [Deployment](#deployment)
13. [Security](#security)
14. [Testing](#testing)
15. [Troubleshooting](#troubleshooting)
16. [Development Guidelines](#development-guidelines)

## Project Overview

SEVIS Portal is a comprehensive government services portal for Papua New Guinea, built with Next.js 14. It provides citizens with digital access to government services, document management, and features a multi-tier administrative system for processing applications.

### Key Features
- **Multi-role Authentication System** with user and admin roles
- **Digital Government Services** across multiple categories
- **Online Application System** with document upload and tracking
- **Digital City Pass** with QR code generation
- **Multi-tier Admin Dashboard** for application processing
- **Real-time Status Updates** via email and SMS
- **Mobile-responsive Design** optimized for all devices
- **Secure Document Management** with file verification

### Project Structure

```
SEVISPORTAL/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin interface
│   ├── api/               # API endpoints
│   ├── dashboard/         # User dashboard
│   ├── services/          # Government services
│   └── [pages]/           # Public pages
├── components/            # React components
├── contexts/             # React contexts
├── database/             # Database schemas & migrations
├── lib/                  # Utility libraries
└── public/               # Static assets
```

## Architecture

### System Architecture
The SEVIS Portal follows a modern web architecture with clear separation of concerns:

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with serverless functions
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Custom authentication with multi-channel verification
- **File Storage**: Base64 encoding for documents and images
- **Email/SMS**: Multiple service providers (Resend, Twilio)

### Data Flow
1. **User Registration**: Multi-channel verification (email/SMS)
2. **Service Application**: Multi-step form with document upload
3. **Admin Processing**: Multi-tier approval workflow
4. **Digital Card Generation**: QR code-enabled city pass
5. **Status Notifications**: Real-time updates via email/SMS

## Tech Stack

### Frontend Technologies
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Headless UI**: Unstyled, accessible UI components
- **Heroicons**: Beautiful SVG icons
- **Framer Motion**: Animation library
- **React Context**: State management

### Backend Technologies
- **Next.js API Routes**: Serverless API endpoints
- **Supabase**: PostgreSQL database with real-time features
- **bcryptjs**: Password hashing
- **Resend**: Modern email service
- **Twilio**: SMS service
- **QRCode**: QR code generation
- **HTML2Canvas**: Document capture

### Development Tools
- **ESLint**: Code linting
- **PostCSS**: CSS processing
- **Autoprefixer**: CSS vendor prefixing
- **TypeScript**: Type checking

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Email service account (Resend recommended)
- SMS service account (Twilio)

### Environment Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd SEVISPORTAL
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create `.env.local` file:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email Configuration (Resend)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Application Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Database Setup**
- Execute `database/schema.sql` in Supabase SQL Editor
- Run additional migration scripts as needed

5. **Start Development Server**
```bash
npm run dev
```

### Admin Account Setup

1. Register a normal user account
2. Update the user role in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

## Database Schema

### Core Tables

#### Users Table
```sql
users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    national_id VARCHAR(50),
    phone VARCHAR(20),
    photo_url TEXT,
    password_hash TEXT,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    verification_method VARCHAR(20) DEFAULT 'email',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

#### Applications Table
```sql
applications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    service_name VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    application_data JSONB,
    reference_number VARCHAR(50) UNIQUE,
    submitted_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

#### Services Table
```sql
services (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    description TEXT,
    requirements TEXT[],
    processing_time VARCHAR(100),
    fee DECIMAL(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP
)
```

### Supporting Tables
- `email_verifications`: Email verification tokens
- `sms_verifications`: SMS verification codes
- `password_reset_tokens`: Password reset functionality

### Row Level Security (RLS)
All tables implement RLS policies:
- Users can only access their own data
- Services are publicly readable
- Applications are user-scoped
- Admin roles have elevated permissions

## API Documentation

### Authentication Endpoints

#### Send Email Verification
```http
POST /api/auth/send-verification
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token"
}
```

#### Send SMS Verification
```http
POST /api/auth/send-sms-verification
Content-Type: application/json

{
  "phoneNumber": "+1234567890"
}
```

#### Verify SMS
```http
POST /api/auth/verify-sms
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "verificationCode": "123456"
}
```

### Application Endpoints

#### Delete Application
```http
DELETE /api/applications/[id]
Content-Type: application/json

{
  "userId": "user_uuid"
}
```

#### Update Application Status (Admin)
```http
POST /api/admin/applications/[id]/status
Content-Type: application/json

{
  "status": "completed",
  "adminId": "admin_uuid",
  "notes": "Application approved"
}
```

#### Verify Documents (Admin)
```http
POST /api/admin/applications/[id]/verify-documents
Content-Type: application/json

{
  "national_id_verified": true,
  "address_proof_verified": true,
  "verified_by": "admin_uuid",
  "verification_notes": "All documents verified"
}
```

### Admin Endpoints

#### Admin Login
```http
POST /api/admin/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

#### Manual Verification
```http
POST /api/admin/manual-verify
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Frontend Components

### Layout Components

#### Header Component
**Location**: `components/Header.tsx`
**Purpose**: Navigation header with role-based menus
**Features**:
- User authentication state display
- Role-based navigation items
- Mobile responsive menu
- Government branding

#### Footer Component
**Location**: `components/Footer.tsx`
**Purpose**: Site footer with links and information
**Features**:
- Government contact information
- Service links
- Legal information

### Functional Components

#### CityPassCard Component
**Location**: `components/CityPassCard.tsx`
**Purpose**: Digital city pass display with QR code
**Features**:
- QR code generation with application data
- Responsive card layout
- Download functionality
- Expiry date calculation

#### WebcamCapture Component
**Location**: `components/WebcamCapture.tsx`
**Purpose**: Photo capture for applications
**Features**:
- Webcam access and capture
- Image preview and retake
- Base64 image encoding
- Mobile compatibility

#### ConfirmationModal Component
**Location**: `components/ConfirmationModal.tsx`
**Purpose**: Modal confirmations for critical actions
**Features**:
- Customizable confirmation messages
- Action callbacks
- Accessible modal design

### Content Components

#### ServicesGrid Component
**Location**: `components/ServicesGrid.tsx`
**Purpose**: Government services display grid
**Features**:
- Service category organization
- Search and filter functionality
- Responsive grid layout

#### ApplyNowButton Component
**Location**: `components/ApplyNowButton.tsx`
**Purpose**: Service application call-to-action
**Features**:
- Dynamic service routing
- Loading states
- Accessibility features

## Authentication System

### Multi-Channel Verification
The system supports both email and SMS verification:

#### Email Verification Flow
1. User enters email during registration
2. System generates unique verification token
3. Email sent with verification link
4. User clicks link to verify email
5. Account activated upon verification

#### SMS Verification Flow
1. User enters phone number
2. System generates 6-digit verification code
3. SMS sent with verification code
4. User enters code in application
5. Phone number verified upon successful entry

### Password Security
- Passwords hashed using bcryptjs with salt rounds
- Minimum password requirements enforced
- Secure password reset functionality

### Session Management
- JWT-like session tokens stored in localStorage
- Automatic session validation on page load
- Secure logout functionality

## Admin System

### Multi-Tier Admin Roles

#### Super Admin
- **Permissions**: Full system access, user management, system configuration
- **Capabilities**: Create other admins, modify system settings, access all data

#### Approving Admin
- **Permissions**: Final approval/rejection of applications
- **Capabilities**: Review vetted applications, make final decisions

#### Vetting Admin
- **Permissions**: Document verification and initial vetting
- **Capabilities**: Verify uploaded documents, perform initial application review

#### Basic Admin
- **Permissions**: Limited administrative access
- **Capabilities**: View applications, basic reporting

### Admin Workflow

1. **Application Submission**: User submits application with documents
2. **Vetting Phase**: Vetting Admin reviews and verifies documents
3. **In-Progress Status**: Application moves to approval queue
4. **Approval Phase**: Approving Admin makes final decision
5. **Completion**: Approved applications generate digital cards

### Admin Dashboard Features
- Application queue management
- Document verification interface
- Status update capabilities
- User management tools
- System statistics and reporting

## Features

### Government Services

#### Service Categories
1. **Citizen Services**
   - National ID Application
   - Birth Certificate
   - Passport Application
   - Voter Registration
   - City Pass

2. **Business & Commerce**
   - Business Registration
   - Trade Licenses
   - Import/Export Permits
   - Tax Registration

3. **Health Services**
   - Medical Certificates
   - Health Insurance
   - Vaccination Records

4. **Transportation**
   - Driver License
   - Vehicle Registration
   - Road Tax Payment

5. **Legal Services**
   - Legal Documents
   - Court Services
   - Property Registration
   - Building Permits

6. **Public Safety**
   - Police Clearance
   - Security Licenses
   - Emergency Services

### Digital City Pass

#### Features
- **QR Code Generation**: Unique QR codes for verification
- **Secure Data**: Encrypted citizen information
- **Mobile Optimized**: Responsive design for mobile devices
- **Download Capability**: PNG export functionality
- **Expiry Management**: Automatic expiry date calculation

#### QR Code Data Structure
```json
{
  "type": "city_pass",
  "ref": "reference_number",
  "uid": "user_id",
  "issued_at": "2024-01-01T00:00:00Z",
  "expires_at": "2025-01-01T00:00:00Z"
}
```

### Application System

#### Multi-Step Application Process
1. **Service Selection**: Choose government service
2. **Personal Information**: Basic user details
3. **Category Selection**: Service-specific options
4. **Document Upload**: Required document submission
5. **Review & Submit**: Final application review
6. **Tracking**: Real-time status updates

#### Document Management
- **File Types**: PDF, JPG, PNG support
- **Size Limits**: Configurable file size restrictions
- **Base64 Encoding**: Secure document storage
- **Verification System**: Admin document review

### Notification System

#### Email Notifications
- **Registration Confirmation**: Welcome emails
- **Application Updates**: Status change notifications
- **Admin Alerts**: New application notifications
- **System Messages**: Important announcements

#### SMS Notifications
- **Verification Codes**: Phone number verification
- **Status Updates**: Application progress updates
- **Emergency Alerts**: Critical system messages

## Configuration

### Environment Variables

#### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=          # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anonymous key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key

# Email Configuration
RESEND_API_KEY=                    # Resend API key
RESEND_FROM_EMAIL=                 # From email address

# SMS Configuration
TWILIO_ACCOUNT_SID=                # Twilio account SID
TWILIO_AUTH_TOKEN=                 # Twilio auth token
TWILIO_PHONE_NUMBER=               # Twilio phone number

# Application Configuration
NEXT_PUBLIC_BASE_URL=              # Application base URL
```

#### Optional Variables
```bash
# Alternative Email Services
BREVO_API_KEY=                     # Brevo SMTP API key
BREVO_FROM_EMAIL=                  # Brevo from email

# Debug Configuration
NODE_ENV=                          # Environment mode
DEBUG=                             # Debug flags
```

### Tailwind Configuration

#### Papua New Guinea Theme Colors
```javascript
colors: {
  'png-red': '#CE1126',     // PNG national red
  'png-gold': '#FFD700',    // PNG national gold
  'govt-blue': '#1E40AF',   // Government blue
  'govt-green': '#059669',  // Government green
  'govt-orange': '#EA580C', // Government orange
  'govt-purple': '#7C3AED'  // Government purple
}
```

### Next.js Configuration

#### Build Configuration
```javascript
module.exports = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  }
}
```

## Deployment

### Netlify Deployment

#### Prerequisites
- Netlify account
- GitHub repository
- Environment variables configured

#### Deployment Steps
1. **Connect Repository**: Link GitHub repo to Netlify
2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **Set Environment Variables**: Add all required env vars
4. **Deploy**: Automatic deployment on git push

#### Build Configuration
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Production Considerations

#### Performance Optimization
- Image optimization enabled
- Static page generation where possible
- CDN integration for static assets
- Database connection pooling

#### Monitoring
- Error tracking setup
- Performance monitoring
- Uptime monitoring
- User analytics

## Security

### Data Protection

#### Row Level Security (RLS)
- Database-level access control
- User-scoped data access
- Admin role permissions
- Secure data isolation

#### Password Security
- bcryptjs hashing with salt rounds
- Password strength requirements
- Secure password reset flow
- Account lockout protection

#### Input Validation
- Client-side form validation
- Server-side data sanitization
- SQL injection prevention
- XSS attack mitigation

### API Security

#### Authentication
- JWT-like token validation
- Role-based access control
- Session timeout management
- Secure logout procedures

#### Rate Limiting
- API endpoint rate limiting
- Brute force attack prevention
- DDoS protection measures
- Fair usage policies

### File Security

#### Document Upload
- File type validation
- Size limit enforcement
- Virus scanning capability
- Secure file storage

#### Data Encryption
- Sensitive data encryption at rest
- Secure data transmission (HTTPS)
- API key protection
- Environment variable security

## Testing

### Test Strategy

#### Unit Testing
- Component testing with React Testing Library
- Utility function testing
- Database function testing
- API endpoint testing

#### Integration Testing
- Full application flow testing
- Database integration testing
- Third-party service integration
- End-to-end user workflows

#### Manual Testing
- User acceptance testing
- Admin workflow testing
- Cross-browser compatibility
- Mobile device testing

### Test Data

#### Demo Accounts
- Test user accounts for development
- Admin accounts with different roles
- Sample application data
- Mock document uploads

## Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

#### Email Service Issues
```bash
# Verify Resend configuration
RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=verified_email@domain.com
```

#### SMS Service Issues
```bash
# Check Twilio configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=verified_phone_number
```

### Debug Tools

#### Development Mode
```bash
NODE_ENV=development npm run dev
```

#### Debug Endpoints
- `/api/debug/admin-level` - Check admin levels
- `/api/debug/email-config` - Verify email configuration
- `/api/test/email` - Test email sending

### Log Analysis

#### Application Logs
- Next.js server logs
- Database query logs
- Email/SMS service logs
- Error tracking logs

## Development Guidelines

### Code Standards

#### TypeScript
- Strict mode enabled
- Type definitions for all components
- Interface definitions for data structures
- Generic types where applicable

#### React Best Practices
- Functional components with hooks
- Context for global state management
- Custom hooks for reusable logic
- Proper error boundaries

#### Database Best Practices
- Parameterized queries
- Transaction management
- Index optimization
- Regular backup procedures

### Git Workflow

#### Branch Strategy
- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: Feature branches
- `hotfix/*`: Critical bug fixes

#### Commit Standards
- Conventional commit messages
- Atomic commits
- Proper branch protection
- Code review requirements

### Performance Guidelines

#### Frontend Optimization
- Component lazy loading
- Image optimization
- Bundle size monitoring
- Critical CSS inlining

#### Backend Optimization
- Database query optimization
- API response caching
- Connection pooling
- Resource monitoring

---

## Support and Contribution

### Getting Help
- Check this documentation first
- Review existing issues on GitHub
- Create detailed issue reports
- Follow the bug report template

### Contributing
- Fork the repository
- Create feature branches
- Follow coding standards
- Submit pull requests with tests
- Update documentation as needed

### License
This project is proprietary software developed for the Government of Papua New Guinea.

---

*Last Updated: December 2024*
*Version: 1.0.0*
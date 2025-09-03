# Database Updates for Comprehensive Services Portal

This document outlines the database schema updates required to support the enhanced G2C, G2B, and G2G services portal functionality.

## Overview

The database has been enhanced to support:
- **Government-to-Citizen (G2C)** services
- **Government-to-Business (G2B)** services  
- **Government-to-Government (G2G)** services
- Enhanced application workflow tracking
- Improved document management
- Better admin role management

## New Features Added

### 1. Enhanced User Roles
- `super_admin` - Full system access
- `approving_admin` - Can approve/reject applications
- `vetting_admin` - Can verify documents and vet applications
- `admin` - Basic administrative access
- `user` - Regular citizen/business user

### 2. Comprehensive Service Management
- 23 pre-configured services across G2C, G2B, G2G categories
- Service status tracking (available, coming_soon, internal, deprecated)
- Priority levels and target audience classification
- Processing time estimates and fee management

### 3. Application Workflow Tracking
- Complete audit trail for all application status changes
- Multi-stage workflow support
- Admin action tracking with timestamps and notes

### 4. Enhanced Document Management
- Individual document verification status
- Document metadata and file information
- Verification notes and admin assignments

## Database Schema Changes

### New Tables Created

#### `comprehensive_services`
```sql
- id (UUID, Primary Key)
- name (VARCHAR) - Service display name
- service_type (ENUM) - Specific service identifier
- service_category (ENUM) - G2C, G2B, or G2G
- service_status (ENUM) - available, coming_soon, internal, deprecated
- description (TEXT) - Short description
- detailed_description (TEXT) - Comprehensive details
- requirements (TEXT[]) - Service requirements
- documents_required (TEXT[]) - Required documents
- prerequisites (TEXT[]) - Prerequisites
- target_audience (TEXT[]) - Target user groups
- processing_time (VARCHAR) - Human-readable processing time
- estimated_days (INTEGER) - Processing time in days
- fee (DECIMAL) - Service fee in PGK
- priority_level (VARCHAR) - low, medium, high
- is_active (BOOLEAN) - Service availability
- metadata (JSONB) - Additional flexible data
```

#### `application_workflow`
```sql
- id (UUID, Primary Key)
- application_id (UUID, Foreign Key) - References applications
- status (ENUM) - pending, in_progress, completed, rejected
- stage (VARCHAR) - submitted, document_verification, review, approval, completed
- action_by (UUID, Foreign Key) - References users (admin who took action)
- action_date (TIMESTAMP) - When action was taken
- notes (TEXT) - Action notes/comments
- metadata (JSONB) - Additional workflow data
```

#### `application_documents`
```sql
- id (UUID, Primary Key)
- application_id (UUID, Foreign Key) - References applications
- document_type (VARCHAR) - Type of document
- document_name (VARCHAR) - Original filename
- file_path (VARCHAR) - Storage path
- file_size (INTEGER) - File size in bytes
- mime_type (VARCHAR) - File MIME type
- is_verified (BOOLEAN) - Verification status
- verified_by (UUID, Foreign Key) - Admin who verified
- verified_at (TIMESTAMP) - Verification timestamp
- verification_notes (TEXT) - Verification comments
- uploaded_at (TIMESTAMP) - Upload timestamp
```

### New Views Created

#### `v_available_services`
Provides user-friendly service information with category descriptions.

#### `v_application_summary` 
Comprehensive application view with user details, service info, and counts.

### New Enums Created
- `service_category` - G2C, G2B, G2G
- `service_type` - All specific service types (23 total)
- `service_status` - available, coming_soon, internal, deprecated

## Migration Instructions

### Prerequisites
1. **Environment Setup**: Ensure your `.env.local` file contains:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_KEY=your_service_key  # Required for migrations
   ```

2. **Backup**: Always backup your database before running migrations:
   ```bash
   # Export your current database
   pg_dump your_database > backup_before_migration.sql
   ```

### Running the Migration

#### Option 1: Automated Script (Recommended)
```bash
# Install dependencies
npm install

# Run the migration
npm run db:migrate

# Verify the migration
npm run db:verify
```

#### Option 2: Manual Execution
1. Open your Supabase SQL editor
2. Copy the contents of `database/migrations/001_comprehensive_services_update.sql`
3. Execute the SQL statements in order
4. Verify by checking the new tables exist

### Post-Migration Verification

After running the migration, verify the following:

1. **New Tables Created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('comprehensive_services', 'application_workflow', 'application_documents');
   ```

2. **Sample Data Inserted**:
   ```sql
   SELECT service_category, COUNT(*) as count 
   FROM comprehensive_services 
   GROUP BY service_category;
   ```

3. **Views Created**:
   ```sql
   SELECT viewname FROM pg_views WHERE schemaname = 'public';
   ```

## Service Configuration

### G2C Services (12 services)
- ePassport, City Pass, Driver's License, Learner's Permit
- eHealth, eEducation, eCensus, eLands, Digital ID
- eAgriculture, eJustice, eCommon Roll

### G2B Services (6 services)
- GovService Portal, SME Startup Portal, ICT Cluster Portal
- Investment Portal, Business Registration, eProcurement

### G2G Services (8 services)
- eFinance, eBudget, eCabinet, eParliament
- eHR, eCustoms, eAdmission, ePIP

## Updated Code Integration

### New TypeScript Types
```typescript
import { 
  ComprehensiveService, 
  ApplicationWorkflow, 
  ApplicationDocument,
  ServiceCategory,
  ServiceType 
} from './lib/database-types'
```

### Enhanced Database Service
```typescript
import { enhancedDatabaseService } from './lib/enhanced-database'

// Get services by category
const g2cServices = await enhancedDatabaseService.getServicesByCategory('G2C')

// Get application with full workflow
const appDetails = await enhancedApplicationService.getApplicationWithDetails(appId)
```

## Security Updates

### Row Level Security (RLS)
- Public read access to available/coming_soon services
- Users can only view their own workflows and documents
- Admins have full access based on role verification

### Policies Applied
- Service visibility based on status
- Application data privacy protection
- Admin access control by role level

## Troubleshooting

### Common Issues

1. **Migration Script Fails**:
   - Ensure `SUPABASE_SERVICE_KEY` is set (not just `SUPABASE_ANON_KEY`)
   - Check database permissions
   - Review error logs for specific SQL issues

2. **RPC Function Not Available**:
   - Some Supabase instances may not have `execute_sql` RPC
   - Copy SQL from migration file and run manually in Supabase SQL editor

3. **View Creation Errors**:
   - Ensure base tables are created first
   - Check for conflicting view names
   - Verify all referenced columns exist

### Rollback Instructions

If you need to rollback the migration:

```sql
-- Drop new tables (this will delete all data!)
DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS application_workflow CASCADE;
DROP TABLE IF EXISTS comprehensive_services CASCADE;

-- Drop views
DROP VIEW IF EXISTS v_available_services;
DROP VIEW IF EXISTS v_application_summary;

-- Drop enums
DROP TYPE IF EXISTS service_category CASCADE;
DROP TYPE IF EXISTS service_type CASCADE;
DROP TYPE IF EXISTS service_status CASCADE;

-- Restore original user role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin'));
```

## Support

For issues with the database migration:

1. Check the migration logs for specific error messages
2. Verify your Supabase permissions and environment variables
3. Review the SQL statements in the migration file
4. Test the migration on a development database first

## Next Steps

After successful migration:

1. **Update Frontend Code**: Use the new enhanced database service
2. **Test Service Integration**: Verify G2C, G2B, G2G service flows
3. **Admin Panel Updates**: Implement workflow and document management
4. **User Testing**: Test the enhanced application tracking features

---

**Migration Version**: 001_comprehensive_services_update  
**Date**: January 11, 2025  
**Compatibility**: Supabase PostgreSQL 14+
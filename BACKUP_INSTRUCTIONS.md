# Database Backup Instructions for SEVIS Portal

## Overview

This document provides comprehensive instructions for backing up the SEVIS Portal database before applying migrations or major updates.

## Quick Start

```bash
# Backup the database
npm run db:backup

# Or run directly
node scripts/backup-database.js
```

## Prerequisites

### Environment Variables
Ensure your `.env.local` file contains:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_service_role_key
```

**Important**: You need the `SUPABASE_SERVICE_KEY` (service role key) for full database access, not just the anon key.

### Dependencies
- Node.js 16+ installed
- `@supabase/supabase-js` package (already in package.json)
- `dotenv` package (already in package.json)

## Backup Process

### 1. Automated Backup Script

The backup script (`scripts/backup-database.js`) performs:

- **Complete table backup**: All public schema tables with data
- **Schema preservation**: Column definitions, data types, constraints
- **Metadata backup**: Database version, indexes, relationships
- **Verification**: Automatic backup integrity checking
- **Summary generation**: Human-readable backup report

### 2. What Gets Backed Up

#### Tables Included
- `users` - User accounts and profiles
- `applications` - All application submissions
- `comprehensive_services` - Service definitions (if migrated)
- `application_workflow` - Workflow tracking (if migrated)
- `application_documents` - Document metadata (if migrated)
- All other public schema tables

#### Metadata Included
- Table schemas and column definitions
- Primary keys and foreign key relationships
- Indexes and database constraints
- Database version information
- Backup timestamp and statistics

### 3. Backup Location

Backups are saved to:
```
backups/
├── sevis_backup_2025-01-11_14-30-25.json    # Full backup data
└── sevis_backup_2025-01-11_14-30-25_summary.txt  # Human-readable summary
```

## Manual Backup (Alternative Method)

### Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **Database**
3. Scroll to **Database Backups**
4. Click **Download backup** for the latest automatic backup

### Using PostgreSQL Tools
```bash
# If you have direct database access
pg_dump "postgresql://postgres:[password]@[host]:[port]/postgres" > backup.sql

# Using Supabase connection string
pg_dump "your_supabase_connection_string" > sevis_backup.sql
```

## Backup Verification

The script automatically verifies the backup by:

1. **File Validation**: Ensures backup file is valid JSON
2. **Structure Check**: Verifies all required fields are present
3. **Data Integrity**: Confirms table data was backed up correctly
4. **Summary Report**: Generates detailed backup statistics

### Manual Verification
```bash
# Check backup file exists and is not empty
ls -la backups/

# Validate JSON structure
node -e "console.log('Valid:', JSON.parse(require('fs').readFileSync('backups/sevis_backup_[timestamp].json'))?.tables ? 'Yes' : 'No')"
```

## Understanding the Backup

### Backup File Structure
```json
{
  "timestamp": "2025-01-11T14:30:25.123Z",
  "supabase_url": "https://***",
  "version": "1.0.0",
  "tables": {
    "users": {
      "schema": [...],
      "data": [...],
      "record_count": 150
    },
    "applications": {
      "schema": [...],
      "data": [...],
      "record_count": 89
    }
  },
  "metadata": {
    "database_version": [...],
    "constraints": [...],
    "indexes": [...]
  }
}
```

### Summary Report
The summary file contains:
- Backup timestamp and database URL
- Table-by-table backup status
- Record counts for each table
- Error messages (if any)
- Next steps recommendations

## Best Practices

### Before Major Changes
1. **Always backup** before running migrations
2. **Test locally** on development database first
3. **Verify backup** completion before proceeding
4. **Keep multiple backups** for different time periods

### Backup Frequency
- **Before migrations**: Always
- **Before major updates**: Required
- **Regular schedule**: Weekly/monthly for peace of mind
- **Before data changes**: Before bulk operations

### Storage Recommendations
- Keep backups in **secure location**
- **Don't commit** backup files to git (they contain sensitive data)
- Consider **cloud storage** for important backups
- **Test restore** procedures periodically

## Troubleshooting

### Common Issues

#### 1. Missing Environment Variables
```
❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables
```
**Solution**: Check your `.env.local` file and ensure both variables are set.

#### 2. Permission Errors
```
❌ Error getting table list: insufficient_privilege
```
**Solution**: Ensure you're using the service role key, not the anon key.

#### 3. Large Database Timeout
```
❌ Backup failed: timeout
```
**Solution**: The script handles large databases, but you may need to increase timeout or backup in chunks.

#### 4. Disk Space Issues
```
❌ Error writing backup file
```
**Solution**: Check available disk space. Large databases create large backup files.

### Debug Mode

To run backup with detailed logging:
```bash
DEBUG=true npm run db:backup
```

### Recovery from Failed Backup

If backup fails partway through:
1. Check the error message in console
2. Fix the underlying issue (permissions, connection, etc.)
3. Delete incomplete backup file
4. Run backup again

## Restore Procedures

### Important Notes
- **Backup is not a restore script** - it's for data preservation
- Restoring requires manual database recreation or migration rollback
- Test restore procedures in development environment first

### Manual Restore Process
1. Create fresh database or rollback migrations
2. Extract table data from backup JSON file
3. Recreate tables using schema information
4. Insert data using SQL INSERT statements
5. Recreate constraints and indexes

### Professional Restore
For production environments, consider:
- Using professional database backup/restore tools
- Supabase's built-in backup system
- Point-in-time recovery capabilities

## Security Considerations

### Sensitive Data
- Backup files contain **all user data**
- **Never share** backup files publicly
- **Store securely** with proper access controls
- Consider **encryption** for backup storage

### Access Control
- Use service role keys only when necessary
- **Rotate keys** periodically
- **Monitor access** to backup files
- **Delete old backups** when no longer needed

## Support and Monitoring

### Backup Success Monitoring
The script outputs detailed status:
- ✅ Success indicators for each table
- ❌ Error messages for failed operations
- 📊 Summary statistics
- 🎉 Final confirmation

### Getting Help
If backups fail:
1. Check environment variables
2. Verify database connectivity
3. Review error messages carefully
4. Check Supabase project status
5. Try manual backup methods

---

**Script Location**: `scripts/backup-database.js`  
**Package Command**: `npm run db:backup`  
**Output Directory**: `backups/`  
**Last Updated**: January 11, 2025
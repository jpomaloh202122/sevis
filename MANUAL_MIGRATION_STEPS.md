# Manual Migration Steps for SEVIS Portal

## Overview
Since RPC functions aren't available in this Supabase instance, the migration needs to be executed manually using the Supabase SQL Editor.

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Create a **New Query**

### 2. Execute Core Schema Changes

Copy and paste the following SQL statements one section at a time:

#### A. Create Enums
```sql
CREATE TYPE IF NOT EXISTS service_category AS ENUM ('G2C', 'G2B', 'G2G');
CREATE TYPE IF NOT EXISTS service_status AS ENUM ('available', 'coming_soon', 'internal', 'deprecated');
CREATE TYPE IF NOT EXISTS service_type AS ENUM (
  'epassport', 'city_pass', 'drivers_license', 'learners_permit', 
  'ehealth', 'eeducation', 'ecensus', 'elands', 'digital_id', 
  'eagriculture', 'ejustice', 'ecommon_roll', 'evoting',
  'gov_service_portal', 'sme_startup_portal', 'ict_cluster_portal',
  'investment_portal', 'business_registration', 'eprocurement_business',
  'efinance', 'ebudget', 'ecabinet', 'eparliament', 'ehr',
  'eprocurement_gov', 'ecustoms', 'eadmission', 'epip'
);
```

#### B. Update Users Table
```sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'super_admin', 'approving_admin', 'vetting_admin'));
```

#### C. Create Comprehensive Services Table
```sql
CREATE TABLE IF NOT EXISTS comprehensive_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  service_type service_type NOT NULL UNIQUE,
  service_category service_category NOT NULL,
  service_status service_status NOT NULL DEFAULT 'available',
  description TEXT NOT NULL,
  detailed_description TEXT,
  requirements TEXT[],
  documents_required TEXT[],
  prerequisites TEXT[],
  target_audience TEXT[],
  processing_time VARCHAR(50),
  estimated_days INTEGER,
  fee DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PGK',
  priority_level VARCHAR(10) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  launch_date DATE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

### 3. Insert Service Data

Use the insert statements from the migration file (001_comprehensive_services_fixed.sql) to populate the services.

### 4. Create Additional Tables (if needed)

```sql
-- Application Workflow Table
CREATE TABLE IF NOT EXISTS application_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  stage VARCHAR(50) NOT NULL,
  action_by UUID REFERENCES users(id),
  action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Application Documents Table
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);
```

### 5. Create Views and Indexes

Execute the remaining statements from the fixed migration file.

### 6. Verification

After executing the SQL statements, verify the migration by running:

```bash
npm run db:verify
```

## Troubleshooting

- **Permission Errors**: Ensure you're using the service role key
- **Enum Conflicts**: Drop existing types if you need to recreate them
- **Foreign Key Errors**: Ensure referenced tables exist before creating foreign keys

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

```bash
supabase db reset --linked
supabase db push
```

---

Generated: 2025-08-11T17:18:45.461Z

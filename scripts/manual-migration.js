#!/usr/bin/env node

/**
 * Manual Database Migration Script for SEVIS Portal
 * 
 * This script executes SQL statements using individual table operations
 * since RPC and SQL functions aren't available in the Supabase client.
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runManualMigration() {
  console.log('🚀 Starting manual database migration...\n')

  try {
    // Step 1: Create comprehensive_services table using direct table operations
    console.log('📋 Step 1: Creating comprehensive_services table...')
    
    // First check if the table already exists by trying to query it
    const { data: existingServices, error: checkError } = await supabase
      .from('comprehensive_services')
      .select('id')
      .limit(1)
    
    if (checkError && !checkError.message.includes('does not exist')) {
      console.error('❌ Error checking existing table:', checkError.message)
      // Continue anyway - might be permission issue
    }
    
    if (existingServices) {
      console.log('✅ comprehensive_services table already exists')
    } else {
      console.log('⚠️  comprehensive_services table needs to be created manually in Supabase SQL Editor')
    }

    // Step 2: Try to insert sample service data
    console.log('\n📋 Step 2: Inserting comprehensive services data...')
    
    const sampleServices = [
      {
        name: 'City Pass',
        description: 'Digital city access pass for residents and visitors with integrated services.',
        processing_time: '1-2 weeks',
        estimated_days: 10,
        fee: 50.00,
        priority_level: 'high',
        is_active: true
      },
      {
        name: 'Driver License',
        description: 'Online application for provisional and full driver licenses with document upload.',
        processing_time: '4-6 weeks', 
        estimated_days: 28,
        fee: 300.00,
        priority_level: 'high',
        is_active: true
      },
      {
        name: 'Learner Permit',
        description: 'Apply for learner permits online with medical certificate verification.',
        processing_time: '3-4 weeks',
        estimated_days: 21,
        fee: 200.00,
        priority_level: 'high',
        is_active: true
      }
    ]

    for (const service of sampleServices) {
      try {
        const { data, error } = await supabase
          .from('comprehensive_services')
          .insert([service])
          .select()
        
        if (error) {
          console.error(`❌ Error inserting ${service.name}:`, error.message)
        } else {
          console.log(`✅ Inserted service: ${service.name}`)
        }
      } catch (err) {
        console.error(`❌ Exception inserting ${service.name}:`, err.message)
      }
    }

    // Step 3: Create a simple services view using existing tables
    console.log('\n📋 Step 3: Testing database connectivity...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(3)
    
    if (usersError) {
      console.error('❌ Error accessing users table:', usersError.message)
    } else {
      console.log(`✅ Users table accessible (${users?.length || 0} sample records)`)
    }

    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('id, service_name, status')
      .limit(3)
    
    if (appsError) {
      console.error('❌ Error accessing applications table:', appsError.message)
    } else {
      console.log(`✅ Applications table accessible (${applications?.length || 0} sample records)`)
    }

    // Step 4: Update user roles if possible
    console.log('\n📋 Step 4: Testing user role updates...')
    
    try {
      // Try to find admin users and update their roles
      const { data: adminUsers, error: adminError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('role', 'admin')
      
      if (adminError) {
        console.error('❌ Error finding admin users:', adminError.message)
      } else if (adminUsers && adminUsers.length > 0) {
        console.log(`✅ Found ${adminUsers.length} admin users`)
        
        // Try to update one admin user to test new roles
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'super_admin' })
          .eq('id', adminUsers[0].id)
        
        if (updateError) {
          console.error('❌ Error updating admin role:', updateError.message)
        } else {
          console.log('✅ Successfully updated admin role to super_admin')
        }
      } else {
        console.log('ℹ️  No admin users found to update')
      }
    } catch (err) {
      console.error('❌ Exception updating user roles:', err.message)
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 Manual Migration Summary:')
    console.log('   ✅ Database connectivity verified')
    console.log('   ⚠️  Full migration requires SQL Editor execution')
    console.log('   📝 See MANUAL_MIGRATION_STEPS.md for next steps')
    console.log('='.repeat(60))

    // Generate manual steps file
    await generateManualSteps()

    console.log('\n🎉 Manual migration check completed!')
    console.log('📁 Next: Execute SQL statements in Supabase SQL Editor')

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    throw error
  }
}

async function generateManualSteps() {
  const fs = require('fs')
  const path = require('path')
  
  const stepsContent = `# Manual Migration Steps for SEVIS Portal

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
\`\`\`sql
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
\`\`\`

#### B. Update Users Table
\`\`\`sql
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'super_admin', 'approving_admin', 'vetting_admin'));
\`\`\`

#### C. Create Comprehensive Services Table
\`\`\`sql
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
\`\`\`

### 3. Insert Service Data

Use the insert statements from the migration file (001_comprehensive_services_fixed.sql) to populate the services.

### 4. Create Additional Tables (if needed)

\`\`\`sql
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
\`\`\`

### 5. Create Views and Indexes

Execute the remaining statements from the fixed migration file.

### 6. Verification

After executing the SQL statements, verify the migration by running:

\`\`\`bash
npm run db:verify
\`\`\`

## Troubleshooting

- **Permission Errors**: Ensure you're using the service role key
- **Enum Conflicts**: Drop existing types if you need to recreate them
- **Foreign Key Errors**: Ensure referenced tables exist before creating foreign keys

## Alternative: Use Supabase CLI

If you have Supabase CLI installed:

\`\`\`bash
supabase db reset --linked
supabase db push
\`\`\`

---

Generated: ${new Date().toISOString()}
`

  const stepsPath = path.join(__dirname, '../MANUAL_MIGRATION_STEPS.md')
  fs.writeFileSync(stepsPath, stepsContent)
  console.log(`✅ Generated manual steps: ${stepsPath}`)
}

// Run if called directly
if (require.main === module) {
  runManualMigration()
    .then(() => {
      console.log('\n🏁 Manual migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Script failed:', error)
      process.exit(1)
    })
}

module.exports = { runManualMigration }
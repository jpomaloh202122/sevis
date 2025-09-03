#!/usr/bin/env node

/**
 * Database Update Script for Comprehensive Services
 * 
 * This script applies the comprehensive services database migration
 * to update the schema with G2C, G2B, and G2G service support.
 * 
 * Usage:
 *   node scripts/update-database.js
 * 
 * Requirements:
 *   - SUPABASE_URL and SUPABASE_ANON_KEY environment variables
 *   - Database admin privileges
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Starting comprehensive services database migration...\n')

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../database/migrations/001_comprehensive_services_fixed.sql')
    
    if (!fs.existsSync(migrationPath)) {
      console.error('❌ Migration file not found:', migrationPath)
      process.exit(1)
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    console.log('📖 Migration file loaded successfully')

    // Split the migration into individual statements, handling DO blocks properly
    const statements = []
    let currentStatement = ''
    let inDoBlock = false
    let blockDepth = 0
    
    const lines = migrationSQL.split('\n')
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue
      }
      
      currentStatement += line + '\n'
      
      // Track DO blocks
      if (trimmedLine.includes('DO $$') || trimmedLine.includes('DO $')) {
        inDoBlock = true
        blockDepth = 1
      } else if (inDoBlock && trimmedLine.includes('$$')) {
        blockDepth--
        if (blockDepth === 0) {
          inDoBlock = false
          statements.push(currentStatement.trim())
          currentStatement = ''
          continue
        }
      }
      
      // Regular statement ending
      if (!inDoBlock && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim())
        currentStatement = ''
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim())
    }

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.trim().length === 0) continue

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)
        
        // Use the newer SQL execute function if available, otherwise try RPC
        let error = null
        
        try {
          // Try using the SQL function if available (Supabase CLI/API)
          const response = await supabase.rpc('sql', { 
            query: statement 
          })
          error = response.error
        } catch (rpcError) {
          // Fallback: try direct execution via REST API
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
              },
              body: JSON.stringify({ query: statement })
            })
            
            if (!response.ok) {
              const errorData = await response.text()
              throw new Error(`HTTP ${response.status}: ${errorData}`)
            }
          } catch (fetchError) {
            // If both methods fail, log and continue with next statement
            console.log(`⚠️  Unable to execute via RPC or REST API: ${fetchError.message}`)
            console.log(`📝 Statement: ${statement.substring(0, 100)}...`)
            throw fetchError
          }
        }

        if (error) {
          throw error
        }

        console.log(`✅ Statement ${i + 1} executed successfully`)
        successCount++
        
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}:`, error.message)
        
        // Check if it's a "already exists" error, which we can ignore
        if (error.message.includes('already exists') || 
            error.message.includes('already exists')) {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists)`)
          successCount++
        } else {
          errorCount++
          
          // Show the problematic statement for debugging
          console.error(`Problematic statement: ${statement.substring(0, 100)}...`)
        }
      }
      
      // Small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n' + '='.repeat(50))
    console.log(`📊 Migration Summary:`)
    console.log(`   ✅ Successful: ${successCount}`)
    console.log(`   ❌ Errors: ${errorCount}`)
    console.log(`   📋 Total: ${statements.length}`)

    if (errorCount === 0) {
      console.log('\n🎉 Database migration completed successfully!')
      await verifyMigration()
    } else {
      console.log(`\n⚠️  Migration completed with ${errorCount} errors`)
      console.log('Please check the errors above and run the migration again if needed')
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...')

  try {
    // Check if comprehensive_services table exists and has data
    const { data: services, error: servicesError } = await supabase
      .from('comprehensive_services')
      .select('id, name, service_category')
      .limit(5)

    if (servicesError) {
      console.error('❌ Error verifying comprehensive_services table:', servicesError.message)
      return
    }

    console.log(`✅ comprehensive_services table verified (${services?.length || 0} sample records)`)

    // Check if views exist
    const { data: viewData, error: viewError } = await supabase
      .from('v_available_services')
      .select('id, name, category_description')
      .limit(3)

    if (viewError) {
      console.error('❌ Error verifying views:', viewError.message)
      return
    }

    console.log(`✅ Views verified (${viewData?.length || 0} sample records)`)

    // Show some sample data
    if (services && services.length > 0) {
      console.log('\n📋 Sample services:')
      services.forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.name} (${service.service_category})`)
      })
    }

    console.log('\n✅ Migration verification completed successfully!')

  } catch (error) {
    console.error('❌ Verification failed:', error.message)
  }
}

// Alternative method for environments where RPC is not available
async function executeWithDirectQuery(statement) {
  // This would require implementing direct SQL execution
  // For now, we'll log the statement for manual execution
  console.log('📝 Statement for manual execution:')
  console.log(statement)
  console.log('---')
}

// Run the migration
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🏁 Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error)
      process.exit(1)
    })
}

module.exports = { runMigration, verifyMigration }
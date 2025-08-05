// Test Supabase Connection
// Run this with: node test-supabase.js

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 Testing Supabase Connection...')
console.log('URL:', supabaseUrl ? '✅ Configured' : '❌ Missing')
console.log('Key:', supabaseKey ? '✅ Configured' : '❌ Missing')

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('\n🔄 Testing connection...')
    
    // Test basic connection by querying services table
    const { data, error } = await supabase
      .from('services')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('❌ Connection failed:', error.message)
      
      if (error.message.includes('relation "services" does not exist')) {
        console.log('💡 Database schema not set up yet. Run the schema.sql in Supabase SQL Editor.')
      } else if (error.message.includes('Invalid API key')) {
        console.log('💡 Check your API keys in .env.local')
      } else if (error.message.includes('JWT')) {
        console.log('💡 Authentication issue - check your API keys')
      }
      
      return false
    }
    
    console.log('✅ Connection successful!')
    console.log('✅ Supabase is properly configured and accessible.')
    
    return true
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message)
    return false
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Supabase connection test passed!')
  } else {
    console.log('\n⚠️  Supabase connection test failed. Check your configuration.')
  }
  process.exit(success ? 0 : 1)
}) 
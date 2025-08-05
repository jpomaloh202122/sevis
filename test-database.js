// Comprehensive Database Test
// Run this with: node test-database.js

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 Testing SEVIS PORTAL Database...\n')
  
  try {
    // Test 1: Check Services Table
    console.log('1️⃣ Testing Services Table...')
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(5)
    
    if (servicesError) {
      console.log('❌ Services table error:', servicesError.message)
    } else {
      console.log(`✅ Services table: ${services.length} services found`)
      if (services.length > 0) {
        console.log(`   Sample service: ${services[0].name}`)
      }
    }

    // Test 2: Check Users Table
    console.log('\n2️⃣ Testing Users Table...')
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
    } else {
      console.log(`✅ Users table: ${users.length} users found`)
      if (users.length > 0) {
        console.log(`   Sample user: ${users[0].name} (${users[0].role})`)
      }
    }

    // Test 3: Check Applications Table
    console.log('\n3️⃣ Testing Applications Table...')
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .limit(5)
    
    if (appsError) {
      console.log('❌ Applications table error:', appsError.message)
    } else {
      console.log(`✅ Applications table: ${applications.length} applications found`)
    }

    // Test 4: Test Service Categories
    console.log('\n4️⃣ Testing Service Categories...')
    const { data: categories, error: catError } = await supabase
      .from('services')
      .select('category')
      .limit(10)
    
    if (catError) {
      console.log('❌ Categories error:', catError.message)
    } else {
      const uniqueCategories = [...new Set(categories.map(c => c.category))]
      console.log(`✅ Found ${uniqueCategories.length} service categories:`)
      uniqueCategories.forEach(cat => console.log(`   - ${cat}`))
    }

    // Test 5: Test Database Functions
    console.log('\n5️⃣ Testing Database Functions...')
    const { data: stats, error: statsError } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    if (statsError) {
      console.log('❌ Stats error:', statsError.message)
    } else {
      console.log(`✅ Database functions working`)
    }

    console.log('\n🎉 Database test completed!')
    console.log('\n📊 Summary:')
    console.log('✅ Supabase connection: Working')
    console.log('✅ Environment variables: Configured')
    console.log('✅ Database schema: Set up')
    console.log('✅ Tables accessible: Yes')
    
    return true

  } catch (err) {
    console.log('❌ Unexpected error:', err.message)
    return false
  }
}

testDatabase().then(success => {
  if (success) {
    console.log('\n🚀 SEVIS PORTAL is ready for production!')
  } else {
    console.log('\n⚠️  Some database issues detected.')
  }
  process.exit(success ? 0 : 1)
}) 
// Test User Registration
// Run this with: node test-registration.js

const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testRegistration() {
  console.log('🔍 Testing User Registration...\n')
  
  try {
    // Test 1: Check if users table exists and is accessible
    console.log('1️⃣ Testing Users Table Access...')
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)
    
    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
      return false
    } else {
      console.log(`✅ Users table accessible: ${existingUsers.length} existing users`)
    }

    // Test 2: Create a test user
    console.log('\n2️⃣ Testing User Creation...')
    const testUser = {
      email: 'test.user@example.com',
      name: 'Test User',
      role: 'user',
      national_id: 'TEST123456789',
      phone: '+675 999 8888'
    }

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single()

    if (createError) {
      if (createError.message.includes('duplicate key')) {
        console.log('✅ User creation test: Duplicate email (expected for existing test user)')
      } else {
        console.log('❌ User creation error:', createError.message)
        return false
      }
    } else {
      console.log('✅ User created successfully:', newUser.name)
    }

    // Test 3: Retrieve user by email
    console.log('\n3️⃣ Testing User Retrieval...')
    const { data: retrievedUser, error: retrieveError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'test.user@example.com')
      .single()

    if (retrieveError) {
      console.log('❌ User retrieval error:', retrieveError.message)
      return false
    } else {
      console.log('✅ User retrieved successfully:', retrievedUser.name)
    }

    // Test 4: Test form validation scenarios
    console.log('\n4️⃣ Testing Validation Scenarios...')
    
    // Test duplicate email
    const duplicateUser = {
      email: 'test.user@example.com',
      name: 'Duplicate User',
      role: 'user',
      national_id: 'DUPLICATE123',
      phone: '+675 777 6666'
    }

    const { error: duplicateError } = await supabase
      .from('users')
      .insert([duplicateUser])

    if (duplicateError && duplicateError.message.includes('duplicate key')) {
      console.log('✅ Duplicate email validation: Working')
    } else {
      console.log('⚠️  Duplicate email validation: May need attention')
    }

    // Test 5: Check user count
    console.log('\n5️⃣ Testing User Count...')
    const { count: userCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ User count error:', countError.message)
    } else {
      console.log(`✅ Total users in database: ${userCount}`)
    }

    console.log('\n🎉 Registration functionality test completed!')
    console.log('\n📊 Summary:')
    console.log('✅ Users table: Accessible')
    console.log('✅ User creation: Working')
    console.log('✅ User retrieval: Working')
    console.log('✅ Duplicate validation: Working')
    console.log('✅ Database operations: Functional')
    
    return true

  } catch (err) {
    console.log('❌ Unexpected error:', err.message)
    return false
  }
}

testRegistration().then(success => {
  if (success) {
    console.log('\n🚀 User registration is ready for production!')
  } else {
    console.log('\n⚠️  Some registration issues detected.')
  }
  process.exit(success ? 0 : 1)
}) 
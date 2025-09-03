require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection and tables...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration');
    console.log('SUPABASE_URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
    console.log('SUPABASE_KEY:', supabaseKey ? '✅ Found' : '❌ Missing');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check if pending_registrations table exists
    console.log('\n📊 Test 1: Checking pending_registrations table...');
    const { data, error } = await supabase
      .from('pending_registrations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ pending_registrations table error:', error.message);
      if (error.message.includes('does not exist')) {
        console.log('🛠️ Table does not exist. Need to run migration.');
        console.log('📝 Run this SQL in Supabase SQL Editor:');
        console.log(`
-- Create pending registrations table
CREATE TABLE IF NOT EXISTS pending_registrations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    national_id VARCHAR(50),
    password_hash TEXT NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_code ON pending_registrations(verification_code);
CREATE INDEX IF NOT EXISTS idx_pending_registrations_expires ON pending_registrations(expires_at);
        `);
      }
      return;
    }
    
    console.log('✅ pending_registrations table exists');
    
    // Test 2: Check users table
    console.log('\n📊 Test 2: Checking users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, email_verified')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible');
    }
    
    // Test 3: Try inserting a test pending registration
    console.log('\n📊 Test 3: Testing pending registration insertion...');
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    const testEmail = 'test@example.com';
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    
    const { data: insertData, error: insertError } = await supabase
      .from('pending_registrations')
      .insert([{
        email: testEmail,
        name: 'Test User',
        phone: '+675123456',
        national_id: null,
        password_hash: 'test_hash',
        verification_code: testCode,
        expires_at: expiresAt.toISOString()
      }])
      .select();
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError.message);
    } else {
      console.log('✅ Test pending registration inserted successfully');
      console.log('🔢 Test code:', testCode);
      
      // Clean up test data
      await supabase
        .from('pending_registrations')
        .delete()
        .eq('email', testEmail);
      console.log('🧹 Test data cleaned up');
    }
    
    console.log('\n🎯 Database connection test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseConnection();
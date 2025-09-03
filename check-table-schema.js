require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkTableSchema() {
  console.log('🔍 Checking table schema...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get table schema info
    const { data, error } = await supabase.rpc('get_table_schema', {
      table_name: 'pending_registrations'
    });
    
    if (error) {
      console.log('Using alternative method to check schema...');
      
      // Try to select all columns to see what exists
      const { data: sampleData, error: selectError } = await supabase
        .from('pending_registrations')
        .select('*')
        .limit(0); // Just get column info, no data
      
      if (selectError) {
        console.error('❌ Error:', selectError.message);
        console.log('\n📝 You need to create the pending_registrations table with this SQL:');
        console.log(`
-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS pending_registrations;

-- Create pending registrations table with correct schema
CREATE TABLE pending_registrations (
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
CREATE INDEX idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX idx_pending_registrations_code ON pending_registrations(verification_code);
CREATE INDEX idx_pending_registrations_expires ON pending_registrations(expires_at);
        `);
      } else {
        console.log('✅ Table exists but with limited schema info available');
      }
    } else {
      console.log('📊 Table schema:', data);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.log('\n🛠️ The pending_registrations table needs to be created or updated.');
    console.log('📝 Run this SQL in your Supabase SQL Editor:');
    console.log(`
-- Drop existing table if it has wrong schema
DROP TABLE IF EXISTS pending_registrations;

-- Create pending registrations table with correct schema
CREATE TABLE pending_registrations (
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
CREATE INDEX idx_pending_registrations_email ON pending_registrations(email);
CREATE INDEX idx_pending_registrations_code ON pending_registrations(verification_code);
CREATE INDEX idx_pending_registrations_expires ON pending_registrations(expires_at);
    `);
  }
}

checkTableSchema();
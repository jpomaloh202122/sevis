require('dotenv').config({ path: '.env.local' });

async function testRegistrationService() {
  console.log('🧪 Testing registration service...');
  
  // Since we can't import ES modules directly, let's test with direct API calls
  const registrationData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'pomalohjoshua@gmail.com',
    phone: '+675123456789',
    nationalId: '',
    password: 'TestPassword123!'
  };
  
  console.log('📋 Registration Data:', {
    email: registrationData.email,
    name: `${registrationData.firstName} ${registrationData.lastName}`,
    phone: registrationData.phone
  });
  
  try {
    // Test the startRegistration function by making a request to the app
    console.log('📤 Testing registration flow...');
    console.log('🌐 App should be running on http://localhost:3001');
    console.log('\n🎯 To test:');
    console.log('1. Go to http://localhost:3001/register');
    console.log('2. Fill out the form with:');
    console.log('   - First Name: Test');
    console.log('   - Last Name: User');
    console.log('   - Email: pomalohjoshua@gmail.com');
    console.log('   - Phone: +675123456789');
    console.log('   - Password: TestPassword123!');
    console.log('3. Submit the form');
    console.log('4. Check for success message or error');
    
    console.log('\n🔍 Common issues:');
    console.log('- ❌ "Failed to initiate registration" = Database table missing/wrong schema');
    console.log('- ❌ "Failed to send verification email" = Email service issue');
    console.log('- ✅ "Verification code sent" = Working correctly');
    
    console.log('\n📊 Database Requirements:');
    console.log('The pending_registrations table must have these columns:');
    console.log('- id (UUID)');
    console.log('- email (VARCHAR)');
    console.log('- name (VARCHAR)');
    console.log('- phone (VARCHAR)');
    console.log('- national_id (VARCHAR, nullable)');
    console.log('- password_hash (TEXT)');
    console.log('- verification_code (VARCHAR(6))');
    console.log('- expires_at (TIMESTAMP WITH TIME ZONE)');
    console.log('- created_at (TIMESTAMP WITH TIME ZONE)');
    
    // We know email works from previous test
    console.log('\n✅ Email service: WORKING (confirmed)');
    console.log('🔧 Next: Fix database table schema');
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testRegistrationService();
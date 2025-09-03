require('dotenv').config({ path: '.env.local' });

async function testRegistrationAPI() {
  console.log('🧪 Testing Registration API...');
  
  const baseUrl = 'http://localhost:3001'; // Dev server port
  
  const testData = {
    firstName: 'Test',
    lastName: 'User',
    email: 'pomalohjoshua@gmail.com',
    phone: '+675123456789',
    nationalId: '',
    password: 'TestPassword123!'
  };
  
  try {
    console.log('📤 Calling registration API...');
    console.log('Data:', {
      firstName: testData.firstName,
      lastName: testData.lastName,
      email: testData.email,
      phone: testData.phone
    });
    
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registration API successful!');
      console.log('📝 Response:', result);
      console.log('\n🎯 Check your email (pomalohjoshua@gmail.com) for the 6-digit verification code!');
      
      // Instructions for completing registration
      console.log('\n📋 Next Steps:');
      console.log('1. Check your email for the verification code');
      console.log('2. Go to: http://localhost:3001/verify-email-code');
      console.log('3. Enter your email: pomalohjoshua@gmail.com');
      console.log('4. Enter the 6-digit code from your email');
      console.log('5. Your account will be created!');
      
    } else {
      const errorData = await response.json();
      console.error('❌ Registration API failed:');
      console.error('Status:', response.status);
      console.error('Error:', errorData.error);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testRegistrationAPI();
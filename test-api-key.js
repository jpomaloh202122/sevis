require('dotenv').config({ path: '.env.local' });

async function testApiKey() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ No API key found');
    return;
  }
  
  console.log('🔑 Testing API key:', apiKey);
  console.log('📏 Key length:', apiKey.length);
  
  try {
    // Test with a simple API call to get domains
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API key is valid!');
      console.log('📊 Domains:', data);
    } else {
      const errorText = await response.text();
      console.log('❌ API error:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testApiKey();
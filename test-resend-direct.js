require('dotenv').config({ path: '.env.local' })

async function testResendDirect() {
  console.log('🧪 Testing Resend API Directly...')
  console.log('================================')
  
  // Check API key
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables')
    return
  }
  
  console.log('✅ Resend API Key found:', apiKey.substring(0, 10) + '...')
  console.log('')
  
  try {
    console.log('📧 Sending test email via Resend API...')
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SEVIS Portal <onboarding@resend.dev>', // Using Resend's test domain
        to: ['pomalohjoshua@gmail.com'],
        subject: 'Test Email from SEVIS Portal - Resend Integration',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #fbbf24;">🎉 SEVIS PORTAL</h1>
              <p style="margin: 10px 0 0 0; color: #d1d5db;">Resend Integration Test</p>
            </div>
            
            <div style="padding: 30px; background-color: #ffffff;">
              <h2 style="color: #1f2937;">Resend Test Successful!</h2>
              <p style="color: #374151;">
                This email confirms that your Resend integration is working correctly.
              </p>
              <div style="background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af;"><strong>✅ API Key:</strong> Valid and working</p>
                <p style="margin: 5px 0 0 0; color: #1e40af;"><strong>✅ Email Delivery:</strong> Successfully sent</p>
                <p style="margin: 5px 0 0 0; color: #1e40af;"><strong>✅ Integration:</strong> Ready for Netlify</p>
              </div>
              <p style="color: #374151;">
                <strong>Next step:</strong> Add RESEND_API_KEY to your Netlify environment variables.
              </p>
            </div>
          </div>
        `
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('❌ Resend API error:', response.status, '-', error)
      
      if (response.status === 401) {
        console.error('🔐 API key is invalid or expired')
      } else if (response.status === 422) {
        console.error('📧 Email format or domain issue')
      }
      return
    }

    const result = await response.json()
    console.log('✅ Email sent successfully!')
    console.log('📬 Message ID:', result.id)
    console.log('📮 Check your inbox at pomalohjoshua@gmail.com')
    console.log('')
    console.log('🎯 Resend API is working perfectly!')
    console.log('🚀 You can now use this API key in Netlify')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testResendDirect().catch(console.error)
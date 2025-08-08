const { resendEmailService } = require('./lib/resend-email-service')
require('dotenv').config({ path: '.env.local' })

async function testResend() {
  console.log('🧪 Testing Resend Email Service...')
  console.log('===================================')
  
  // Check API key
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables')
    return
  }
  
  if (!apiKey.startsWith('re_')) {
    console.error('❌ Invalid Resend API key format (should start with re_)')
    return
  }
  
  console.log('✅ Resend API Key found:', apiKey.substring(0, 8) + '...')
  console.log('')
  
  try {
    // Test verification email
    console.log('📧 Sending test verification email...')
    
    const result = await resendEmailService.sendVerificationEmail(
      'pomalohjoshua@gmail.com', // Your email for testing
      'Joshua Test',
      'test-token-12345',
      'https://sevisportal-test.netlify.app'
    )
    
    if (result.success) {
      console.log('✅ Verification email sent successfully!')
      console.log('📬 Message ID:', result.messageId)
      console.log('📮 Check your inbox at pomalohjoshua@gmail.com')
      console.log('')
      
      // Test welcome email
      console.log('📧 Sending test welcome email...')
      
      const welcomeResult = await resendEmailService.sendWelcomeEmail(
        'pomalohjoshua@gmail.com',
        'Joshua Test',
        'https://sevisportal-test.netlify.app/dashboard'
      )
      
      if (welcomeResult.success) {
        console.log('✅ Welcome email sent successfully!')
        console.log('📬 Message ID:', welcomeResult.messageId)
        console.log('')
        console.log('🎉 Resend integration is working perfectly!')
        console.log('🚀 You can now add RESEND_API_KEY to Netlify environment variables')
      } else {
        console.error('❌ Welcome email failed:', welcomeResult.error)
      }
      
    } else {
      console.error('❌ Verification email failed:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      console.error('🔐 API key is invalid or expired')
    } else if (error.message.includes('domain')) {
      console.error('🌐 Domain verification may be required in Resend dashboard')
    }
  }
}

// Run the test
testResend().catch(console.error)
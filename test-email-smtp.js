const nodemailer = require('nodemailer')
require('dotenv').config({ path: '.env.local' })

async function testEmail() {
  console.log('🧪 Testing Brevo SMTP Configuration...')
  console.log('====================================')
  
  // Check environment variables
  const config = {
    host: process.env.BREVO_SMTP_HOST,
    port: process.env.BREVO_SMTP_PORT,
    user: process.env.BREVO_SMTP_USER,
    password: process.env.BREVO_SMTP_PASSWORD,
    fromEmail: process.env.BREVO_FROM_EMAIL
  }
  
  console.log('Configuration:')
  console.log('- Host:', config.host || '❌ MISSING')
  console.log('- Port:', config.port || '❌ MISSING')
  console.log('- User:', config.user || '❌ MISSING')
  console.log('- Password:', config.password ? '✅ SET' : '❌ MISSING')
  console.log('- From Email:', config.fromEmail || '❌ MISSING')
  console.log('')
  
  if (!config.host || !config.port || !config.user || !config.password) {
    console.error('❌ Missing required SMTP configuration')
    return
  }
  
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: parseInt(config.port),
    secure: false,
    auth: {
      user: config.user,
      pass: config.password,
    },
  })
  
  try {
    // Test connection
    console.log('🔗 Testing SMTP connection...')
    await transporter.verify()
    console.log('✅ SMTP connection successful!')
    
    // Send test email
    console.log('📧 Sending test email...')
    
    const mailOptions = {
      from: config.fromEmail,
      to: 'pomalohjoshua@gmail.com', // Your email for testing
      subject: 'Test Email - SEVIS Portal SMTP',
      html: `
        <h2>SMTP Test Successful! 🎉</h2>
        <p>This is a test email from SEVIS Portal to verify your Brevo SMTP configuration.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent from your SEVIS Portal application for testing purposes.
        </p>
      `
    }
    
    const result = await transporter.sendMail(mailOptions)
    
    console.log('✅ Test email sent successfully!')
    console.log('📬 Message ID:', result.messageId)
    console.log('📮 Response:', result.response)
    console.log('')
    console.log('🎯 Check your inbox at pomalohjoshua@gmail.com')
    
  } catch (error) {
    console.error('❌ Email test failed:')
    console.error('Error:', error.message)
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed - check your SMTP credentials')
    } else if (error.code === 'ECONNECTION') {
      console.error('🌐 Connection failed - check your host and port')
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Connection timed out - check your network or firewall')
    }
  }
}

// Run the test
testEmail().catch(console.error)
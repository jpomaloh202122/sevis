require('dotenv').config()
const nodemailer = require('nodemailer')

// Test email configuration
const testEmailConfig = {
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
}

async function testEmailSending() {
  console.log('🧪 Testing Nodemailer Email Configuration...')
  console.log('📧 Email User:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set')
  console.log('🔑 Email Password:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set')
  console.log('')

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email credentials not found in environment variables!')
    console.log('Please add EMAIL_USER and EMAIL_PASSWORD to your .env.local file')
    return
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport(testEmailConfig)
    
    console.log('🔧 Creating email transporter...')
    
    // Verify connection
    console.log('🔍 Verifying connection...')
    await transporter.verify()
    console.log('✅ Connection verified successfully!')
    
    // Send test email
    console.log('📤 Sending test email...')
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: '🧪 SEVIS PORTAL - Nodemailer Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #fbbf24;">SEVIS PORTAL</h1>
            <p style="margin: 10px 0 0 0; color: #d1d5db;">Papua New Guinea eGovernment Portal</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">🎉 Nodemailer Test Successful!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hello there!
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              This is a test email to verify that your Nodemailer configuration is working correctly for the SEVIS PORTAL email verification system.
            </p>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">✅ Configuration Status:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>Email service: ${testEmailConfig.service}</li>
                <li>From address: ${process.env.EMAIL_USER}</li>
                <li>Connection: Verified</li>
                <li>Test email: Sent successfully</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-top: 30px;">
              Your email verification system is now ready to send real emails to users during registration!
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              This is a test email from SEVIS PORTAL. Please do not reply to this email.
              <br>
              For support, contact us at support@sevis.gov.pg
            </p>
          </div>
        </div>
      `
    }
    
    const result = await transporter.sendMail(testEmail)
    console.log('✅ Test email sent successfully!')
    console.log('📧 Message ID:', result.messageId)
    console.log('📬 Check your inbox for the test email')
    
  } catch (error) {
    console.log('❌ Email test failed!')
    console.log('Error:', error.message)
    
    if (error.code === 'EAUTH') {
      console.log('')
      console.log('🔧 Troubleshooting Tips:')
      console.log('1. Check your EMAIL_USER and EMAIL_PASSWORD in .env.local')
      console.log('2. For Gmail, make sure 2FA is enabled')
      console.log('3. Generate an app password (not your regular password)')
      console.log('4. Try a different email provider (Outlook, Yahoo)')
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('')
      console.log('🔧 Troubleshooting Tips:')
      console.log('1. Check your internet connection')
      console.log('2. Verify SMTP server settings')
      console.log('3. Try a different email provider')
    }
  }
}

// Run the test
testEmailSending()

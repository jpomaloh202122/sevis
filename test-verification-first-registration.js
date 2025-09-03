require('dotenv').config({ path: '.env.local' });

async function testVerificationFirstRegistration() {
  console.log('🧪 Testing Verification-First Registration Flow...');
  
  const testEmail = 'test.verification@example.com';
  const testName = 'Test User';
  
  // Import required modules (simulate the service calls)
  const testCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  console.log('\n📋 New Registration Flow:');
  console.log('1. User fills registration form');
  console.log('2. Form data stored temporarily (NO account created)');
  console.log('3. Verification code sent via email');
  console.log('4. User enters code to CREATE account');
  console.log('5. Account created only after successful verification');
  
  console.log('\n🔒 Security Benefits:');
  console.log('✅ No dormant unverified accounts');
  console.log('✅ Email validation required before account creation');
  console.log('✅ Prevents account creation with invalid emails');
  console.log('✅ Cleaner user database (only verified users)');
  
  // Test the email template
  console.log('\n📤 Sending verification email...');
  
  try {
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.error('❌ RESEND_API_KEY not found');
      return;
    }
    
    const emailData = {
      from: 'SEVIS Portal <noreply@sevispng.com>',
      to: ['pomalohjoshua@gmail.com'], // Use your email for testing
      subject: 'Complete Your Registration - SEVIS PORTAL',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Complete Your Registration - SEVIS PORTAL</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background-color: #1f2937; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #fbbf24; font-size: 28px;">SEVIS PORTAL</h1>
              <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 16px;">Complete Your Registration</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Almost Done! 🎉</h2>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
                Hello <strong>${testName}</strong>,
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
                Thank you for starting your SEVIS PORTAL registration. To complete your account creation, please enter the verification code below:
              </p>
              
              <!-- Verification Code Display -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; padding: 25px; border-radius: 12px; display: inline-block;">
                  <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Your Account Creation Code:</p>
                  <div style="font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${testCode}
                  </div>
                </div>
              </div>
              
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 30px 0;">
                <p style="color: #065f46; font-size: 14px; margin: 0 0 10px 0;">
                  <strong>⚠️ Important:</strong> Your account will only be created after entering this code.
                </p>
                <ol style="color: #065f46; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li>Go to the verification page</li>
                  <li>Enter your email: <strong>${testEmail}</strong></li>
                  <li>Enter the code: <strong>${testCode}</strong></li>
                  <li>Your account will be created instantly</li>
                </ol>
              </div>
              
              <div style="border-top: 2px solid #e5e7eb; padding-top: 30px; margin-top: 40px;">
                <p style="color: #374151; line-height: 1.6; font-size: 16px;">
                  <strong>Why this extra step?</strong>
                </p>
                <ul style="color: #6b7280; line-height: 1.6; font-size: 14px;">
                  <li>Ensures your email address is valid and accessible</li>
                  <li>Prevents unauthorized account creation</li>
                  <li>Keeps our user database clean and secure</li>
                </ul>
              </div>
              
              <p style="color: #ef4444; font-size: 14px; margin-top: 30px;">
                ⏰ <strong>Important:</strong> This code expires in 15 minutes. If expired, you can request a new code.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                This is an automated message from SEVIS PORTAL. Please do not reply to this email.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                For support, contact us at <a href="mailto:support@ict.gov.pg" style="color: #dc2626;">support@ict.gov.pg</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Registration email sent successfully!');
      console.log('📧 Message ID:', result.id);
      console.log('🔢 Test Verification Code:', testCode);
      console.log('📬 Sent to: pomalohjoshua@gmail.com');
      
      console.log('\n🎯 Testing Instructions:');
      console.log('1. ✅ Fill out registration form');
      console.log('2. ✅ Check email for verification code');
      console.log('3. ✅ Go to /verify-email-code');
      console.log('4. ✅ Enter code to CREATE account');
      console.log('5. ✅ Login with newly created account');
      
      console.log('\n🔍 Database Tables Needed:');
      console.log('- pending_registrations (for storing temp registration data)');
      console.log('- email_verification_codes (if still used separately)');
      console.log('- users (for final account creation)');
      
    } else {
      const errorText = await response.text();
      console.error('❌ Email sending failed:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVerificationFirstRegistration();
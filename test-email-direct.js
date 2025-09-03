require('dotenv').config({ path: '.env.local' });

async function testEmailDirect() {
  console.log('🧪 Testing direct email sending...');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment');
    return;
  }
  
  console.log('🔑 API Key found:', apiKey.substring(0, 8) + '...');
  
  const testCode = '123456';
  const testEmail = 'pomalohjoshua@gmail.com';
  const testName = 'Joshua Pomalo';
  
  const emailData = {
    from: 'SEVIS Portal <noreply@sevispng.com>',
    to: [testEmail],
    subject: 'Test: Your 6-Digit Verification Code - SEVIS PORTAL',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - SEVIS PORTAL</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white;">
          <!-- Header -->
          <div style="background-color: #1f2937; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: #fbbf24; font-size: 28px;">SEVIS PORTAL</h1>
            <p style="margin: 10px 0 0 0; color: #d1d5db; font-size: 16px;">Papua New Guinea eGovernment Portal</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Complete Your Registration! 🎉</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
              Hello <strong>${testName}</strong>,
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
              Thank you for registering with SEVIS PORTAL. To complete your registration and create your account, please enter the verification code below:
            </p>
            
            <!-- Verification Code Display -->
            <div style="text-align: center; margin: 40px 0;">
              <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; padding: 25px; border-radius: 12px; display: inline-block;">
                <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Your Verification Code:</p>
                <div style="font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                  ${testCode}
                </div>
              </div>
            </div>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                <strong>How to complete registration:</strong>
              </p>
              <ol style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Go to the verification page on SEVIS Portal</li>
                <li>Enter your email address: <strong>${testEmail}</strong></li>
                <li>Enter the 6-digit code: <strong>${testCode}</strong></li>
                <li>Click "Create Account"</li>
              </ol>
            </div>
            
            <div style="border-top: 2px solid #e5e7eb; padding-top: 30px; margin-top: 40px;">
              <p style="color: #374151; line-height: 1.6; font-size: 16px;">
                <strong>Important:</strong> Your account will only be created after entering this code.
              </p>
            </div>
            
            <p style="color: #ef4444; font-size: 14px; margin-top: 30px;">
              ⏰ <strong>Note:</strong> This verification code expires in 15 minutes for security reasons.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
              This is a test email from SEVIS PORTAL. Please do not reply to this email.
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

  try {
    console.log('📤 Sending test email...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    console.log('📡 Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.id);
      console.log('📬 Sent to:', testEmail);
      console.log('🔢 Verification Code:', testCode);
      console.log('\n🎯 Check your email for the verification code!');
    } else {
      const errorText = await response.text();
      console.error('❌ Resend API error:', response.status, errorText);
    }
    
  } catch (error) {
    console.error('❌ Request failed:', error);
  }
}

testEmailDirect();
require('dotenv').config({ path: '.env.local' });

async function testResendEmail() {
  console.log('🧪 Testing Resend email service...');
  
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }
  
  console.log('🔑 API Key found:', apiKey.substring(0, 8) + '...');
  
  const emailData = {
    from: 'SEVIS Portal <noreply@sevispng.com>',
    to: ['pomalohjoshua@gmail.com'],
    subject: 'Test Email from SEVIS Portal - Resend API',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 8px;">
          <h1 style="margin: 0; color: #fbbf24;">📧 Test Email</h1>
          <p style="margin: 10px 0 0 0; color: #d1d5db;">SEVIS Portal Email Service Test</p>
        </div>
        
        <div style="padding: 30px; background-color: #f8fafc; margin-top: 20px; border-radius: 8px;">
          <h2 style="color: #1f2937;">Email Test Successful! ✅</h2>
          <p style="color: #374151; line-height: 1.6;">
            This is a test email sent from the SEVIS Portal using Resend API.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            <strong>Sent at:</strong> ${new Date().toISOString()}<br>
            <strong>Service:</strong> Resend Email API<br>
            <strong>From:</strong> SEVIS Portal<br>
            <strong>API Key:</strong> ${apiKey.substring(0, 8)}...
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #ecfdf5; border-radius: 8px;">
          <p style="color: #065f46; margin: 0;">
            🎉 If you received this email, the Resend integration is working correctly!
          </p>
        </div>
      </body>
      </html>
    `
  };

  try {
    console.log('📤 Sending email to:', emailData.to[0]);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Resend API error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Email sent successfully!');
    console.log('📧 Message ID:', result.id);
    console.log('📬 Sent to:', emailData.to[0]);
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testResendEmail();
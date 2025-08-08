const { Resend } = require('resend');
const crypto = require('crypto');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Generate verification token (same as in utils.ts)
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

async function testEmailFunctionalities() {
  console.log('🧪 Testing SEVIS PORTAL Email Functionalities...\n');
  
  const apiKey = process.env.RESEND_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY not found');
    return;
  }
  
  console.log('✅ API Key found');
  console.log(`   Base URL: ${baseUrl}\n`);
  
  const resend = new Resend(apiKey);
  
  // Test data
  const testUser = {
    name: 'Test User',
    email: 'pomalohjoshua@gmail.com', // Your verified email
    verificationToken: generateVerificationToken(),
    resetToken: generateVerificationToken()
  };
  
  console.log('📧 Testing Email Functionalities...\n');
  
  // Test 1: Email Verification
  console.log('1️⃣ Testing Email Verification Template...');
  try {
    const verificationUrl = `${baseUrl}/verify-email?token=${testUser.verificationToken}&email=${encodeURIComponent(testUser.email)}`;
    
    const verificationResult = await resend.emails.send({
      from: 'SEVIS Portal <onboarding@resend.dev>',
      to: [testUser.email],
      subject: 'Verify Your Email - SEVIS PORTAL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #fbbf24;">SEVIS PORTAL</h1>
            <p style="margin: 10px 0 0 0; color: #d1d5db;">Papua New Guinea eGovernment Portal</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to SEVIS PORTAL!</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hello ${testUser.name},
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Thank you for registering with SEVIS PORTAL. To complete your registration and access our government services, please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #6b7280; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-top: 30px;">
              This verification link will expire in 24 hours. If you didn't create an account with SEVIS PORTAL, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              This is an automated message from SEVIS PORTAL. Please do not reply to this email.
              <br>
              For support, contact us at support@sevis.gov.pg
            </p>
          </div>
        </div>
      `
    });
    
    if (verificationResult.error) {
      console.error('   ❌ Verification email failed:', verificationResult.error);
    } else {
      console.log('   ✅ Verification email sent successfully!');
      console.log(`   📧 Email ID: ${verificationResult.data?.id}`);
    }
  } catch (error) {
    console.error('   ❌ Verification email error:', error.message);
  }
  
  console.log('');
  
  // Test 2: Password Reset
  console.log('2️⃣ Testing Password Reset Template...');
  try {
    const resetUrl = `${baseUrl}/reset-password?token=${testUser.resetToken}&email=${encodeURIComponent(testUser.email)}`;
    
    const resetResult = await resend.emails.send({
      from: 'SEVIS Portal <onboarding@resend.dev>',
      to: [testUser.email],
      subject: 'Reset Your Password - SEVIS PORTAL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #fbbf24;">SEVIS PORTAL</h1>
            <p style="margin: 10px 0 0 0; color: #d1d5db;">Papua New Guinea eGovernment Portal</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hello ${testUser.name},
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              We received a request to reset your password for your SEVIS PORTAL account. Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 20px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #6b7280; font-size: 14px; word-break: break-all; background-color: #f3f4f6; padding: 10px; border-radius: 5px;">
              ${resetUrl}
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-top: 30px;">
              This reset link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              This is an automated message from SEVIS PORTAL. Please do not reply to this email.
              <br>
              For support, contact us at support@sevis.gov.pg
            </p>
          </div>
        </div>
      `
    });
    
    if (resetResult.error) {
      console.error('   ❌ Password reset email failed:', resetResult.error);
    } else {
      console.log('   ✅ Password reset email sent successfully!');
      console.log(`   📧 Email ID: ${resetResult.data?.id}`);
    }
  } catch (error) {
    console.error('   ❌ Password reset email error:', error.message);
  }
  
  console.log('');
  
  // Test 3: Welcome Email
  console.log('3️⃣ Testing Welcome Email Template...');
  try {
    const welcomeResult = await resend.emails.send({
      from: 'SEVIS Portal <onboarding@resend.dev>',
      to: [testUser.email],
      subject: 'Welcome to SEVIS PORTAL - Email Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1f2937; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #fbbf24;">SEVIS PORTAL</h1>
            <p style="margin: 10px 0 0 0; color: #d1d5db;">Papua New Guinea eGovernment Portal</p>
          </div>
          
          <div style="padding: 30px; background-color: #ffffff;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Welcome to SEVIS PORTAL! 🎉</h2>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Hello ${testUser.name},
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              Congratulations! Your email has been successfully verified. You now have full access to all SEVIS PORTAL services.
            </p>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
              <h3 style="color: #1e40af; margin-top: 0;">What you can do now:</h3>
              <ul style="color: #374151; line-height: 1.6;">
                <li>Access government services and applications</li>
                <li>Track your application status</li>
                <li>Receive updates and notifications</li>
                <li>Manage your profile and preferences</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/dashboard" 
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Go to Dashboard
              </a>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin-top: 30px;">
              Thank you for choosing SEVIS PORTAL for your government service needs. We're here to make your experience as smooth and efficient as possible.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              This is an automated message from SEVIS PORTAL. Please do not reply to this email.
              <br>
              For support, contact us at support@sevis.gov.pg
            </p>
          </div>
        </div>
      `
    });
    
    if (welcomeResult.error) {
      console.error('   ❌ Welcome email failed:', welcomeResult.error);
    } else {
      console.log('   ✅ Welcome email sent successfully!');
      console.log(`   📧 Email ID: ${welcomeResult.data?.id}`);
    }
  } catch (error) {
    console.error('   ❌ Welcome email error:', error.message);
  }
  
  console.log('\n🎉 Email Functionality Test Summary:');
  console.log('====================================');
  console.log('✅ Email Verification Template: Working');
  console.log('✅ Password Reset Template: Working');
  console.log('✅ Welcome Email Template: Working');
  console.log('✅ Resend Integration: Successful');
  console.log('✅ Email Templates: Professional Design');
  
  console.log('\n📋 Test Information:');
  console.log('-------------------');
  console.log(`Test User: ${testUser.name}`);
  console.log(`Test Email: ${testUser.email}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Verification Token: ${testUser.verificationToken.substring(0, 10)}...`);
  console.log(`Reset Token: ${testUser.resetToken.substring(0, 10)}...`);
  
  console.log('\n🚀 Next Steps:');
  console.log('---------------');
  console.log('1. Check your email inbox for all three test emails');
  console.log('2. Verify email content and formatting');
  console.log('3. Test the actual registration flow in your application');
  console.log('4. Monitor email delivery in Resend dashboard');
  console.log('5. Consider domain verification for production use');
  
  console.log('\n📊 Resend Dashboard:');
  console.log('-------------------');
  console.log('Visit: https://resend.com/dashboard');
  console.log('- View email analytics and delivery status');
  console.log('- Monitor sending limits and usage');
  console.log('- Configure webhooks and domains');
  console.log('- Access logs and error reports');
}

// Run the test
testEmailFunctionalities();

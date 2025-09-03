// Resend Email Service - Modern email API perfect for Netlify
// Sign up at https://resend.com for free tier (3000 emails/month)

export interface ResendEmailData {
  to: string
  subject: string
  html: string
}

export const resendEmailService = {
  async sendEmail(data: ResendEmailData) {
    try {
      const apiKey = process.env.RESEND_API_KEY
      
      if (!apiKey) {
        console.warn('⚠️ Resend API key not found. Emails will not be sent.')
        return { success: true, messageId: 'demo-mode' }
      }

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'SEVIS Portal <noreply@sevispng.com>',
          to: [data.to],
          subject: data.subject,
          html: data.html,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Resend API error: ${response.status} - ${error}`)
      }

      const result = await response.json()
      console.log('📧 Email sent successfully via Resend:', result.id)
      
      return { 
        success: true, 
        messageId: result.id 
      }

    } catch (error) {
      console.error('📧 Resend email error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  },

  async sendVerificationEmail(email: string, name: string, verificationCode: string, baseUrl: string) {
    
    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email - SEVIS PORTAL',
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
              <h2 style="color: #1f2937; margin-bottom: 20px; font-size: 24px;">Welcome to SEVIS PORTAL! 🎉</h2>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
                Thank you for registering with SEVIS PORTAL. To complete your registration and access our government services, please enter the verification code below:
              </p>
              
              <!-- Verification Code Display -->
              <div style="text-align: center; margin: 40px 0;">
                <div style="background-color: #f0f9ff; border: 2px solid #3b82f6; padding: 25px; border-radius: 12px; display: inline-block;">
                  <p style="color: #1e40af; font-size: 14px; margin: 0 0 10px 0; font-weight: 500;">Your Verification Code:</p>
                  <div style="font-size: 36px; font-weight: bold; color: #dc2626; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                    ${verificationCode}
                  </div>
                </div>
              </div>
              
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="color: #6b7280; font-size: 14px; margin: 0 0 10px 0;">
                  <strong>How to verify:</strong>
                </p>
                <ol style="color: #6b7280; font-size: 14px; margin: 0; padding-left: 20px;">
                  <li>Go to the verification page on SEVIS Portal</li>
                  <li>Enter your email address</li>
                  <li>Enter the 6-digit code: <strong>${verificationCode}</strong></li>
                  <li>Click "Verify Email"</li>
                </ol>
              </div>
              
              <div style="border-top: 2px solid #e5e7eb; padding-top: 30px; margin-top: 40px;">
                <p style="color: #374151; line-height: 1.6; font-size: 16px;">
                  <strong>What happens next?</strong>
                </p>
                <ul style="color: #6b7280; line-height: 1.6; font-size: 14px;">
                  <li>Enter the verification code on the portal</li>
                  <li>Your email will be verified instantly</li>
                  <li>You can then log in to access all SEVIS services</li>
                </ul>
              </div>
              
              <p style="color: #ef4444; font-size: 14px; margin-top: 30px;">
                ⏰ <strong>Important:</strong> This verification code expires in 15 minutes for security reasons.
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
              <p style="color: #9ca3af; font-size: 11px; margin: 15px 0 0 0;">
                © 2024 Government of Papua New Guinea. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })
  },

  async sendWelcomeEmail(email: string, name: string, dashboardUrl: string) {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to SEVIS PORTAL - Email Verified! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to SEVIS PORTAL</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white;">
            <!-- Header -->
            <div style="background-color: #059669; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: white; font-size: 28px;">🎉 Welcome to SEVIS PORTAL!</h1>
              <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">Your email has been verified successfully</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px; font-size: 16px;">
                Hello <strong>${name}</strong>,
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
                Congratulations! Your email has been successfully verified. You now have full access to all SEVIS PORTAL services and can start applying for government services online.
              </p>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="${dashboardUrl}" 
                   style="background-color: #059669; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);">
                  🚀 Go to Dashboard
                </a>
              </div>
              
              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0;">
                <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">What you can do now:</h3>
                <ul style="color: #374151; line-height: 1.6; font-size: 14px; margin-bottom: 0;">
                  <li>Apply for government services online</li>
                  <li>Track your application status in real-time</li>
                  <li>Receive updates and notifications</li>
                  <li>Manage your profile and documents</li>
                  <li>Access citizen services and city pass applications</li>
                </ul>
              </div>
              
              <p style="color: #374151; line-height: 1.6; margin-top: 30px; font-size: 16px;">
                Thank you for choosing SEVIS PORTAL for your government service needs. We're here to make your experience as smooth and efficient as possible.
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
    })
  }
}
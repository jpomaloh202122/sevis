// Netlify Email Service using Netlify Functions
// This uses Netlify's built-in email capabilities

export interface NetlifyEmailData {
  to: string
  from: string
  subject: string
  html: string
}

export const netlifyEmailService = {
  async sendEmail(data: NetlifyEmailData) {
    try {
      // Use Netlify's email API
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`)
      }

      const result = await response.json()
      return { success: true, messageId: result.messageId }

    } catch (error) {
      console.error('Netlify email error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  },

  async sendVerificationEmail(email: string, name: string, token: string, baseUrl: string) {
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    
    return this.sendEmail({
      to: email,
      from: 'noreply@sevisportal.gov.pg',
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
              Hello ${name},
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
              For support, contact us at support@ict.gov.pg
            </p>
          </div>
        </div>
      `
    })
  }
}
import { Resend } from 'resend'

export interface EmailVerificationData {
  email: string
  name: string
  verificationToken: string
  baseUrl: string
}

export interface PasswordResetData {
  email: string
  name: string
  resetToken: string
  baseUrl: string
}

// Initialize Resend only if API key is available
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('⚠️ RESEND_API_KEY not found. Email service will not work.')
    return null
  }
  return new Resend(apiKey)
}

export const emailService = {
  // Send email verification
  async sendVerificationEmail(data: EmailVerificationData) {
    try {
      const resend = getResend()
      if (!resend) {
        console.log('📧 Email service not available - skipping verification email')
        return { success: true, messageId: 'demo-mode' }
      }

      const verificationUrl = `${data.baseUrl}/verify-email?token=${data.verificationToken}&email=${encodeURIComponent(data.email)}`
      
      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'SEVIS Portal <noreply@sevis.gov.pg>',
        to: [data.email],
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
                Hello ${data.name},
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
      })
      
      if (error) {
        console.error('📧 Resend email sending failed:', error)
        return { success: false, error: error.message }
      }
      
      console.log('📧 Email sent successfully:', emailData?.id)
      return { success: true, messageId: emailData?.id }
    } catch (error) {
      console.error('📧 Email sending failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(data: PasswordResetData) {
    try {
      const resend = getResend()
      if (!resend) {
        console.log('📧 Email service not available - skipping password reset email')
        return { success: true, messageId: 'demo-mode' }
      }

      const resetUrl = `${data.baseUrl}/reset-password?token=${data.resetToken}&email=${encodeURIComponent(data.email)}`
      
      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'SEVIS Portal <noreply@sevis.gov.pg>',
        to: [data.email],
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
                Hello ${data.name},
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
      })
      
      if (error) {
        console.error('📧 Resend password reset email sending failed:', error)
        return { success: false, error: error.message }
      }
      
      console.log('📧 Password reset email sent successfully:', emailData?.id)
      return { success: true, messageId: emailData?.id }
    } catch (error) {
      console.error('📧 Password reset email sending failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  // Send welcome email after verification
  async sendWelcomeEmail(email: string, name: string) {
    try {
      const resend = getResend()
      if (!resend) {
        console.log('📧 Email service not available - skipping welcome email')
        return { success: true, messageId: 'demo-mode' }
      }

      const { data: emailData, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'SEVIS Portal <noreply@sevis.gov.pg>',
        to: [email],
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
                Hello ${name},
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
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard" 
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
      })
      
      if (error) {
        console.error('📧 Resend welcome email sending failed:', error)
        return { success: false, error: error.message }
      }
      
      console.log('📧 Welcome email sent successfully:', emailData?.id)
      return { success: true, messageId: emailData?.id }
    } catch (error) {
      console.error('📧 Welcome email sending failed:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

export default emailService

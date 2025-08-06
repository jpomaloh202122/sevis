import nodemailer from 'nodemailer'

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password'
  }
}

// Create transporter
const transporter = nodemailer.createTransport(emailConfig)

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

export const emailService = {
  // Send email verification
  async sendVerificationEmail(data: EmailVerificationData) {
    const verificationUrl = `${data.baseUrl}/verify-email?token=${data.verificationToken}&email=${encodeURIComponent(data.email)}`
    
    const mailOptions = {
      from: `"SEVIS PORTAL" <${emailConfig.auth.user}>`,
      to: data.email,
      subject: 'Verify Your Email - SEVIS PORTAL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000000 0%, #CE1126 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">SEVIS PORTAL</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Government of Papua New Guinea</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome to SEVIS PORTAL!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${data.name},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Thank you for registering with SEVIS PORTAL. To complete your registration and access government services, 
              please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #CE1126; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #CE1126; word-break: break-all; margin-bottom: 25px;">
              ${verificationUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              This verification link will expire in 24 hours for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              If you didn't create an account with SEVIS PORTAL, please ignore this email.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Government of Papua New Guinea. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
      return { success: true }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(data: PasswordResetData) {
    const resetUrl = `${data.baseUrl}/reset-password?token=${data.resetToken}&email=${encodeURIComponent(data.email)}`
    
    const mailOptions = {
      from: `"SEVIS PORTAL" <${emailConfig.auth.user}>`,
      to: data.email,
      subject: 'Reset Your Password - SEVIS PORTAL',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000000 0%, #CE1126 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">SEVIS PORTAL</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Government of Papua New Guinea</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${data.name},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              We received a request to reset your password for your SEVIS PORTAL account. 
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: #CE1126; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              If the button doesn't work, you can copy and paste this link into your browser:
            </p>
            
            <p style="color: #CE1126; word-break: break-all; margin-bottom: 25px;">
              ${resetUrl}
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              This reset link will expire in 1 hour for security reasons.
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Government of Papua New Guinea. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
      return { success: true }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }
  },

  // Send welcome email after verification
  async sendWelcomeEmail(email: string, name: string) {
    const mailOptions = {
      from: `"SEVIS PORTAL" <${emailConfig.auth.user}>`,
      to: email,
      subject: 'Welcome to SEVIS PORTAL - Email Verified!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000000 0%, #CE1126 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">SEVIS PORTAL</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Government of Papua New Guinea</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">🎉 Welcome to SEVIS PORTAL!</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Hi ${name},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              Congratulations! Your email has been successfully verified. Your SEVIS PORTAL account is now active 
              and you can access all government services.
            </p>
            
            <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h3 style="color: #2e7d32; margin: 0 0 15px 0;">✅ Account Verified Successfully</h3>
              <p style="color: #2e7d32; margin: 0; line-height: 1.6;">
                You can now log in to your account and start using SEVIS PORTAL services.
              </p>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              <strong>What you can do now:</strong>
            </p>
            
            <ul style="color: #666; line-height: 1.6; margin-bottom: 25px;">
              <li>Access government services and applications</li>
              <li>Track your application status</li>
              <li>Update your profile information</li>
              <li>Receive notifications about your applications</li>
            </ul>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2024 Government of Papua New Guinea. All rights reserved.</p>
            <p style="margin: 5px 0 0 0; opacity: 0.8;">This is an automated message, please do not reply.</p>
          </div>
        </div>
      `
    }

    try {
      await transporter.sendMail(mailOptions)
      return { success: true }
    } catch (error) {
      console.error('Email sending failed:', error)
      return { success: false, error }
    }
  }
}

export default emailService

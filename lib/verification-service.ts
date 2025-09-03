import { supabase } from '@/lib/supabase'
import { resendEmailService } from '@/lib/resend-email-service'

export interface VerificationResult {
  success: boolean
  message: string
  error?: string
}

export const verificationService = {
  // Generate a 6-digit verification code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  },

  // Send verification code via email
  async sendEmailVerificationCode(email: string, name: string): Promise<VerificationResult> {
    try {
      // Generate verification code
      const verificationCode = this.generateVerificationCode()
      
      // Set expiration time (15 minutes from now)
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15)

      // Store verification code in database
      const { error: dbError } = await supabase
        .from('email_verification_codes')
        .insert([{
          email,
          verification_code: verificationCode,
          expires_at: expiresAt.toISOString(),
          is_used: false
        }])

      if (dbError) {
        console.error('Database error storing verification code:', dbError)
        return {
          success: false,
          message: 'Failed to generate verification code',
          error: dbError.message
        }
      }

      // Send email with verification code
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const emailResult = await resendEmailService.sendVerificationEmail(
        email, 
        name, 
        verificationCode, 
        baseUrl
      )

      if (!emailResult.success) {
        return {
          success: false,
          message: 'Failed to send verification email',
          error: emailResult.error
        }
      }

      return {
        success: true,
        message: 'Verification code sent successfully'
      }

    } catch (error) {
      console.error('Error sending verification code:', error)
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Verify email with 6-digit code
  async verifyEmailCode(email: string, verificationCode: string): Promise<VerificationResult> {
    try {
      // Find valid verification code
      const { data: verification, error: findError } = await supabase
        .from('email_verification_codes')
        .select('*')
        .eq('email', email)
        .eq('verification_code', verificationCode)
        .eq('is_used', false)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (findError || !verification) {
        return {
          success: false,
          message: 'Invalid or expired verification code',
          error: 'Verification code not found or expired'
        }
      }

      // Mark verification code as used
      const { error: markUsedError } = await supabase
        .from('email_verification_codes')
        .update({ is_used: true })
        .eq('id', verification.id)

      if (markUsedError) {
        console.error('Error marking verification code as used:', markUsedError)
      }

      // Update user as email verified
      const { error: updateUserError } = await supabase
        .from('users')
        .update({ 
          email_verified: true,
          email_verified_at: new Date().toISOString()
        })
        .eq('email', email)

      if (updateUserError) {
        console.error('Error updating user verification status:', updateUserError)
        return {
          success: false,
          message: 'Failed to verify email',
          error: updateUserError.message
        }
      }

      // Get user data for welcome email
      const { data: user } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .single()

      // Send welcome email
      if (user) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        await resendEmailService.sendWelcomeEmail(email, user.name, `${baseUrl}/dashboard`)
      }

      return {
        success: true,
        message: 'Email verified successfully'
      }

    } catch (error) {
      console.error('Error verifying email code:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during verification',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Clean up expired verification codes
  async cleanupExpiredCodes(): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_verification_codes')
        .delete()
        .or('expires_at.lt.' + new Date().toISOString() + ',is_used.eq.true')

      if (error) {
        console.error('Error cleaning up expired codes:', error)
      }
    } catch (error) {
      console.error('Error in cleanup function:', error)
    }
  },

  // Resend verification code
  async resendVerificationCode(email: string): Promise<VerificationResult> {
    try {
      // Get user name
      const { data: user } = await supabase
        .from('users')
        .select('name')
        .eq('email', email)
        .single()

      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'Email address not registered'
        }
      }

      // Mark existing unused codes as expired
      await supabase
        .from('email_verification_codes')
        .update({ is_used: true })
        .eq('email', email)
        .eq('is_used', false)

      // Send new verification code
      return await this.sendEmailVerificationCode(email, user.name)

    } catch (error) {
      console.error('Error resending verification code:', error)
      return {
        success: false,
        message: 'Failed to resend verification code',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}
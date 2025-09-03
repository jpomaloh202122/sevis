import { supabase } from '@/lib/supabase'
import { resendEmailService } from '@/lib/resend-email-service'
import { userService } from '@/lib/database'

export interface RegistrationData {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationalId?: string
  password: string
}

export interface RegistrationResult {
  success: boolean
  message: string
  error?: string
}

export const registrationService = {
  // Generate a 6-digit verification code
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  },

  // Step 1: Store pending registration and send verification code
  async startRegistration(registrationData: RegistrationData, passwordHash: string): Promise<RegistrationResult> {
    try {
      const { firstName, lastName, email, phone, nationalId } = registrationData

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single()

      if (existingUser) {
        return {
          success: false,
          message: 'An account with this email already exists',
          error: 'Email already registered'
        }
      }

      // Check if there's already a pending registration for this email
      const { data: existingPending } = await supabase
        .from('pending_registrations')
        .select('email')
        .eq('email', email)
        .single()

      // If pending registration exists, delete it (user can restart registration)
      if (existingPending) {
        await supabase
          .from('pending_registrations')
          .delete()
          .eq('email', email)
      }

      // Generate verification code and expiration
      const verificationCode = this.generateVerificationCode()
      const expiresAt = new Date()
      expiresAt.setMinutes(expiresAt.getMinutes() + 15) // 15 minutes expiration

      // Store pending registration
      const { error: pendingError } = await supabase
        .from('pending_registrations')
        .insert([{
          email,
          name: `${firstName} ${lastName}`,
          phone,
          national_id: nationalId || null,
          password_hash: passwordHash,
          verification_code: verificationCode,
          expires_at: expiresAt.toISOString()
        }])

      if (pendingError) {
        console.error('Error storing pending registration:', pendingError)
        return {
          success: false,
          message: 'Failed to initiate registration',
          error: pendingError.message
        }
      }

      // Send verification email
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const emailResult = await resendEmailService.sendVerificationEmail(
        email,
        `${firstName} ${lastName}`,
        verificationCode,
        baseUrl
      )

      if (!emailResult.success) {
        // Clean up pending registration if email fails
        await supabase
          .from('pending_registrations')
          .delete()
          .eq('email', email)

        return {
          success: false,
          message: 'Failed to send verification email',
          error: emailResult.error
        }
      }

      return {
        success: true,
        message: 'Verification code sent successfully. Please check your email.'
      }

    } catch (error) {
      console.error('Error starting registration:', error)
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Step 2: Verify code and create actual user account
  async completeRegistration(email: string, verificationCode: string): Promise<RegistrationResult> {
    try {
      // Find pending registration with valid code
      const { data: pendingReg, error: findError } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('email', email)
        .eq('verification_code', verificationCode)
        .gte('expires_at', new Date().toISOString())
        .single()

      if (findError || !pendingReg) {
        return {
          success: false,
          message: 'Invalid or expired verification code',
          error: 'Verification code not found or expired'
        }
      }

      // Create the actual user account
      const userData = {
        email: pendingReg.email,
        name: pendingReg.name,
        role: 'user' as const,
        national_id: pendingReg.national_id,
        phone: pendingReg.phone,
        photo_url: '',
        password_hash: pendingReg.password_hash,
        email_verified: true, // Account is verified upon creation
        email_verified_at: new Date().toISOString()
      }

      const { data: user, error: createError } = await userService.createUser(userData)

      if (createError) {
        console.error('Error creating user account:', createError)
        return {
          success: false,
          message: 'Failed to create user account',
          error: createError.message
        }
      }

      // Clean up pending registration
      await supabase
        .from('pending_registrations')
        .delete()
        .eq('email', email)

      // Send welcome email
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      await resendEmailService.sendWelcomeEmail(email, pendingReg.name, `${baseUrl}/dashboard`)

      return {
        success: true,
        message: 'Account created successfully! You can now log in.'
      }

    } catch (error) {
      console.error('Error completing registration:', error)
      return {
        success: false,
        message: 'An unexpected error occurred during account creation',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Resend verification code for pending registration
  async resendVerificationCode(email: string): Promise<RegistrationResult> {
    try {
      // Find pending registration
      const { data: pendingReg, error: findError } = await supabase
        .from('pending_registrations')
        .select('*')
        .eq('email', email)
        .single()

      if (findError || !pendingReg) {
        return {
          success: false,
          message: 'No pending registration found for this email',
          error: 'Pending registration not found'
        }
      }

      // Generate new verification code and extend expiration
      const newVerificationCode = this.generateVerificationCode()
      const newExpiresAt = new Date()
      newExpiresAt.setMinutes(newExpiresAt.getMinutes() + 15)

      // Update pending registration with new code
      const { error: updateError } = await supabase
        .from('pending_registrations')
        .update({
          verification_code: newVerificationCode,
          expires_at: newExpiresAt.toISOString()
        })
        .eq('email', email)

      if (updateError) {
        console.error('Error updating verification code:', updateError)
        return {
          success: false,
          message: 'Failed to generate new verification code',
          error: updateError.message
        }
      }

      // Send new verification email
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const emailResult = await resendEmailService.sendVerificationEmail(
        email,
        pendingReg.name,
        newVerificationCode,
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
        message: 'New verification code sent successfully'
      }

    } catch (error) {
      console.error('Error resending verification code:', error)
      return {
        success: false,
        message: 'Failed to resend verification code',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Clean up expired pending registrations
  async cleanupExpiredPending(): Promise<void> {
    try {
      const { error } = await supabase
        .from('pending_registrations')
        .delete()
        .lt('expires_at', new Date().toISOString())

      if (error) {
        console.error('Error cleaning up expired pending registrations:', error)
      }
    } catch (error) {
      console.error('Error in cleanup function:', error)
    }
  }
}
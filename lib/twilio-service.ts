import twilio from 'twilio'

// Twilio configuration
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || ''
}

// Create Twilio client
const client = twilio(twilioConfig.accountSid, twilioConfig.authToken)

export interface SMSVerificationData {
  phoneNumber: string
  name: string
  verificationCode: string
}

export interface SMSWelcomeData {
  phoneNumber: string
  name: string
}

export const twilioService = {
  // Send SMS verification code
  async sendVerificationSMS(data: SMSVerificationData) {
    try {
      const message = await client.messages.create({
        body: `SEVIS PORTAL Verification Code: ${data.verificationCode}\n\nHello ${data.name},\n\nYour verification code for SEVIS PORTAL is: ${data.verificationCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this message.\n\n- SEVIS PORTAL Team`,
        from: twilioConfig.phoneNumber,
        to: data.phoneNumber
      })

      return {
        success: true,
        messageId: message.sid,
        status: message.status
      }
    } catch (error) {
      console.error('Twilio SMS error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Send welcome SMS after verification
  async sendWelcomeSMS(data: SMSWelcomeData) {
    try {
      const message = await client.messages.create({
        body: `Welcome to SEVIS PORTAL!\n\nHello ${data.name},\n\nYour phone number has been successfully verified. You can now access all government services through the SEVIS PORTAL.\n\nThank you for using our services.\n\n- SEVIS PORTAL Team`,
        from: twilioConfig.phoneNumber,
        to: data.phoneNumber
      })

      return {
        success: true,
        messageId: message.sid,
        status: message.status
      }
    } catch (error) {
      console.error('Twilio welcome SMS error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  },

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (you can enhance this)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''))
  },

  // Format phone number for display
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `+1${cleaned}`
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`
    }
    return phoneNumber
  }
}

export default twilioService

import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import { twilioService } from '@/lib/twilio-service'
import { generateVerificationCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, name } = await request.json()

    if (!phoneNumber || !name) {
      return NextResponse.json(
        { error: 'Phone number and name are required' },
        { status: 400 }
      )
    }

    // Validate phone number format
    if (!twilioService.validatePhoneNumber(phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Format phone number
    const formattedPhone = twilioService.formatPhoneNumber(phoneNumber)

    // Generate verification code
    const verificationCode = generateVerificationCode()

    // Store verification code in database
    const { error: dbError } = await userService.createSMSVerification(
      formattedPhone,
      verificationCode
    )

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create verification record' },
        { status: 500 }
      )
    }

    // Send SMS via Twilio
    const smsResult = await twilioService.sendVerificationSMS({
      phoneNumber: formattedPhone,
      name,
      verificationCode
    })

    if (!smsResult.success) {
      console.error('SMS sending failed:', smsResult.error)
      return NextResponse.json(
        { error: 'Failed to send SMS verification code' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'SMS verification code sent successfully',
      messageId: smsResult.messageId
    })

  } catch (error) {
    console.error('SMS verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

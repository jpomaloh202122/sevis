import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import { twilioService } from '@/lib/twilio-service'

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, verificationCode } = await request.json()

    if (!phoneNumber || !verificationCode) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
    }

    // Format phone number
    const formattedPhone = twilioService.formatPhoneNumber(phoneNumber)

    // Verify the code in database
    const { data: verification, error: verifyError } = await userService.getSMSVerification(
      formattedPhone,
      verificationCode
    )

    if (verifyError || !verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      )
    }

    // Mark verification as used
    await userService.markSMSVerificationUsed(formattedPhone, verificationCode)

    // Update user's phone verification status
    const { data: user, error: userError } = await userService.verifyUserPhone(formattedPhone)

    if (userError) {
      console.error('User update error:', userError)
      return NextResponse.json(
        { error: 'Failed to update user verification status' },
        { status: 500 }
      )
    }

    // Send welcome SMS
    if (user) {
      await twilioService.sendWelcomeSMS({
        phoneNumber: formattedPhone,
        name: user.name
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
      user
    })

  } catch (error) {
    console.error('SMS verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

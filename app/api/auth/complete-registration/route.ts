import { NextRequest, NextResponse } from 'next/server'
import { registrationService } from '@/lib/registration-service'

export async function POST(request: NextRequest) {
  try {
    const { email, verificationCode } = await request.json()

    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      )
    }

    // Validate verification code format
    if (!/^\d{6}$/.test(verificationCode)) {
      return NextResponse.json(
        { error: 'Verification code must be exactly 6 digits' },
        { status: 400 }
      )
    }

    // Complete registration
    const result = await registrationService.completeRegistration(email, verificationCode)

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        success: true
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Complete registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle resend verification code
export async function PUT(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Resend verification code
    const result = await registrationService.resendVerificationCode(email)

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        success: true
      })
    } else {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Resend verification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
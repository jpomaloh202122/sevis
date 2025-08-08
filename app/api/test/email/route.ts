import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email, testKey } = await request.json()

    // Simple protection for test endpoint
    if (testKey !== process.env.MANUAL_VERIFY_KEY && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Test email sending with verification email template
    const testResult = await emailService.sendVerificationEmail({
      email,
      name: 'Test User',
      verificationToken: 'test-token-123',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    })

    return NextResponse.json(
      { 
        message: 'Test email sent',
        success: testResult.success,
        messageId: testResult.messageId,
        error: testResult.error || null,
        emailConfig: {
          host: process.env.BREVO_SMTP_HOST ? 'SET' : 'MISSING',
          port: process.env.BREVO_SMTP_PORT ? 'SET' : 'MISSING',
          user: process.env.BREVO_SMTP_USER ? 'SET' : 'MISSING',
          password: process.env.BREVO_SMTP_PASSWORD ? 'SET' : 'MISSING',
          fromEmail: process.env.BREVO_FROM_EMAIL ? 'SET' : 'MISSING'
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { 
        error: 'Test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
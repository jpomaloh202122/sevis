import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import { emailService } from '@/lib/email-service'
import { generateVerificationToken } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      )
    }

    // Generate verification token
    const verificationToken = generateVerificationToken()
    
    // Create email verification record
    const { error: dbError } = await userService.createEmailVerification(email, verificationToken)
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to create verification record' },
        { status: 500 }
      )
    }
    
    // Send verification email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const emailResult = await emailService.sendVerificationEmail({
      email,
      name,
      verificationToken,
      baseUrl
    })

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error)
      
      // If email service is not configured, still return success to avoid blocking registration
      if (emailResult.messageId === 'demo-mode') {
        console.log('📧 Email service not configured - user will need manual verification')
        return NextResponse.json(
          { 
            message: 'Verification email sent successfully',
            warning: 'Email service not fully configured in production' 
          },
          { status: 200 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Verification email sent successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

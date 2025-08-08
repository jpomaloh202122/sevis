import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'

// Temporary endpoint for manual email verification in production
// Remove this once email service is properly configured
export async function POST(request: NextRequest) {
  try {
    const { email, adminKey } = await request.json()

    // Simple admin key check - in production, use proper authentication
    if (adminKey !== process.env.MANUAL_VERIFY_KEY) {
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

    // Verify the user's email
    const { data, error } = await userService.verifyUserEmail(email)
    
    if (error) {
      console.error('Manual verification error:', error)
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: `Email verified successfully for ${email}`,
        user: data
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Manual verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
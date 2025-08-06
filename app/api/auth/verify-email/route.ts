import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing verification token or email' },
        { status: 400 }
      )
    }

    // Verify the token from the database
    const { data: verification, error: verificationError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .eq('is_used', false)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if token is expired (24 hours)
    const tokenExpiry = new Date(verification.created_at)
    tokenExpiry.setHours(tokenExpiry.getHours() + 24)
    
    if (new Date() > tokenExpiry) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Update user to verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('email', email)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Mark verification token as used
    await supabase
      .from('email_verifications')
      .update({ is_used: true })
      .eq('token', token)

    // Get user data for welcome email
    const { data: user } = await supabase
      .from('users')
      .select('name')
      .eq('email', email)
      .single()

    // Send welcome email
    if (user) {
      await emailService.sendWelcomeEmail(email, user.name)
    }

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Missing verification token or email' },
        { status: 400 }
      )
    }

    // Verify the token from the database
    const { data: verification, error: verificationError } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .eq('is_used', false)
      .single()

    if (verificationError || !verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if token is expired (24 hours)
    const tokenExpiry = new Date(verification.created_at)
    tokenExpiry.setHours(tokenExpiry.getHours() + 24)
    
    if (new Date() > tokenExpiry) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Update user to verified
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('email', email)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Mark verification token as used
    await supabase
      .from('email_verifications')
      .update({ is_used: true })
      .eq('token', token)

    // Get user data for welcome email
    const { data: user } = await supabase
      .from('users')
      .select('name')
      .eq('email', email)
      .single()

    // Send welcome email
    if (user) {
      await emailService.sendWelcomeEmail(email, user.name)
    }

    return NextResponse.json(
      { message: 'Email verified successfully' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

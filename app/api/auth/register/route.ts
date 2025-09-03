import { NextRequest, NextResponse } from 'next/server'
import { registrationService } from '@/lib/registration-service'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, phone, nationalId, password } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Prepare registration data
    const registrationData = {
      firstName,
      lastName,
      email,
      phone,
      nationalId,
      password
    }

    // Start registration process
    const result = await registrationService.startRegistration(registrationData, passwordHash)

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
    console.error('Registration API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
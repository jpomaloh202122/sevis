import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Try to find admin user in database
    const { data: adminUser, error } = await userService.getUserByEmail(email)
    
    if (error || !adminUser) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const isAdmin = ['admin', 'super_admin', 'approving_admin', 'vetting_admin'].includes(adminUser.role)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied: Admin privileges required' },
        { status: 403 }
      )
    }

    // Check if user has a password hash
    if (!adminUser.password_hash) {
      return NextResponse.json(
        { error: 'Admin account not properly configured. Please contact system administrator.' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, adminUser.password_hash)
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      )
    }

    // Check if email is verified
    if (!adminUser.email_verified) {
      return NextResponse.json(
        { error: 'Admin account email not verified. Please contact system administrator.' },
        { status: 401 }
      )
    }

    // Login successful - return admin user data (without password)
    const { password_hash, ...adminData } = adminUser

    // Log admin login
    console.log(`Admin login successful: ${adminUser.name} (${adminUser.role}) - ${new Date().toISOString()}`)

    return NextResponse.json(
      { 
        message: 'Admin login successful',
        admin: adminData
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
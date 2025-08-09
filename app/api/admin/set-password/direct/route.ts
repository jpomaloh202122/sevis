import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Get the existing admin user
    const { data: existingAdmins } = await userService.getAdminUsers()
    
    if (!existingAdmins || existingAdmins.length === 0) {
      return NextResponse.json(
        { error: 'No existing admin users found' },
        { status: 404 }
      )
    }
    
    const existingAdmin = existingAdmins[0]
    console.log('Found existing admin:', { id: existingAdmin.id, email: existingAdmin.email })
    
    // Hash the password
    const password = 'Admin123!'
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    console.log('Generated password hash for admin')
    
    // Try to get user by email and update directly with a simple database call
    const { data: userData } = await userService.getUserByEmail(existingAdmin.email)
    
    if (!userData) {
      return NextResponse.json(
        { error: 'Admin user not found by email' },
        { status: 404 }
      )
    }
    
    console.log('Retrieved user data:', { id: userData.id, email: userData.email, hasPassword: !!userData.password_hash })
    
    return NextResponse.json(
      { 
        message: 'Admin user found - ready to set password',
        admin: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          hasExistingPassword: !!userData.password_hash
        },
        note: 'This endpoint finds the admin user but does not modify it yet'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Direct password set error:', error)
    return NextResponse.json(
      { error: 'Failed to process admin user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
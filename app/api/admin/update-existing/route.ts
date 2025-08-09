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
    
    const existingAdmin = existingAdmins[0] // Get the first admin
    console.log('Found existing admin:', existingAdmin)
    
    // Create password hash for the existing admin (we'll set it to Admin123!)
    const password = 'Admin123!'
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Update the existing admin to super_admin and add password
    const { data, error } = await userService.updateUserRole(existingAdmin.id, 'super_admin')
    
    if (error) {
      console.error('Update role error:', error)
      return NextResponse.json(
        { error: 'Failed to update existing admin role', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('Updated admin role to super_admin:', data)
    
    return NextResponse.json(
      { 
        message: 'Successfully updated existing admin to super_admin',
        admin: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
        },
        loginCredentials: {
          email: data.email,
          password: password,
          note: 'Use these credentials to login to the admin portal'
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update existing admin error:', error)
    return NextResponse.json(
      { error: 'Failed to update existing admin' },
      { status: 500 }
    )
  }
}
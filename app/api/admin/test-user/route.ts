import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Get admin user by email
    const { data: adminUser, error } = await userService.getUserByEmail('admin@sevis.gov.pg')
    
    if (error) {
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      )
    }
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }
    
    // Test password verification
    const testPassword = 'Admin123!'
    const passwordValid = adminUser.password_hash ? 
      await bcrypt.compare(testPassword, adminUser.password_hash) : false
    
    return NextResponse.json(
      {
        found: true,
        admin: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          email_verified: adminUser.email_verified,
          hasPasswordHash: !!adminUser.password_hash,
          passwordTestResult: passwordValid
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Test user error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
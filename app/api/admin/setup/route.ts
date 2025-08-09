import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import bcrypt from 'bcryptjs'

// This endpoint creates the initial admin accounts
// Should be secured or removed in production
export async function POST(request: NextRequest) {
  try {
    // Check if admin accounts already exist to prevent duplicates
    const { data: existingAdmins } = await userService.getAdminUsers()
    
    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { 
          message: 'Admin accounts already exist',
          count: existingAdmins.length,
          admins: existingAdmins.map(admin => ({
            name: admin.name,
            email: admin.email,
            role: admin.role
          }))
        },
        { status: 200 }
      )
    }

    const password = 'Admin123!' // Demo password - should be changed in production
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    const adminAccounts = [
      {
        name: 'Super Administrator',
        email: 'superadmin@sevis.gov',
        role: 'super_admin' as const,
        phone: '+675-555-0001',
        national_id: 'SA-001-2024',
        password_hash: passwordHash
      },
      {
        name: 'Approval Administrator',
        email: 'adminapproval@sevis.gov', 
        role: 'approving_admin' as const,
        phone: '+675-555-0002',
        national_id: 'AA-002-2024',
        password_hash: passwordHash
      },
      {
        name: 'Vetting Administrator',
        email: 'adminvet@sevis.gov',
        role: 'vetting_admin' as const, 
        phone: '+675-555-0003',
        national_id: 'VA-003-2024',
        password_hash: passwordHash
      }
    ]

    const createdAccounts = []
    const errors = []

    // Create each admin account
    for (const accountData of adminAccounts) {
      try {
        const { data, error } = await userService.createAdminUser(accountData)
        
        if (error) {
          errors.push({ email: accountData.email, error: error.message })
        } else {
          createdAccounts.push({
            name: data.name,
            email: data.email,
            role: data.role,
            id: data.id
          })
        }
      } catch (err) {
        errors.push({ 
          email: accountData.email, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        })
      }
    }

    // Log the creation
    console.log('Admin accounts setup completed:', {
      created: createdAccounts.length,
      errors: errors.length,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { 
        message: 'Admin accounts setup completed',
        created: createdAccounts,
        errors,
        loginInfo: {
          password,
          accounts: adminAccounts.map(acc => ({
            email: acc.email,
            role: acc.role,
            name: acc.name
          }))
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup admin accounts' },
      { status: 500 }
    )
  }
}

// GET endpoint to check current admin accounts
export async function GET() {
  try {
    const { data: admins, error } = await userService.getAdminUsers()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch admin accounts' },
        { status: 500 }
      )
    }

    const adminSummary = (admins || []).map(admin => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      created_at: admin.created_at,
      email_verified: admin.email_verified
    }))

    return NextResponse.json(
      { 
        count: adminSummary.length,
        admins: adminSummary
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Get admin accounts error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
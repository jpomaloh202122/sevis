import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import bcrypt from 'bcryptjs'

// This endpoint creates the three-tier admin accounts, bypassing existing checks
export async function POST(request: NextRequest) {
  try {
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
    console.log('Three-tier admin accounts setup:', {
      created: createdAccounts.length,
      errors: errors.length,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { 
        message: 'Three-tier admin accounts setup completed',
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
    console.error('Three-tier admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup three-tier admin accounts' },
      { status: 500 }
    )
  }
}
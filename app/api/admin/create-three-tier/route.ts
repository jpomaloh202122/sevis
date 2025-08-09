import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const password = 'Admin123!' // Common password for all admin accounts
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Define the three admin accounts using national_id to encode their levels
    const adminAccounts = [
      {
        name: 'Super Administrator',
        email: 'superadmin@sevis.gov',
        role: 'admin', // All use 'admin' role due to DB constraint
        phone: '+675-555-0001',
        national_id: 'SUPER-ADMIN-001', // Encoded level: SUPER
        password_hash: passwordHash,
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        photo_url: 'super_admin' // Additional encoding
      },
      {
        name: 'Approving Administrator',
        email: 'adminapproval@sevis.gov',
        role: 'admin',
        phone: '+675-555-0002', 
        national_id: 'APPROVE-ADMIN-002', // Encoded level: APPROVE
        password_hash: passwordHash,
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        photo_url: 'approving_admin'
      },
      {
        name: 'Vetting Administrator',
        email: 'adminvet@sevis.gov',
        role: 'admin',
        phone: '+675-555-0003',
        national_id: 'VET-ADMIN-003', // Encoded level: VET
        password_hash: passwordHash,
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        photo_url: 'vetting_admin'
      }
    ]

    const createdAccounts = []
    const errors = []

    // Create each admin account
    for (const accountData of adminAccounts) {
      try {
        // Check if account already exists
        const { data: existingUser } = await supabase
          .from('users')
          .select('email')
          .eq('email', accountData.email)
          .single()
        
        if (existingUser) {
          errors.push({ email: accountData.email, error: 'Account already exists' })
          continue
        }

        const { data, error } = await supabase
          .from('users')
          .insert([accountData])
          .select()
          .single()
        
        if (error) {
          errors.push({ email: accountData.email, error: error.message })
        } else {
          createdAccounts.push({
            name: data.name,
            email: data.email,
            role: data.role,
            admin_level: getAdminLevel(data),
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

    // Update existing admin to super admin level
    const { data: existingAdmin } = await supabase
      .from('users')
      .update({
        national_id: 'SUPER-ADMIN-000',
        photo_url: 'super_admin',
        name: 'Primary Super Administrator'
      })
      .eq('email', 'admin@sevis.gov.pg')
      .select()
      .single()

    return NextResponse.json(
      { 
        message: 'Three-tier admin system created successfully',
        created: createdAccounts,
        errors,
        existing_updated: existingAdmin ? {
          name: existingAdmin.name,
          email: existingAdmin.email,
          admin_level: getAdminLevel(existingAdmin)
        } : null,
        login_info: {
          password,
          accounts: adminAccounts.map(acc => ({
            email: acc.email,
            admin_level: getAdminLevel(acc),
            name: acc.name
          }))
        },
        admin_level_mapping: {
          'SUPER-ADMIN': 'Super Administrator (full access)',
          'APPROVE-ADMIN': 'Approving Administrator (can approve/reject after vetting)',
          'VET-ADMIN': 'Vetting Administrator (can verify documents, mark for approval)'
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Three-tier admin creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create three-tier admin system' },
      { status: 500 }
    )
  }
}

// Helper function to determine admin level from user data
function getAdminLevel(user: any): 'super_admin' | 'approving_admin' | 'vetting_admin' | 'admin' {
  if (user.national_id?.includes('SUPER-ADMIN') || user.photo_url === 'super_admin') {
    return 'super_admin'
  }
  if (user.national_id?.includes('APPROVE-ADMIN') || user.photo_url === 'approving_admin') {
    return 'approving_admin'
  }
  if (user.national_id?.includes('VET-ADMIN') || user.photo_url === 'vetting_admin') {
    return 'vetting_admin'
  }
  return 'admin'
}
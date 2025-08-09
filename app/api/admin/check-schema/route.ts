import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function GET() {
  try {
    // Get a sample admin user to see all available fields
    const { data: adminUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .single()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to get admin user schema', details: error.message },
        { status: 500 }
      )
    }

    // Get table schema information
    const availableFields = Object.keys(adminUser || {})
    
    return NextResponse.json(
      {
        message: 'User table schema check',
        available_fields: availableFields,
        current_admin_user: adminUser,
        role_simulation_options: {
          option1: 'Use existing field like phone or national_id to encode admin level',
          option2: 'Use photo_url field to store admin level (since it\'s likely unused)',
          option3: 'Create additional admin users with distinct identifiers',
          option4: 'Update database schema to allow new roles'
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json(
      { error: 'Failed to check schema' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    // Get the existing admin user
    const { data: existingAdmin, error: getUserError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .single()
    
    if (getUserError || !existingAdmin) {
      return NextResponse.json(
        { error: 'No existing admin user found' },
        { status: 404 }
      )
    }
    
    // Hash the password
    const password = 'Admin123!'
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Update the admin user with password and ensure email is verified
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password_hash: passwordHash,
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('id', existingAdmin.id)
      .select()
      .single()
    
    if (error) {
      console.error('Update admin error:', error)
      return NextResponse.json(
        { error: 'Failed to update admin user', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('Successfully set up admin user:', data.email)
    
    return NextResponse.json(
      { 
        message: 'Admin setup completed successfully',
        admin: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
        },
        loginCredentials: {
          email: data.email,
          password: password
        },
        loginUrl: '/admin/login',
        note: 'Admin user is now ready to login with the provided credentials'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Finalize admin setup error:', error)
    return NextResponse.json(
      { error: 'Failed to finalize admin setup' },
      { status: 500 }
    )
  }
}
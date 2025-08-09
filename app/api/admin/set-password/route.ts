import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: NextRequest) {
  try {
    const { userId, password } = await request.json()
    
    if (!userId || !password) {
      return NextResponse.json(
        { error: 'userId and password are required' },
        { status: 400 }
      )
    }
    
    // Hash the password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    // Update the user with the password hash
    const { data, error } = await supabase
      .from('users')
      .update({ 
        password_hash: passwordHash,
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) {
      console.error('Set password error:', error)
      return NextResponse.json(
        { error: 'Failed to set password', details: error.message },
        { status: 500 }
      )
    }
    
    console.log('Password set for admin user:', data.email)
    
    return NextResponse.json(
      { 
        message: 'Password set successfully',
        admin: {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role
        },
        loginCredentials: {
          email: data.email,
          password: password
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    )
  }
}
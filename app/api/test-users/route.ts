import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    // Get all users to see if any exist
    const { data: users, error } = await userService.getAllUsers()
    
    if (error) {
      return NextResponse.json(
        { error: 'Database error', details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      count: users?.length || 0,
      users: users?.slice(0, 5).map(u => ({ 
        id: u.id, 
        email: u.email, 
        name: u.name,
        role: u.role 
      })) || []
    })

  } catch (error) {
    console.error('Test users error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    )
  }
}
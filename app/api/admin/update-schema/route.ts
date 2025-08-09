import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    // First, check current constraint
    const { data: currentConstraints, error: checkError } = await supabaseAdmin
      .rpc('sql', {
        query: `
          SELECT constraint_name, check_clause 
          FROM information_schema.check_constraints 
          WHERE constraint_name LIKE '%role%'
        `
      })
    
    console.log('Current constraints:', currentConstraints)
    
    // Drop existing role constraint if it exists
    const { data: dropResult, error: dropError } = await supabaseAdmin
      .rpc('sql', {
        query: `
          ALTER TABLE users 
          DROP CONSTRAINT IF EXISTS users_role_check
        `
      })
    
    if (dropError) {
      console.error('Drop constraint error:', dropError)
    } else {
      console.log('Dropped existing constraint:', dropResult)
    }
    
    // Add new constraint with extended roles
    const { data: addResult, error: addError } = await supabaseAdmin
      .rpc('sql', {
        query: `
          ALTER TABLE users 
          ADD CONSTRAINT users_role_check 
          CHECK (role IN ('user', 'admin', 'super_admin', 'approving_admin', 'vetting_admin'))
        `
      })
    
    if (addError) {
      console.error('Add constraint error:', addError)
      return NextResponse.json(
        { 
          error: 'Failed to add new constraint',
          details: addError.message,
          currentConstraints
        },
        { status: 500 }
      )
    }
    
    console.log('Added new constraint:', addResult)
    
    return NextResponse.json(
      { 
        message: 'Database schema updated successfully',
        operations: {
          dropped: dropResult,
          added: addResult,
          currentConstraints
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Schema update error:', error)
    return NextResponse.json(
      { error: 'Failed to update database schema' },
      { status: 500 }
    )
  }
}
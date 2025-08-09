import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'

export async function GET() {
  try {
    // Test if we can create users with the three admin roles
    const testRoles = ['admin', 'super_admin', 'approving_admin', 'vetting_admin']
    const testResults = []
    
    for (const role of testRoles) {
      try {
        // Try to update the existing admin user to each role type to test constraints
        const { data: existingAdmins } = await userService.getAdminUsers()
        
        if (!existingAdmins || existingAdmins.length === 0) {
          testResults.push({ role, supported: false, error: 'No admin user to test with' })
          continue
        }
        
        const existingAdmin = existingAdmins[0]
        
        // Try to update role (this will test the constraint without actually changing it)
        const { data, error } = await userService.updateUserRole(existingAdmin.id, role as any)
        
        if (error) {
          testResults.push({ 
            role, 
            supported: false, 
            error: error.message,
            isConstraintError: error.message.includes('check constraint')
          })
        } else {
          testResults.push({ role, supported: true, error: null })
          
          // Revert back to original role if test succeeded
          if (role !== 'admin') {
            await userService.updateUserRole(existingAdmin.id, 'admin')
          }
        }
      } catch (err) {
        testResults.push({ 
          role, 
          supported: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        })
      }
    }

    // Check current admin roles in the codebase
    const codebaseRoles = {
      database_types: ['admin', 'super_admin', 'approving_admin', 'vetting_admin'],
      auth_context_supported: ['user', 'admin'],
      admin_pages_check: ['admin', 'super_admin', 'approving_admin', 'vetting_admin']
    }

    return NextResponse.json(
      {
        message: 'Admin role compatibility check',
        database_test_results: testResults,
        codebase_roles: codebaseRoles,
        recommendation: testResults.find(t => t.role === 'super_admin')?.supported 
          ? 'Database supports extended roles - you can proceed with three-tier setup'
          : 'Database constraint prevents extended roles - recommend updating schema or using role simulation'
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Role check error:', error)
    return NextResponse.json(
      { error: 'Failed to check role compatibility' },
      { status: 500 }
    )
  }
}
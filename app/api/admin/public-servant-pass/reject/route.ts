import { NextRequest, NextResponse } from 'next/server'
import { psPassAdminService } from '@/lib/public-servant-pass-admin'
import { userService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { 
      applicationId, 
      adminId,
      reason 
    } = await request.json()

    if (!applicationId || !adminId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, adminId, and reason' },
        { status: 400 }
      )
    }

    // Verify admin user exists and has rejection permissions
    const { data: adminUser, error: adminError } = await userService.getUserById(adminId)
    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Check if admin has rejection permissions
    const hasRejectionAccess = ['admin', 'super_admin', 'vetting_admin', 'approving_admin'].includes(adminUser.role)
    if (!hasRejectionAccess) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin permissions required' },
        { status: 403 }
      )
    }

    // Reject the application
    const result = await psPassAdminService.rejectApplication(
      applicationId, 
      adminId,
      reason
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Public Servant Pass application rejected',
      data: result.data
    })

  } catch (error) {
    console.error('Public Servant Pass rejection error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { psPassAdminService } from '@/lib/public-servant-pass-admin'
import { userService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { 
      applicationId, 
      adminId,
      adminNote 
    } = await request.json()

    if (!applicationId || !adminId) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId and adminId' },
        { status: 400 }
      )
    }

    // Verify admin user exists and has approval permissions
    const { data: adminUser, error: adminError } = await userService.getUserById(adminId)
    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Check if admin has approval permissions
    const hasApprovalAccess = ['admin', 'super_admin', 'approving_admin'].includes(adminUser.role)
    if (!hasApprovalAccess) {
      return NextResponse.json(
        { error: 'Unauthorized: Approval permissions required' },
        { status: 403 }
      )
    }

    // Approve the application and generate reference number
    const result = await psPassAdminService.approveApplication(
      applicationId, 
      adminId,
      adminNote
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Public Servant Pass approved successfully',
      data: result.data,
      referenceNumber: result.referenceNumber
    })

  } catch (error) {
    console.error('Public Servant Pass approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
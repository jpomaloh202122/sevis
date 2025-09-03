import { NextRequest, NextResponse } from 'next/server'
import { psPassAdminService } from '@/lib/public-servant-pass-admin'
import { userService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { 
      applicationId, 
      adminId, 
      vettingData 
    } = await request.json()

    if (!applicationId || !adminId || !vettingData) {
      return NextResponse.json(
        { error: 'Missing required fields: applicationId, adminId, and vettingData' },
        { status: 400 }
      )
    }

    // Verify admin user exists and has vetting permissions
    const { data: adminUser, error: adminError } = await userService.getUserById(adminId)
    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Check if admin has vetting permissions
    const hasVettingAccess = ['admin', 'super_admin', 'vetting_admin'].includes(adminUser.role)
    if (!hasVettingAccess) {
      return NextResponse.json(
        { error: 'Unauthorized: Vetting permissions required' },
        { status: 403 }
      )
    }

    // Add admin info to vetting data
    const completeVettingData = {
      ...vettingData,
      vettedBy: adminId,
      vettedAt: new Date().toISOString(),
      adminName: adminUser.name,
      adminRole: adminUser.role
    }

    // Vet the application
    const result = await psPassAdminService.vetApplication(
      applicationId, 
      completeVettingData, 
      adminId
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Public Servant Pass application vetted successfully',
      data: result.data,
      vettingData: completeVettingData
    })

  } catch (error) {
    console.error('Public Servant Pass vetting error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getAdminLevel, canApprove, canVet, isSuperAdmin } from '@/lib/admin-roles'

export async function POST(request: NextRequest) {
  try {
    const { userData } = await request.json()
    
    if (!userData) {
      return NextResponse.json(
        { error: 'userData is required' },
        { status: 400 }
      )
    }

    const adminLevel = getAdminLevel(userData)
    const canApproveApps = canApprove(userData)
    const canVetApps = canVet(userData)
    const isSuperAdminUser = isSuperAdmin(userData)

    return NextResponse.json(
      {
        message: 'Admin level test results',
        user: {
          name: userData.name,
          email: userData.email,
          national_id: userData.national_id,
          photo_url: userData.photo_url
        },
        admin_level: adminLevel,
        permissions: {
          can_approve: canApproveApps,
          can_vet: canVetApps,
          is_super_admin: isSuperAdminUser
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Admin level test error:', error)
    return NextResponse.json(
      { error: 'Failed to test admin levels' },
      { status: 500 }
    )
  }
}
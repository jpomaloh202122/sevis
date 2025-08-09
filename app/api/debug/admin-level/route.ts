import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import { getAdminLevel, canVet, canApprove, isAdmin } from '@/lib/admin-roles'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get user by email
    const { data: user, error } = await userService.getUserByEmail(email)
    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Test admin level detection
    const adminLevel = getAdminLevel(user)
    const canVetApps = canVet(user)
    const canApproveApps = canApprove(user)
    const hasAdminAccess = isAdmin(user)

    return NextResponse.json({
      message: 'Admin level debug results',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        national_id: user.national_id,
        photo_url: user.photo_url
      },
      adminLevel,
      permissions: {
        isAdmin: hasAdminAccess,
        canVet: canVetApps,
        canApprove: canApproveApps
      },
      debug: {
        nationalIdCheck: {
          hasVetAdmin: user.national_id?.includes('VET-ADMIN'),
          hasApproveAdmin: user.national_id?.includes('APPROVE-ADMIN'),
          hasSuperAdmin: user.national_id?.includes('SUPER-ADMIN'),
        },
        photoUrlCheck: {
          photoUrl: user.photo_url,
          isVettingAdmin: user.photo_url === 'vetting_admin',
          isApprovingAdmin: user.photo_url === 'approving_admin',
          isSuperAdmin: user.photo_url === 'super_admin'
        }
      }
    })

  } catch (error) {
    console.error('Admin level debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
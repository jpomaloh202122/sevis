import { NextRequest, NextResponse } from 'next/server'
import { applicationService, userService } from '@/lib/database'
import { getAdminLevel, canVet } from '@/lib/admin-roles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentVerifications = await request.json()

    if (!documentVerifications.verified_by) {
      return NextResponse.json(
        { error: 'Verified by admin ID is required' },
        { status: 400 }
      )
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    // Verify admin user exists and has vetting permissions
    const { data: adminUser, error: adminError } = await userService.getUserById(documentVerifications.verified_by)
    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    // Check if admin has vetting permissions - any admin can now verify documents
    const hasVettingAccess = canVet(adminUser)
    if (!hasVettingAccess) {
      return NextResponse.json(
        { error: 'Insufficient permissions: Admin access required' },
        { status: 403 }
      )
    }

    // Update document verification
    const { data, error } = await applicationService.updateDocumentVerification(params.id, documentVerifications)

    if (error) {
      console.error('Update document verification error:', error)
      return NextResponse.json(
        { error: 'Failed to update document verification' },
        { status: 500 }
      )
    }

    // Log verification action
    console.log(`Admin ${adminUser.name} (${adminUser.id}) updated document verification for application ${params.id}`, {
      applicationId: params.id,
      adminId: adminUser.id,
      adminName: adminUser.name,
      verifications: documentVerifications,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { 
        message: 'Document verification updated successfully', 
        data: {
          ...data,
          verifiedBy: adminUser.name,
          verifiedAt: new Date().toISOString()
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update document verification error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
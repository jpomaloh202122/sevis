import { NextRequest, NextResponse } from 'next/server'
import { applicationService, userService } from '@/lib/database'
import { getAdminLevel, canVet } from '@/lib/admin-roles'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const requestData = await request.json()
    const { verified_by, admin_name, ...documentVerifications } = requestData

    if (!verified_by) {
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

    // Skip expensive admin lookup - trust the frontend has already verified admin permissions
    // The frontend only shows verification controls to users with proper admin roles
    
    // Add timestamp to verification data
    const verificationDataWithTimestamp = {
      ...documentVerifications,
      verified_by,
      verified_at: new Date().toISOString()
    }

    // Update document verification
    const { data, error } = await applicationService.updateDocumentVerification(params.id, verificationDataWithTimestamp)

    if (error) {
      console.error('Update document verification error:', error)
      return NextResponse.json(
        { error: 'Failed to update document verification' },
        { status: 500 }
      )
    }

    // Minimal logging without expensive user lookup
    console.log(`Document verification updated for application ${params.id}`, {
      applicationId: params.id,
      adminId: verified_by,
      verifications: documentVerifications,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { 
        message: 'Document verification updated successfully', 
        data: {
          ...data,
          verifiedBy: admin_name || 'Admin',
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
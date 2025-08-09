import { NextRequest, NextResponse } from 'next/server'
import { applicationService, userService } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status, adminNote, adminId, adminRole, vettingData } = await request.json()
    
    console.log('=== STATUS UPDATE API DEBUG ===')
    console.log('Application ID:', params.id)
    console.log('Request body:', { status, adminNote, adminId, adminRole, vettingData })

    if (!adminId) {
      console.error('Admin ID is required')
      return NextResponse.json(
        { error: 'Admin ID is required' },
        { status: 400 }
      )
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['pending', 'in_progress', 'completed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      )
    }

    // Verify admin user exists and has appropriate role
    const { data: adminUser, error: adminError } = await userService.getUserById(adminId)
    if (adminError || !adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      )
    }

    const hasAdminAccess = ['admin', 'super_admin', 'approving_admin', 'vetting_admin'].includes(adminUser.role)
    if (!hasAdminAccess) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    // Get the application to verify it exists
    const { data: application, error: appError } = await applicationService.getApplicationById(params.id)
    if (appError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update application status with role-based validation
    // Use the adminRole from the request (which includes admin level) instead of database role
    const effectiveRole = adminRole || adminUser.role
    const { data, error } = await applicationService.updateApplicationStatusWithRole(
      params.id, 
      status, 
      adminId, 
      effectiveRole, 
      adminNote,
      vettingData
    )

    if (error) {
      console.error('Update application status error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to update application status' },
        { status: 500 }
      )
    }

    // Log admin action
    console.log(`Admin ${adminUser.name} (${adminUser.role}) updated application ${params.id} status to ${status}`, {
      applicationId: params.id,
      adminId,
      adminName: adminUser.name,
      adminRole: adminUser.role,
      oldStatus: application.status,
      newStatus: status,
      note: adminNote,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json(
      { 
        message: 'Application status updated successfully', 
        data: {
          ...data,
          adminNote,
          updatedBy: adminUser.name,
          updatedByRole: adminUser.role,
          updatedAt: new Date().toISOString()
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update application status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
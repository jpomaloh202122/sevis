import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/lib/database'
import { userService } from '@/lib/database'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, adminId, deleteScope } = body

    // Validate required fields
    if (!deleteScope || !['user', 'all', 'service'].includes(deleteScope)) {
      return NextResponse.json(
        { error: 'Invalid deleteScope. Must be "user", "all", or "service"' },
        { status: 400 }
      )
    }

    let targetUserId = userId
    let isAdminOperation = false

    // If adminId is provided, verify admin permissions
    if (adminId) {
      const { data: adminUser, error: adminError } = await userService.getUserById(adminId)
      
      if (adminError || !adminUser) {
        return NextResponse.json(
          { error: 'Admin user not found' },
          { status: 404 }
        )
      }

      // Check if user has admin permissions
      const hasAdminAccess = ['admin', 'super_admin'].includes(adminUser.role)
      if (!hasAdminAccess) {
        return NextResponse.json(
          { error: 'Unauthorized: Admin permissions required' },
          { status: 403 }
        )
      }

      isAdminOperation = true
    }

    let deletedCount = 0
    let errorCount = 0
    const results: any[] = []

    if (deleteScope === 'user' && targetUserId) {
      // Delete all applications for a specific user
      console.log(`Deleting all applications for user: ${targetUserId}`)
      
      // Get all user applications first
      const { data: userApps, error: fetchError } = await applicationService.getUserApplications(targetUserId)
      
      if (fetchError) {
        return NextResponse.json(
          { error: `Failed to fetch user applications: ${fetchError.message}` },
          { status: 500 }
        )
      }

      const applications = userApps || []
      
      // Delete each application
      for (const app of applications) {
        try {
          const { data, error } = await applicationService.deleteApplication(app.id, targetUserId)
          
          if (error) {
            console.error(`Failed to delete application ${app.id}:`, error)
            errorCount++
            results.push({
              id: app.id,
              reference_number: app.reference_number,
              service_name: app.service_name,
              success: false,
              error: error.message
            })
          } else {
            deletedCount++
            results.push({
              id: app.id,
              reference_number: app.reference_number,
              service_name: app.service_name,
              success: true
            })
          }
        } catch (err: any) {
          console.error(`Error deleting application ${app.id}:`, err)
          errorCount++
          results.push({
            id: app.id,
            reference_number: app.reference_number || 'N/A',
            service_name: app.service_name || 'N/A',
            success: false,
            error: err.message
          })
        }
      }

    } else if (deleteScope === 'all' && isAdminOperation) {
      // Delete ALL applications in the system (admin only)
      console.log(`Admin ${adminId} deleting ALL applications in the system`)
      
      // Get all applications
      const { data: allApps, error: fetchError } = await applicationService.getAllApplications()
      
      if (fetchError) {
        return NextResponse.json(
          { error: `Failed to fetch all applications: ${fetchError.message}` },
          { status: 500 }
        )
      }

      const applications = allApps || []
      
      // Delete each application
      for (const app of applications) {
        try {
          const { data, error } = await applicationService.deleteApplication(app.id, app.user_id)
          
          if (error) {
            console.error(`Failed to delete application ${app.id}:`, error)
            errorCount++
            results.push({
              id: app.id,
              reference_number: app.reference_number,
              service_name: app.service_name,
              user_id: app.user_id,
              success: false,
              error: error.message
            })
          } else {
            deletedCount++
            results.push({
              id: app.id,
              reference_number: app.reference_number,
              service_name: app.service_name,
              user_id: app.user_id,
              success: true
            })
          }
        } catch (err: any) {
          console.error(`Error deleting application ${app.id}:`, err)
          errorCount++
          results.push({
            id: app.id,
            reference_number: app.reference_number || 'N/A',
            service_name: app.service_name || 'N/A',
            user_id: app.user_id,
            success: false,
            error: err.message
          })
        }
      }

    } else if (deleteScope === 'service' && body.serviceName) {
      // Delete all applications for a specific service (admin only)
      if (!isAdminOperation) {
        return NextResponse.json(
          { error: 'Admin permissions required to delete service applications' },
          { status: 403 }
        )
      }

      console.log(`Admin ${adminId} deleting all ${body.serviceName} applications`)
      
      // Get all applications for the service
      const { data: allApps, error: fetchError } = await applicationService.getAllApplications()
      
      if (fetchError) {
        return NextResponse.json(
          { error: `Failed to fetch applications: ${fetchError.message}` },
          { status: 500 }
        )
      }

      const serviceApps = (allApps || []).filter(app => app.service_name === body.serviceName)
      
      // Delete each application
      for (const app of serviceApps) {
        try {
          const { data, error } = await applicationService.deleteApplication(app.id, app.user_id)
          
          if (error) {
            console.error(`Failed to delete application ${app.id}:`, error)
            errorCount++
            results.push({
              id: app.id,
              reference_number: app.reference_number,
              service_name: app.service_name,
              user_id: app.user_id,
              success: false,
              error: error.message
            })
          } else {
            deletedCount++
            results.push({
              id: app.id,
              reference_number: app.reference_number,
              service_name: app.service_name,
              user_id: app.user_id,
              success: true
            })
          }
        } catch (err: any) {
          console.error(`Error deleting application ${app.id}:`, err)
          errorCount++
          results.push({
            id: app.id,
            reference_number: app.reference_number || 'N/A',
            service_name: app.service_name || 'N/A',
            user_id: app.user_id,
            success: false,
            error: err.message
          })
        }
      }

    } else {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      )
    }

    // Return summary of results
    const summary = {
      deleteScope,
      totalAttempted: deletedCount + errorCount,
      deletedCount,
      errorCount,
      details: results
    }

    if (errorCount > 0 && deletedCount === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to delete any applications',
          ...summary
        },
        { status: 500 }
      )
    }

    const message = deletedCount > 0 
      ? `Successfully deleted ${deletedCount} application(s)${errorCount > 0 ? ` (${errorCount} failed)` : ''}`
      : 'No applications found to delete'

    return NextResponse.json({
      success: true,
      message,
      ...summary
    })

  } catch (error) {
    console.error('Bulk delete applications error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to preview what would be deleted
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const deleteScope = searchParams.get('deleteScope')
    const userId = searchParams.get('userId')
    const serviceName = searchParams.get('serviceName')

    if (!deleteScope || !['user', 'all', 'service'].includes(deleteScope)) {
      return NextResponse.json(
        { error: 'Invalid deleteScope. Must be "user", "all", or "service"' },
        { status: 400 }
      )
    }

    let applications: any[] = []

    if (deleteScope === 'user' && userId) {
      const { data, error } = await applicationService.getUserApplications(userId)
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      applications = data || []

    } else if (deleteScope === 'all') {
      const { data, error } = await applicationService.getAllApplications()
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      applications = data || []

    } else if (deleteScope === 'service' && serviceName) {
      const { data, error } = await applicationService.getAllApplications()
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      applications = (data || []).filter(app => app.service_name === serviceName)
    }

    const summary = applications.reduce((acc: any, app) => {
      acc.total++
      acc.byService[app.service_name] = (acc.byService[app.service_name] || 0) + 1
      acc.byStatus[app.status] = (acc.byStatus[app.status] || 0) + 1
      return acc
    }, {
      total: 0,
      byService: {},
      byStatus: {}
    })

    return NextResponse.json({
      deleteScope,
      applicationsToDelete: applications.length,
      summary,
      applications: applications.map(app => ({
        id: app.id,
        reference_number: app.reference_number,
        service_name: app.service_name,
        status: app.status,
        user_id: app.user_id,
        created_at: app.created_at
      }))
    })

  } catch (error) {
    console.error('Error previewing bulk delete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
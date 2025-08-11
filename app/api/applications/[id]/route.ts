import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/lib/database'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    console.log(`Attempting to delete application ${params.id} for user ${userId}`)
    
    // First, check if the application exists and verify ownership
    const { data: existingApp, error: fetchError } = await applicationService.getApplicationById(params.id)
    
    if (fetchError) {
      console.error('Error fetching application:', fetchError)
      return NextResponse.json(
        { error: 'Failed to verify application existence' },
        { status: 500 }
      )
    }

    if (!existingApp) {
      console.log(`Application ${params.id} not found`)
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (existingApp.user_id !== userId) {
      console.log(`User ${userId} does not own application ${params.id} (owned by ${existingApp.user_id})`)
      return NextResponse.json(
        { error: 'Access denied - you can only delete your own applications' },
        { status: 403 }
      )
    }

    // Now proceed with deletion
    const { data, error } = await applicationService.deleteApplication(params.id, userId)

    if (error) {
      console.error('Delete application error:', error)
      return NextResponse.json(
        { error: `Failed to delete application: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      console.log(`No data returned from delete operation for application ${params.id}`)
      return NextResponse.json(
        { error: 'Application could not be deleted' },
        { status: 404 }
      )
    }

    console.log(`Successfully deleted application ${params.id}`)
    return NextResponse.json(
      { message: 'Application deleted successfully', data },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete application error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, status } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (!params.id) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      )
    }

    if (!status || !['pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Only resubmission to pending is allowed.' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: app, error: fetchError } = await applicationService.getApplicationById(params.id)
    if (fetchError || !app) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    if (app.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    const { data, error } = await applicationService.updateApplicationStatus(params.id, status)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Application status updated', data },
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
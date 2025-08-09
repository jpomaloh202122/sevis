import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/lib/database'

export async function GET() {
  try {
    // Get all applications to see the schema
    const { data: applications, error } = await applicationService.getAllApplications()
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to get applications', details: error.message },
        { status: 500 }
      )
    }

    const sampleApp = applications && applications.length > 0 ? applications[0] : null
    const availableFields = sampleApp ? Object.keys(sampleApp) : []

    return NextResponse.json(
      {
        message: 'Applications table schema check',
        total_applications: applications?.length || 0,
        available_fields: availableFields,
        sample_application: sampleApp,
        missing_fields: {
          last_updated_by: availableFields.includes('last_updated_by'),
          admin_notes: availableFields.includes('admin_notes')
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Schema check error:', error)
    return NextResponse.json(
      { error: 'Failed to check applications schema' },
      { status: 500 }
    )
  }
}
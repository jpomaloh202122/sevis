import { NextRequest, NextResponse } from 'next/server'
import { ApplicationLimitsService } from '@/lib/application-limits-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, serviceName } = body

    if (!userId || !serviceName) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and serviceName' },
        { status: 400 }
      )
    }

    // Check if user can apply for the service
    const result = await ApplicationLimitsService.canUserApplyForService(userId, serviceName)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error checking application limits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const serviceName = searchParams.get('serviceName')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      )
    }

    if (serviceName) {
      // Check specific service
      const result = await ApplicationLimitsService.canUserApplyForService(userId, serviceName)
      return NextResponse.json(result)
    } else {
      // Get all user applications summary
      const applications = await ApplicationLimitsService.getAllUserApplications(userId)
      return NextResponse.json({
        applications,
        totalCount: applications.length,
        byService: applications.reduce((acc: Record<string, number>, app) => {
          acc[app.service_name] = (acc[app.service_name] || 0) + 1
          return acc
        }, {}),
        byStatus: applications.reduce((acc: Record<string, number>, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1
          return acc
        }, {})
      })
    }

  } catch (error) {
    console.error('Error fetching application limits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
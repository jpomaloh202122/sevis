import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/lib/database'
import { ApplicationLimitsService } from '@/lib/application-limits-service'
import type { PublicServantPassFormData, EnhancedApplication } from '@/lib/database-types'

// Generate reference number for Public Servant Pass
function generatePublicServantPassReferenceNumber(): string {
  const prefix = 'PSP'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, formData }: { userId: string; formData: PublicServantPassFormData } = body

    if (!userId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and formData' },
        { status: 400 }
      )
    }

    // Validate required personal information
    if (!formData.personalInfo?.firstName || !formData.personalInfo?.lastName || 
        !formData.personalInfo?.dateOfBirth || !formData.personalInfo?.gender || 
        !formData.personalInfo?.phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required personal information fields' },
        { status: 400 }
      )
    }

    // Validate required employment information
    if (!formData.employmentInfo?.publicServantId || !formData.employmentInfo?.workEmail || 
        !formData.employmentInfo?.department) {
      return NextResponse.json(
        { error: 'Missing required employment information: Public Servant ID, work email, and department are required' },
        { status: 400 }
      )
    }

    // Validate government email domain (basic validation)
    const emailDomain = formData.employmentInfo.workEmail.split('@')[1]
    const validGovDomains = ['gov.pg', 'parliament.gov.pg', 'treasury.gov.pg', 'finance.gov.pg']
    if (!validGovDomains.some(domain => emailDomain?.endsWith(domain))) {
      return NextResponse.json(
        { error: 'Work email must be from a valid Papua New Guinea government domain (*.gov.pg)' },
        { status: 400 }
      )
    }

    // Validate Public Servant ID format (example: PS-DEPT-YYYY-NNNN)
    const psIdPattern = /^PS-[A-Z]{2,6}-\d{4}-\d{4}$/
    if (!psIdPattern.test(formData.employmentInfo.publicServantId)) {
      return NextResponse.json(
        { error: 'Invalid Public Servant ID format. Expected format: PS-DEPT-YYYY-NNNN (e.g., PS-FINANCE-2023-0001)' },
        { status: 400 }
      )
    }

    // Validate declarations
    if (!formData.declarations?.informationAccurate || !formData.declarations?.agreesToTerms ||
        !formData.declarations?.agreesToSecurityPolicy || !formData.declarations?.underststandsPenalties) {
      return NextResponse.json(
        { error: 'All required declarations must be accepted' },
        { status: 400 }
      )
    }

    // Check application limits - one Public Servant Pass per user
    const limitCheck = await ApplicationLimitsService.checkServiceSpecificLimits(
      userId, 
      'Public Servant Pass',
      formData
    )
    
    if (!limitCheck.canApply) {
      return NextResponse.json(
        { 
          error: limitCheck.reason,
          suggestedActions: limitCheck.suggestedActions,
          existingApplication: limitCheck.existingApplication 
        },
        { status: 409 }
      )
    }

    // Generate reference number
    const referenceNumber = generatePublicServantPassReferenceNumber()

    // Create application with enhanced data structure
    const applicationData = {
      ...formData,
      submissionInfo: {
        submittedAt: new Date().toISOString(),
        ipAddress: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        applicationVersion: '1.0.0'
      },
      verificationStatus: {
        employmentVerified: false,
        emailVerified: false,
        backgroundCheckRequired: formData.securityInfo?.requiresBackgroundCheck || false,
        securityClearanceVerified: false
      },
      processingInfo: {
        estimatedProcessingDays: formData.securityInfo?.requiresBackgroundCheck ? 30 : 14,
        requiresInterview: formData.securityInfo?.hasPoliceClearance || false,
        priority: formData.securityInfo?.hasPoliceClearance ? 'high' : 'medium'
      }
    }

    const result = await applicationService.createApplication({
      user_id: userId,
      service_name: 'Public Servant Pass',
      application_data: applicationData,
      reference_number: referenceNumber
    })

    if (result.error) {
      console.error('Database error creating Public Servant Pass application:', result.error)
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      application: result.data,
      message: 'Public Servant Pass application submitted successfully',
      nextSteps: [
        'Your application will be reviewed by the Personnel Management Division',
        'Employment verification will be conducted with your department',
        'You will receive email updates on your work email address',
        formData.securityInfo?.requiresBackgroundCheck 
          ? 'Background check will be initiated (estimated 30 days)'
          : 'Standard verification process (estimated 14 days)',
        'You may be contacted for an interview if required'
      ]
    })

  } catch (error) {
    console.error('Public Servant Pass application submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all Public Servant Pass applications (admin only)
    const result = await applicationService.getAllApplications()
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Filter for Public Servant Pass applications only
    const publicServantPassApplications = result.data?.filter(
      (app: any) => app.service_name === 'Public Servant Pass'
    ) || []

    // Add summary statistics
    const stats = {
      total: publicServantPassApplications.length,
      pending: publicServantPassApplications.filter((app: any) => app.status === 'pending').length,
      inProgress: publicServantPassApplications.filter((app: any) => app.status === 'in_progress').length,
      completed: publicServantPassApplications.filter((app: any) => app.status === 'completed').length,
      rejected: publicServantPassApplications.filter((app: any) => app.status === 'rejected').length,
      byDepartment: publicServantPassApplications.reduce((acc: Record<string, number>, app: any) => {
        const dept = app.application_data?.employmentInfo?.department || 'Unknown'
        acc[dept] = (acc[dept] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      backgroundChecksRequired: publicServantPassApplications.filter(
        (app: any) => app.application_data?.securityInfo?.requiresBackgroundCheck
      ).length
    }

    return NextResponse.json({
      applications: publicServantPassApplications,
      stats,
      totalCount: publicServantPassApplications.length
    })

  } catch (error) {
    console.error('Error fetching Public Servant Pass applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
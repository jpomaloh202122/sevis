import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/lib/database'
import { ApplicationLimitsService } from '@/lib/application-limits-service'
import type { CityPassFormData, EnhancedApplication } from '@/lib/database-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, formData }: { userId: string; formData: CityPassFormData } = body

    if (!userId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and formData' },
        { status: 400 }
      )
    }

    // Validate required personal information
    if (!formData.firstName || !formData.lastName || !formData.email || 
        !formData.phone || !formData.dateOfBirth || !formData.nationalId || 
        !formData.address) {
      return NextResponse.json(
        { error: 'Missing required personal information fields' },
        { status: 400 }
      )
    }

    // Validate category selection
    if (!formData.categoryId || !formData.categoryName) {
      return NextResponse.json(
        { error: 'City Pass category selection is required' },
        { status: 400 }
      )
    }

    // Validate emergency contact information
    if (!formData.emergencyContact?.name || !formData.emergencyContact?.phone || 
        !formData.emergencyContact?.relationship) {
      return NextResponse.json(
        { error: 'Complete emergency contact information is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone number (PNG format)
    const phoneRegex = /^(\+675|675)?[0-9]{8}$/
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid PNG phone number format. Expected format: +675XXXXXXXX or 675XXXXXXXX' },
        { status: 400 }
      )
    }

    // Validate National ID format (basic PNG format validation)
    const nationalIdRegex = /^[A-Z]{2}\d{6}$/
    if (!nationalIdRegex.test(formData.nationalId)) {
      return NextResponse.json(
        { error: 'Invalid National ID format. Expected format: XX123456 (2 letters followed by 6 digits)' },
        { status: 400 }
      )
    }

    // Check application limits - one City Pass per user
    const limitCheck = await ApplicationLimitsService.checkServiceSpecificLimits(
      userId, 
      'City Pass',
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
        identityVerified: false,
        addressVerified: false,
        categoryEligibilityVerified: false,
        backgroundCheckRequired: false
      },
      processingInfo: {
        estimatedProcessingDays: 7,
        requiresInterview: false,
        priority: 'medium',
        categorySpecificRequirements: getCategorySpecificRequirements(formData.categoryId)
      }
    }

    const result = await applicationService.createApplication({
      user_id: userId,
      service_name: 'City Pass',
      application_data: applicationData
    })

    if (result.error) {
      console.error('Database error creating City Pass application:', result.error)
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      application: result.data,
      message: 'City Pass application submitted successfully',
      nextSteps: [
        'Your application will be reviewed by the City Administration',
        'Identity and address verification will be conducted',
        'Category eligibility will be verified',
        'You will receive email updates on your application status',
        `Processing time: 7-10 business days for ${formData.categoryName}`,
        'You may be contacted for additional documentation if required'
      ]
    })

  } catch (error) {
    console.error('City Pass application submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all City Pass applications (admin only)
    const result = await applicationService.getAllApplications()
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Filter for City Pass applications only
    const cityPassApplications = result.data?.filter(
      (app: any) => app.service_name === 'City Pass'
    ) || []

    // Add summary statistics
    const stats = {
      total: cityPassApplications.length,
      pending: cityPassApplications.filter((app: any) => app.status === 'pending').length,
      inProgress: cityPassApplications.filter((app: any) => app.status === 'in_progress').length,
      completed: cityPassApplications.filter((app: any) => app.status === 'completed').length,
      rejected: cityPassApplications.filter((app: any) => app.status === 'rejected').length,
      byCategory: cityPassApplications.reduce((acc: Record<string, number>, app: any) => {
        const category = app.application_data?.categoryName || 'Unknown'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      averageProcessingTime: '7-10 business days'
    }

    return NextResponse.json({
      applications: cityPassApplications,
      stats,
      totalCount: cityPassApplications.length
    })

  } catch (error) {
    console.error('Error fetching City Pass applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Get category-specific requirements for City Pass
 */
function getCategorySpecificRequirements(categoryId: string): string[] {
  const requirements: Record<string, string[]> = {
    'student': [
      'Valid student ID or enrollment certificate',
      'Academic transcript or proof of enrollment',
      'School/University verification letter'
    ],
    'senior': [
      'Age verification (60+ years)',
      'Senior citizen identification',
      'Medical certificate if applicable'
    ],
    'employee': [
      'Employment verification letter',
      'Work ID or employment contract',
      'Employer contact details'
    ],
    'business': [
      'Business registration certificate',
      'Valid business license',
      'Business premises verification'
    ],
    'resident': [
      'Proof of residence (utility bills)',
      'Property ownership documents or rental agreement',
      'Address verification from local ward'
    ],
    'visitor': [
      'Visitor registration documents',
      'Sponsor identification and contact',
      'Purpose of visit documentation'
    ],
    'disability': [
      'Medical certificate confirming disability',
      'Disability assessment report',
      'Specialized requirements documentation'
    ]
  }

  return requirements[categoryId] || [
    'Identity verification documents',
    'Address verification',
    'Category eligibility proof'
  ]
}
import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/lib/database'
import { ApplicationLimitsService } from '@/lib/application-limits-service'
import type { SevisPassFormData, EnhancedApplication } from '@/lib/database-types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, formData }: { userId: string; formData: SevisPassFormData } = body

    if (!userId || !formData) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and formData' },
        { status: 400 }
      )
    }

    // Validate required personal information
    if (!formData.personalInfo?.firstName || !formData.personalInfo?.lastName || 
        !formData.personalInfo?.dateOfBirth || !formData.personalInfo?.gender ||
        !formData.personalInfo?.phoneNumber || !formData.personalInfo?.email ||
        !formData.personalInfo?.nationalId) {
      return NextResponse.json(
        { error: 'Missing required personal information fields' },
        { status: 400 }
      )
    }

    // Validate required address information
    if (!formData.addressInfo?.currentAddress || !formData.addressInfo?.province || 
        !formData.addressInfo?.district) {
      return NextResponse.json(
        { error: 'Missing required address information: current address, province, and district are required' },
        { status: 400 }
      )
    }

    // Validate required travel information
    if (!formData.travelInfo?.purposeOfTravel) {
      return NextResponse.json(
        { error: 'Purpose of travel is required' },
        { status: 400 }
      )
    }

    // Validate required emergency contact
    if (!formData.emergencyContact?.name || !formData.emergencyContact?.relationship ||
        !formData.emergencyContact?.phone || !formData.emergencyContact?.address) {
      return NextResponse.json(
        { error: 'Complete emergency contact information is required' },
        { status: 400 }
      )
    }

    // Validate declarations
    if (!formData.declarations?.informationAccurate || !formData.declarations?.agreesToTerms ||
        !formData.declarations?.agreesToProcessing || !formData.declarations?.understandsPenalties ||
        !formData.declarations?.notProhibitedFromTravel) {
      return NextResponse.json(
        { error: 'All required declarations must be accepted' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.personalInfo.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate phone number (PNG format)
    const phoneRegex = /^(\+675|675)?[0-9]{8}$/
    if (!phoneRegex.test(formData.personalInfo.phoneNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid PNG phone number format. Expected format: +675XXXXXXXX or 675XXXXXXXX' },
        { status: 400 }
      )
    }

    // Validate National ID format
    const nationalIdRegex = /^[A-Z]{2}\d{6}$/
    if (!nationalIdRegex.test(formData.personalInfo.nationalId)) {
      return NextResponse.json(
        { error: 'Invalid National ID format. Expected format: XX123456 (2 letters followed by 6 digits)' },
        { status: 400 }
      )
    }

    // Validate passport information if provided
    if (formData.passportInfo?.hasPassport) {
      if (!formData.passportInfo.passportNumber || !formData.passportInfo.passportIssueDate ||
          !formData.passportInfo.passportExpiryDate) {
        return NextResponse.json(
          { error: 'Passport number, issue date, and expiry date are required when passport information is provided' },
          { status: 400 }
        )
      }

      // Check if passport is not expired
      const expiryDate = new Date(formData.passportInfo.passportExpiryDate)
      const today = new Date()
      if (expiryDate <= today) {
        return NextResponse.json(
          { error: 'Passport has expired. Please renew your passport before applying for SEVIS Pass' },
          { status: 400 }
        )
      }
    }

    // Check application limits - one SEVIS Pass per user
    const limitCheck = await ApplicationLimitsService.checkServiceSpecificLimits(
      userId, 
      'SEVIS Pass',
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
        passportVerified: formData.passportInfo?.hasPassport || false,
        backgroundCheckRequired: true,
        travelHistoryVerified: false,
        biometricDataRequired: true
      },
      processingInfo: {
        estimatedProcessingDays: getProcessingDays(formData),
        requiresInterview: requiresInterview(formData),
        priority: getPriority(formData),
        requiredDocuments: getRequiredDocuments(formData),
        additionalVerification: getAdditionalVerification(formData)
      },
      securityInfo: {
        riskAssessment: 'pending',
        securityClearanceLevel: 'standard',
        backgroundCheckStatus: 'pending',
        biometricStatus: 'pending'
      }
    }

    const result = await applicationService.createApplication({
      user_id: userId,
      service_name: 'SEVIS Pass',
      application_data: applicationData
    })

    if (result.error) {
      console.error('Database error creating SEVIS Pass application:', result.error)
      return NextResponse.json(
        { error: 'Failed to submit application. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      application: result.data,
      message: 'SEVIS Pass application submitted successfully',
      nextSteps: [
        'Your application will be reviewed by the SEVIS Administration',
        'Identity and travel document verification will be conducted',
        'Background security check will be initiated',
        'Biometric data collection may be required',
        formData.passportInfo?.hasPassport 
          ? 'Passport validation will be performed'
          : 'You may need to obtain a passport before final approval',
        `Estimated processing time: ${getProcessingDays(formData)} days`,
        'You will receive email updates on your application status',
        requiresInterview(formData) 
          ? 'You may be scheduled for an in-person interview'
          : 'Standard processing without interview required'
      ]
    })

  } catch (error) {
    console.error('SEVIS Pass application submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get all SEVIS Pass applications (admin only)
    const result = await applicationService.getAllApplications()
    
    if (result.error) {
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    // Filter for SEVIS Pass applications only
    const sevisPassApplications = result.data?.filter(
      (app: any) => app.service_name === 'SEVIS Pass'
    ) || []

    // Add summary statistics
    const stats = {
      total: sevisPassApplications.length,
      pending: sevisPassApplications.filter((app: any) => app.status === 'pending').length,
      inProgress: sevisPassApplications.filter((app: any) => app.status === 'in_progress').length,
      completed: sevisPassApplications.filter((app: any) => app.status === 'completed').length,
      rejected: sevisPassApplications.filter((app: any) => app.status === 'rejected').length,
      byPurpose: sevisPassApplications.reduce((acc: Record<string, number>, app: any) => {
        const purpose = app.application_data?.travelInfo?.purposeOfTravel || 'Unknown'
        acc[purpose] = (acc[purpose] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      withPassport: sevisPassApplications.filter(
        (app: any) => app.application_data?.passportInfo?.hasPassport
      ).length,
      requiresInterview: sevisPassApplications.filter(
        (app: any) => app.application_data?.processingInfo?.requiresInterview
      ).length,
      averageProcessingTime: '21-45 days'
    }

    return NextResponse.json({
      applications: sevisPassApplications,
      stats,
      totalCount: sevisPassApplications.length
    })

  } catch (error) {
    console.error('Error fetching SEVIS Pass applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Calculate processing days based on application complexity
 */
function getProcessingDays(formData: SevisPassFormData): number {
  let days = 21 // Base processing time

  // Add days for various factors
  if (!formData.passportInfo?.hasPassport) days += 14 // Need passport first
  if (formData.travelInfo?.purposeOfTravel === 'Business') days += 7 // Additional business verification
  if (formData.employmentInfo?.employmentStatus === 'Unemployed') days += 7 // Additional verification
  if (formData.travelInfo?.previousInternationalTravel === false) days += 7 // First-time traveler verification

  return Math.min(days, 45) // Cap at 45 days
}

/**
 * Determine if interview is required
 */
function requiresInterview(formData: SevisPassFormData): boolean {
  // Interview required for certain cases
  if (formData.travelInfo?.purposeOfTravel === 'Business') return true
  if (formData.employmentInfo?.employmentStatus === 'Unemployed') return true
  if (!formData.passportInfo?.hasPassport) return true
  if (formData.travelInfo?.previousInternationalTravel === false) return true
  
  return false
}

/**
 * Determine application priority
 */
function getPriority(formData: SevisPassFormData): 'low' | 'medium' | 'high' {
  if (formData.travelInfo?.purposeOfTravel === 'Medical') return 'high'
  if (formData.travelInfo?.purposeOfTravel === 'Business') return 'high'
  if (formData.travelInfo?.purposeOfTravel === 'Education') return 'medium'
  
  return 'medium'
}

/**
 * Get required documents based on application
 */
function getRequiredDocuments(formData: SevisPassFormData): string[] {
  const docs = [
    'National ID copy',
    'Birth certificate',
    'Recent passport photos (2x2 inches)',
    'Proof of address (utility bills)',
    'Police clearance certificate'
  ]

  if (formData.passportInfo?.hasPassport) {
    docs.push('Current passport copy (all pages)')
  } else {
    docs.push('Passport application receipt or appointment confirmation')
  }

  if (formData.travelInfo?.purposeOfTravel === 'Business') {
    docs.push('Business registration documents', 'Invitation letter from overseas entity')
  }

  if (formData.travelInfo?.purposeOfTravel === 'Education') {
    docs.push('Letter of acceptance from educational institution', 'Academic transcripts')
  }

  if (formData.travelInfo?.purposeOfTravel === 'Medical') {
    docs.push('Medical reports and referral letters', 'Hospital appointment confirmation')
  }

  if (formData.employmentInfo?.employmentStatus === 'Employed') {
    docs.push('Employment verification letter', 'Salary certificate')
  }

  return docs
}

/**
 * Get additional verification requirements
 */
function getAdditionalVerification(formData: SevisPassFormData): string[] {
  const verification = [
    'Identity verification',
    'Address confirmation',
    'Background security check'
  ]

  if (formData.travelInfo?.purposeOfTravel === 'Business') {
    verification.push('Business entity verification', 'Travel purpose validation')
  }

  if (formData.employmentInfo?.employmentStatus === 'Unemployed') {
    verification.push('Source of funds verification', 'Travel financing confirmation')
  }

  if (formData.travelInfo?.previousInternationalTravel === false) {
    verification.push('First-time traveler assessment', 'Return guarantee evaluation')
  }

  return verification
}
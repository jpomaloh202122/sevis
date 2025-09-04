import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/lib/database'
import { v4 as uuidv4 } from 'uuid'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

// Generate reference number
function generateReferenceNumber(serviceType: string): string {
  let prefix = 'APP'
  if (serviceType === 'learners-permit') prefix = 'LP'
  else if (serviceType === 'drivers-license') prefix = 'DL'
  else if (serviceType === 'Public Servant Pass') prefix = 'PSP'
  
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substr(2, 4).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Handle file upload
async function saveUploadedFile(file: File, directory: string, filename: string): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  // Create upload directory if it doesn't exist
  const uploadDir = join(process.cwd(), 'public', 'uploads', directory)
  await mkdir(uploadDir, { recursive: true })
  
  // Save file
  const filePath = join(uploadDir, filename)
  await writeFile(filePath, buffer)
  
  // Return public URL
  return `/uploads/${directory}/${filename}`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const serviceType = formData.get('serviceType') as string
    console.log('Received application request for service type:', serviceType)
    
    if (!serviceType) {
      return NextResponse.json(
        { error: 'Service type is required' },
        { status: 400 }
      )
    }

    let personalInfo: any = {}
    let declarations: any = {}

    if (serviceType === 'learners-permit') {
      // Extract personal information for learner's permit
      personalInfo = {
        fullName: formData.get('personalInfo[fullName]') as string,
        dateOfBirth: formData.get('personalInfo[dateOfBirth]') as string,
        placeOfBirth: formData.get('personalInfo[placeOfBirth]') as string,
        nationalId: formData.get('personalInfo[nationalId]') as string,
        phoneNumber: formData.get('personalInfo[phoneNumber]') as string,
        email: formData.get('personalInfo[email]') as string,
        address: formData.get('personalInfo[address]') as string,
        emergencyContactName: formData.get('personalInfo[emergencyContactName]') as string,
        emergencyContactPhone: formData.get('personalInfo[emergencyContactPhone]') as string,
      }

      declarations = {
        termsAccepted: formData.get('declarations[termsAccepted]') === 'true',
        informationAccurate: formData.get('declarations[informationAccurate]') === 'true',
        medicalFitness: formData.get('declarations[medicalFitness]') === 'true',
      }
    } else if (serviceType === 'drivers-license') {
      // Extract personal information for driver's license
      console.log('API: Extracting driver license form data...')
      console.log('API: Form data keys:', Array.from(formData.keys()))
      
      personalInfo = {
        surname: formData.get('personalInfo[surname]') as string,
        givenNames: formData.get('personalInfo[givenNames]') as string,
        email: formData.get('personalInfo[email]') || formData.get('personalInfo[mobile]'), // Use mobile as fallback for email
        phoneNumber: formData.get('personalInfo[mobile]') as string,
        dateOfBirth: formData.get('personalInfo[dateOfBirth]') as string,
        gender: formData.get('personalInfo[gender]') as string,
        nationality: formData.get('personalInfo[nationality]') as string,
        height: formData.get('personalInfo[height]') as string,
        eyeColour: formData.get('personalInfo[eyeColour]') as string,
        hairColour: formData.get('personalInfo[hairColour]') as string,
        complexion: formData.get('personalInfo[complexion]') as string,
        residentialAddress: {
          section: formData.get('personalInfo[residentialAddress][section]') as string,
          lot: formData.get('personalInfo[residentialAddress][lot]') as string,
          street: formData.get('personalInfo[residentialAddress][street]') as string,
          suburb: formData.get('personalInfo[residentialAddress][suburb]') as string,
        },
        postalAddress: {
          address: formData.get('personalInfo[postalAddress][address]') as string,
          town: formData.get('personalInfo[postalAddress][town]') as string,
          province: formData.get('personalInfo[postalAddress][province]') as string,
        },
        placeOfBirth: {
          village: formData.get('personalInfo[placeOfBirth][village]') as string,
          province: formData.get('personalInfo[placeOfBirth][province]') as string,
          town: formData.get('personalInfo[placeOfBirth][town]') as string,
          country: formData.get('personalInfo[placeOfBirth][country]') as string,
        },
        phoneDay: formData.get('personalInfo[phoneDay]') as string,
      }
      
      console.log('API: Extracted personalInfo:', personalInfo)

      declarations = {
        informationAccurate: formData.get('declarations[informationAccurate]') === 'true',
        understandPenalties: formData.get('declarations[understandPenalties]') === 'true',
      }
    }

    // Validate required fields based on service type
    if (serviceType === 'learners-permit') {
      if (!personalInfo.fullName || !personalInfo.dateOfBirth || !personalInfo.nationalId || 
          !personalInfo.email || !personalInfo.phoneNumber) {
        console.log('Missing personal info:', personalInfo)
        return NextResponse.json(
          { error: 'Missing required personal information' },
          { status: 400 }
        )
      }

      if (!declarations.termsAccepted || !declarations.informationAccurate || !declarations.medicalFitness) {
        console.log('Missing declarations:', declarations)
        return NextResponse.json(
          { error: 'All declarations must be accepted' },
          { status: 400 }
        )
      }
    } else if (serviceType === 'drivers-license') {
      if (!personalInfo.surname || !personalInfo.givenNames || !personalInfo.dateOfBirth || 
          !personalInfo.phoneNumber || !personalInfo.gender) {
        console.log('Missing personal info:', personalInfo)
        return NextResponse.json(
          { error: 'Missing required personal information' },
          { status: 400 }
        )
      }

      if (!declarations.informationAccurate || !declarations.understandPenalties) {
        console.log('Missing declarations:', declarations)
        return NextResponse.json(
          { error: 'All declarations must be accepted' },
          { status: 400 }
        )
      }
    }

    // Get user ID from authenticated user
    const userId = formData.get('userId') as string
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required. Please log in to submit applications.' },
        { status: 401 }
      )
    }
    
    // Get user from database
    const { userService } = await import('@/lib/database')
    const { data: user, error: userError } = await userService.getUserById(userId)
    
    if (userError || !user) {
      console.log('User lookup failed:', { userError, userId })
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 404 }
      )
    }

    console.log('API: Found user for application:', { id: user.id, email: user.email, name: user.name })
    console.log('API: Application will be created with user_id:', user.id)

    const applicationId = uuidv4()
    const documents: { [key: string]: string } = {}

    // Handle file uploads based on service type
    let documentFields: string[] = []
    let requiredDocs: string[] = []
    let uploadDirectory = ''
    
    if (serviceType === 'learners-permit') {
      documentFields = ['nationalIdCopy', 'birthCertificate', 'medicalCertificate', 'passportPhoto', 'eyeTestCertificate', 'parentalConsent']
      requiredDocs = ['nationalIdCopy', 'birthCertificate', 'medicalCertificate', 'passportPhoto', 'eyeTestCertificate']
      uploadDirectory = 'learners-permit'
    } else if (serviceType === 'drivers-license') {
      documentFields = ['nationalIdCopy', 'birthCertificate', 'medicalCertificate', 'passportPhoto', 'eyeTestCertificate', 'proofOfAddress', 'witnessIdCopy', 'previousLicenseCopy', 'foreignLicenseCopy']
      requiredDocs = ['nationalIdCopy', 'birthCertificate', 'medicalCertificate', 'passportPhoto', 'eyeTestCertificate', 'proofOfAddress', 'witnessIdCopy']
      uploadDirectory = 'drivers-license'
      
      // Add conditionally required documents
      if (formData.get('previousLicense[oldLicenseNumber]')) {
        requiredDocs.push('previousLicenseCopy')
      }
      // Foreign license copy only required for non-PNG citizens who have a foreign license
      if (formData.get('foreignLicense[hasForeignLicense]') === 'true' && 
          formData.get('personalInfo[nationality]') !== 'Papua New Guinea') {
        requiredDocs.push('foreignLicenseCopy')
      }
    }

    for (const field of documentFields) {
      const file = formData.get(field) as File | null
      if (file && file.size > 0) {
        // Generate unique filename
        const extension = file.name.split('.').pop()
        const filename = `${applicationId}-${field}-${Date.now()}.${extension}`
        
        try {
          const fileUrl = await saveUploadedFile(file, uploadDirectory, filename)
          documents[field] = fileUrl
        } catch (error) {
          console.error(`Error saving file ${field}:`, error)
          return NextResponse.json(
            { error: `Failed to upload ${field}` },
            { status: 500 }
          )
        }
      }
    }

    // Validate required documents
    const missingDocs = requiredDocs.filter(doc => !documents[doc])
    
    if (missingDocs.length > 0) {
      return NextResponse.json(
        { error: `Missing required documents: ${missingDocs.join(', ')}` },
        { status: 400 }
      )
    }

    const referenceNumber = generateReferenceNumber(serviceType)
    
    // Prepare application data
    const serviceName = serviceType === 'learners-permit' ? 'Learner\'s Permit Application' : 'Driver\'s License Application'
    
    let additionalData: any = {}
    if (serviceType === 'drivers-license') {
      additionalData = {
        licenseType: formData.get('licenseType'),
        licenseClass: formData.get('licenseClass'), 
        licensePeriod: formData.get('licensePeriod'),
        previousLicense: {
          oldLicenseNumber: formData.get('previousLicense[oldLicenseNumber]'),
          dateOfIssue: formData.get('previousLicense[dateOfIssue]'),
          placeOfIssue: formData.get('previousLicense[placeOfIssue]')
        },
        foreignLicense: {
          hasForeignLicense: formData.get('foreignLicense[hasForeignLicense]') === 'true',
          countryOfIssue: formData.get('foreignLicense[countryOfIssue]'),
          licenseNumber: formData.get('foreignLicense[licenseNumber]'),
          dateOfExpiry: formData.get('foreignLicense[dateOfExpiry]'),
          equivalentPNGClass: formData.get('foreignLicense[equivalentPNGClass]')
        },
        healthAndHistory: {
          healthAffectsDriving: formData.get('healthAndHistory[healthAffectsDriving]') === 'true',
          refusedLicense: formData.get('healthAndHistory[refusedLicense]') === 'true',
          licensesCancelledSuspended: formData.get('healthAndHistory[licensesCancelledSuspended]') === 'true',
          convictedDrinkDriving: formData.get('healthAndHistory[convictedDrinkDriving]') === 'true',
          convictedTrafficOffence: formData.get('healthAndHistory[convictedTrafficOffence]') === 'true',
          healthAffectsDrivingDetails: formData.get('healthAndHistory[healthAffectsDrivingDetails]'),
          refusedLicenseDetails: formData.get('healthAndHistory[refusedLicenseDetails]'),
          licensesCancelledSuspendedDetails: formData.get('healthAndHistory[licensesCancelledSuspendedDetails]'),
          convictedDrinkDrivingDetails: formData.get('healthAndHistory[convictedDrinkDrivingDetails]'),
          convictedTrafficOffenceDetails: formData.get('healthAndHistory[convictedTrafficOffenceDetails]')
        },
        witness: {
          name: formData.get('witness[name]'),
          address: formData.get('witness[address]')
        }
      }
    }
    
    const applicationData = {
      user_id: user.id,
      service_name: serviceName,
      status: 'pending' as const,
      application_data: {
        serviceType,
        personalInfo,
        documents,
        declarations,
        ...additionalData,
        submittedAt: new Date().toISOString(),
        processingFee: serviceType === 'drivers-license' ? 300.00 : 200.00,
        estimatedProcessingTime: serviceType === 'drivers-license' ? '4-6 weeks' : '3-4 weeks',
        requirements: [
          'National ID Copy',
          'Birth Certificate', 
          'Medical Certificate',
          'Passport Photo',
          'Eye Test Certificate'
        ]
      },
      reference_number: referenceNumber
    }

    // Save application to database
    console.log('API: About to create application with data:', {
      user_id: applicationData.user_id,
      service_name: applicationData.service_name,
      status: applicationData.status,
      reference_number: applicationData.reference_number
    })
    
    const { data, error } = await applicationService.createApplication(applicationData)

    if (error) {
      console.error('API: Error creating application:', error)
      return NextResponse.json(
        { error: 'Failed to submit application' },
        { status: 500 }
      )
    }

    console.log('API: Application created successfully:', {
      id: data.id,
      user_id: data.user_id,
      service_name: data.service_name,
      reference_number: data.reference_number
    })

    return NextResponse.json({
      message: 'Application submitted successfully',
      referenceNumber: referenceNumber,
      applicationId: data.id,
      data
    }, { status: 201 })

  } catch (error) {
    console.error('Application submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user applications (this would typically be filtered by authenticated user)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data, error } = await applicationService.getUserApplications(userId)

    if (error) {
      console.error('Error fetching applications:', error)
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      applications: data || []
    }, { status: 200 })

  } catch (error) {
    console.error('Applications fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
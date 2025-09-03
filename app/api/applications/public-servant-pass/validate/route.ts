import { NextRequest, NextResponse } from 'next/server'

// Mock government employee database for validation
// In production, this would integrate with the actual HR systems
const mockGovEmployeeDB = {
  'PS-FINANCE-2023-0001': {
    firstName: 'John',
    lastName: 'Doe',
    department: 'Ministry of Finance',
    position: 'Senior Policy Analyst',
    workEmail: 'john.doe@finance.gov.pg',
    isActive: true,
    employmentStartDate: '2020-03-15',
    securityClearance: 'confidential'
  },
  'PS-HEALTH-2022-0045': {
    firstName: 'Mary',
    lastName: 'Smith',
    department: 'Department of Health',
    position: 'Health Program Manager',
    workEmail: 'mary.smith@health.gov.pg',
    isActive: true,
    employmentStartDate: '2019-08-01',
    securityClearance: 'basic'
  },
  'PS-EDUC-2021-0123': {
    firstName: 'Peter',
    lastName: 'Johnson',
    department: 'Department of Education',
    position: 'Education Coordinator',
    workEmail: 'peter.johnson@education.gov.pg',
    isActive: false, // Inactive employee
    employmentStartDate: '2018-02-10',
    securityClearance: 'basic'
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicServantId, workEmail, firstName, lastName } = body

    if (!publicServantId) {
      return NextResponse.json(
        { error: 'Public Servant ID is required' },
        { status: 400 }
      )
    }

    // Validate Public Servant ID format
    const psIdPattern = /^PS-[A-Z]{2,6}-\d{4}-\d{4}$/
    if (!psIdPattern.test(publicServantId)) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid Public Servant ID format. Expected format: PS-DEPT-YYYY-NNNN'
      })
    }

    // In production, this would be a call to the actual government HR API
    // For now, we'll use mock data for demonstration
    const employeeRecord = mockGovEmployeeDB[publicServantId as keyof typeof mockGovEmployeeDB]

    if (!employeeRecord) {
      return NextResponse.json({
        valid: false,
        error: 'Public Servant ID not found in government records',
        suggestions: [
          'Verify your Public Servant ID is correct',
          'Contact your HR department to confirm your ID format',
          'Ensure you are using the current format (PS-DEPT-YYYY-NNNN)'
        ]
      })
    }

    // Check if employee is active
    if (!employeeRecord.isActive) {
      return NextResponse.json({
        valid: false,
        error: 'Employee record shows inactive status',
        details: 'Only active government employees are eligible for Public Servant Pass registration'
      })
    }

    // Validate work email matches
    if (workEmail && workEmail.toLowerCase() !== employeeRecord.workEmail.toLowerCase()) {
      return NextResponse.json({
        valid: false,
        error: 'Work email does not match government records',
        expectedEmail: employeeRecord.workEmail
      })
    }

    // Validate name matches (if provided)
    let nameValidation = { firstNameMatch: true, lastNameMatch: true }
    if (firstName && firstName.toLowerCase() !== employeeRecord.firstName.toLowerCase()) {
      nameValidation.firstNameMatch = false
    }
    if (lastName && lastName.toLowerCase() !== employeeRecord.lastName.toLowerCase()) {
      nameValidation.lastNameMatch = false
    }

    if (!nameValidation.firstNameMatch || !nameValidation.lastNameMatch) {
      return NextResponse.json({
        valid: false,
        error: 'Name does not match government records',
        details: 'The provided name does not match our employee database',
        nameValidation
      })
    }

    // Return successful validation with employee details
    return NextResponse.json({
      valid: true,
      employee: {
        publicServantId,
        firstName: employeeRecord.firstName,
        lastName: employeeRecord.lastName,
        department: employeeRecord.department,
        position: employeeRecord.position,
        workEmail: employeeRecord.workEmail,
        employmentStartDate: employeeRecord.employmentStartDate,
        currentSecurityClearance: employeeRecord.securityClearance,
        yearsOfService: Math.floor((Date.now() - new Date(employeeRecord.employmentStartDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      },
      validationStatus: {
        employeeFound: true,
        activeStatus: true,
        emailMatch: true,
        nameMatch: true
      },
      eligibility: {
        eligible: true,
        canApplyForClearance: employeeRecord.securityClearance === 'basic',
        backgroundCheckRequired: employeeRecord.securityClearance !== 'basic'
      }
    })

  } catch (error) {
    console.error('Employee validation error:', error)
    return NextResponse.json(
      { error: 'Internal server error during validation' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Return available departments and their codes for the dropdown
  const departments = [
    { code: 'FINANCE', name: 'Ministry of Finance', fullName: 'Ministry of Finance and Treasury' },
    { code: 'HEALTH', name: 'Department of Health', fullName: 'Department of Health' },
    { code: 'EDUC', name: 'Department of Education', fullName: 'Department of Education' },
    { code: 'POLICE', name: 'Royal PNG Constabulary', fullName: 'Royal Papua New Guinea Constabulary' },
    { code: 'DFAT', name: 'Department of Foreign Affairs', fullName: 'Department of Foreign Affairs and Trade' },
    { code: 'DEFENSE', name: 'PNG Defence Force', fullName: 'Papua New Guinea Defence Force' },
    { code: 'JUSTICE', name: 'Department of Justice', fullName: 'Department of Justice and Attorney General' },
    { code: 'WORKS', name: 'Department of Works', fullName: 'Department of Works and Implementation' },
    { code: 'LANDS', name: 'Department of Lands', fullName: 'Department of Lands and Physical Planning' },
    { code: 'COMM', name: 'Department of Commerce', fullName: 'Department of Commerce and Industry' },
    { code: 'AGRI', name: 'Department of Agriculture', fullName: 'Department of Agriculture and Livestock' },
    { code: 'ENV', name: 'Department of Environment', fullName: 'Department of Environment and Conservation' },
    { code: 'ENERGY', name: 'Department of Petroleum', fullName: 'Department of Petroleum and Energy' },
    { code: 'TRANS', name: 'Department of Transport', fullName: 'Department of Transport and Infrastructure' },
    { code: 'COMMS', name: 'Department of Communications', fullName: 'Department of Communications and Information Technology' }
  ]

  return NextResponse.json({
    departments,
    validation: {
      idFormat: 'PS-{DEPT_CODE}-{YEAR}-{NUMBER}',
      example: 'PS-FINANCE-2023-0001',
      emailDomains: [
        'gov.pg',
        'parliament.gov.pg',
        'treasury.gov.pg',
        'finance.gov.pg',
        'health.gov.pg',
        'education.gov.pg',
        'police.gov.pg',
        'dfat.gov.pg',
        'defense.gov.pg',
        'justice.gov.pg'
      ]
    }
  })
}
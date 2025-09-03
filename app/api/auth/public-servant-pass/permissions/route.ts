import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, recordAuthAttempt, logSecurityEvent } from '@/lib/digital-id-security'

export async function GET(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const authHeader = request.headers.get('authorization')
  
  try {
    // Rate limiting check
    const rateCheck = checkRateLimit(ip, 'public_servant_pass_permissions')
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many permission requests. Please try again later.' },
        { status: 429 }
      )
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Get permissions from Public Servant Pass G2G service
    const permissionsResponse = await fetch(`${process.env.PUBLIC_SERVANT_PASS_API_URL}/auth/g2g/permissions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Client-ID': process.env.PUBLIC_SERVANT_PASS_CLIENT_ID || '',
      }
    })

    if (!permissionsResponse.ok) {
      logSecurityEvent({
        type: 'auth_failure',
        ip,
        provider: 'public_servant_pass',
        details: { error: 'Permissions fetch failed' }
      })
      
      if (permissionsResponse.status === 401) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch permissions' },
        { status: 400 }
      )
    }

    const permissionsData = await permissionsResponse.json()

    // Log successful permissions access
    logSecurityEvent({
      type: 'auth_success',
      ip,
      provider: 'public_servant_pass',
      details: { action: 'permissions_access', services_count: permissionsData.services?.length || 0 }
    })

    return NextResponse.json({
      services: permissionsData.services || [],
      security_clearance: permissionsData.security_clearance,
      department_access: permissionsData.department_access || [],
      g2g_services: permissionsData.g2g_services || [],
      inter_agency_access: permissionsData.inter_agency_access || []
    })

  } catch (error) {
    logSecurityEvent({
      type: 'auth_failure',
      ip,
      provider: 'public_servant_pass',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })

    console.error('Public Servant Pass permissions error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error while fetching permissions' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, recordAuthAttempt, logSecurityEvent } from '@/lib/digital-id-security'

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  try {
    // Rate limiting check
    const rateCheck = checkRateLimit(ip, 'public_servant_pass_verify')
    if (!rateCheck.allowed) {
      recordAuthAttempt(ip, 'public_servant_pass_verify', false)
      
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      recordAuthAttempt(ip, 'public_servant_pass_verify', false)
      return NextResponse.json(
        { error: 'Missing token parameter' },
        { status: 400 }
      )
    }

    // Verify token with Public Servant Pass G2G service
    const verifyResponse = await fetch(`${process.env.PUBLIC_SERVANT_PASS_API_URL}/auth/g2g/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-ID': process.env.PUBLIC_SERVANT_PASS_CLIENT_ID || '',
      },
      body: JSON.stringify({ token })
    })

    if (!verifyResponse.ok) {
      recordAuthAttempt(ip, 'public_servant_pass_verify', false)
      logSecurityEvent({
        type: 'auth_failure',
        ip,
        provider: 'public_servant_pass',
        details: { error: 'Token verification failed' }
      })
      
      if (verifyResponse.status === 401) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { error: 'Token verification failed' },
        { status: 400 }
      )
    }

    const userData = await verifyResponse.json()

    // Validate employment status
    if (userData.employment_status !== 'active') {
      recordAuthAttempt(ip, 'public_servant_pass_verify', false)
      logSecurityEvent({
        type: 'auth_failure',
        ip,
        provider: 'public_servant_pass',
        details: { error: 'Inactive employment status', status: userData.employment_status }
      })
      
      return NextResponse.json(
        { error: 'Access denied: Employment status is not active' },
        { status: 403 }
      )
    }

    // Record successful verification
    recordAuthAttempt(ip, 'public_servant_pass_verify', true)
    logSecurityEvent({
      type: 'auth_success',
      ip,
      provider: 'public_servant_pass',
      userId: userData.id,
      details: { action: 'token_verification' }
    })

    return NextResponse.json({
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        employee_id: userData.employee_id,
        department: userData.department,
        position: userData.position,
        security_clearance: userData.security_clearance,
        photo_url: userData.photo_url,
        role: userData.role || 'user',
        verification_level: userData.verification_level || 'verified',
        government_services_access: userData.government_services_access || [],
        last_verified: userData.last_verified,
        employment_status: userData.employment_status
      }
    })

  } catch (error) {
    recordAuthAttempt(ip, 'public_servant_pass_verify', false)
    logSecurityEvent({
      type: 'auth_failure',
      ip,
      provider: 'public_servant_pass',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })

    console.error('Public Servant Pass token verification error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error during verification' },
      { status: 500 }
    )
  }
}
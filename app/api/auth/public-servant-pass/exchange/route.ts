import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, recordAuthAttempt, logSecurityEvent } from '@/lib/digital-id-security'

export async function POST(request: NextRequest) {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  
  try {
    // Rate limiting check
    const rateCheck = checkRateLimit(ip, 'public_servant_pass')
    if (!rateCheck.allowed) {
      recordAuthAttempt(ip, 'public_servant_pass', false)
      logSecurityEvent({
        type: 'rate_limit',
        ip,
        provider: 'public_servant_pass'
      })
      
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { code, state, grant_type } = body

    if (!code || !grant_type) {
      recordAuthAttempt(ip, 'public_servant_pass', false)
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (grant_type !== 'authorization_code') {
      recordAuthAttempt(ip, 'public_servant_pass', false)
      return NextResponse.json(
        { error: 'Invalid grant type' },
        { status: 400 }
      )
    }

    // Exchange code with Public Servant Pass G2G service
    const tokenResponse = await fetch(`${process.env.PUBLIC_SERVANT_PASS_API_URL}/auth/g2g/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PUBLIC_SERVANT_PASS_API_KEY}`,
        'X-Client-ID': process.env.PUBLIC_SERVANT_PASS_CLIENT_ID || '',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        state,
        client_id: process.env.PUBLIC_SERVANT_PASS_CLIENT_ID,
        client_secret: process.env.PUBLIC_SERVANT_PASS_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/auth/public-servant-pass/callback`
      })
    })

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      recordAuthAttempt(ip, 'public_servant_pass', false)
      logSecurityEvent({
        type: 'auth_failure',
        ip,
        provider: 'public_servant_pass',
        details: { error: 'Token exchange failed', response: error }
      })
      
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()

    // Get user information using the access token
    const userResponse = await fetch(`${process.env.PUBLIC_SERVANT_PASS_API_URL}/auth/g2g/user`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'X-Client-ID': process.env.PUBLIC_SERVANT_PASS_CLIENT_ID || '',
      }
    })

    if (!userResponse.ok) {
      recordAuthAttempt(ip, 'public_servant_pass', false)
      logSecurityEvent({
        type: 'auth_failure',
        ip,
        provider: 'public_servant_pass',
        details: { error: 'User info fetch failed' }
      })
      
      return NextResponse.json(
        { error: 'Failed to fetch user information' },
        { status: 400 }
      )
    }

    const userData = await userResponse.json()

    // Validate user data and employment status
    if (!userData.employee_id || userData.employment_status !== 'active') {
      recordAuthAttempt(ip, 'public_servant_pass', false)
      logSecurityEvent({
        type: 'auth_failure',
        ip,
        provider: 'public_servant_pass',
        details: { error: 'Invalid employment status', status: userData.employment_status }
      })
      
      return NextResponse.json(
        { error: 'Access denied: Invalid employment status' },
        { status: 403 }
      )
    }

    // Validate security clearance if required
    if (process.env.MINIMUM_SECURITY_CLEARANCE) {
      const clearanceLevels = ['basic', 'confidential', 'secret', 'top_secret']
      const requiredLevel = clearanceLevels.indexOf(process.env.MINIMUM_SECURITY_CLEARANCE)
      const userLevel = clearanceLevels.indexOf(userData.security_clearance)
      
      if (userLevel < requiredLevel) {
        recordAuthAttempt(ip, 'public_servant_pass', false)
        logSecurityEvent({
          type: 'auth_failure',
          ip,
          provider: 'public_servant_pass',
          details: { error: 'Insufficient security clearance', clearance: userData.security_clearance }
        })
        
        return NextResponse.json(
          { error: 'Access denied: Insufficient security clearance' },
          { status: 403 }
        )
      }
    }

    // Record successful authentication
    recordAuthAttempt(ip, 'public_servant_pass', true)
    logSecurityEvent({
      type: 'auth_success',
      ip,
      provider: 'public_servant_pass',
      userId: userData.id,
      details: { department: userData.department, security_clearance: userData.security_clearance }
    })

    return NextResponse.json({
      access_token: tokenData.access_token,
      expires_at: tokenData.expires_at,
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
    recordAuthAttempt(ip, 'public_servant_pass', false)
    logSecurityEvent({
      type: 'auth_failure',
      ip,
      provider: 'public_servant_pass',
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    })

    console.error('Public Servant Pass token exchange error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error during authentication' },
      { status: 500 }
    )
  }
}
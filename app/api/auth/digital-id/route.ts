import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/lib/database'
import { 
  checkRateLimit, 
  recordAuthAttempt, 
  validateTokenFormat, 
  sanitizeUserData, 
  logSecurityEvent,
  detectSuspiciousActivity 
} from '@/lib/digital-id-security'

// Digital ID Authentication Endpoint
export async function POST(request: NextRequest) {
  const clientIp = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  try {
    const { token, provider } = await request.json()

    if (!token || !provider) {
      logSecurityEvent({
        type: 'auth_failure',
        ip: clientIp,
        details: { reason: 'missing_token_or_provider' }
      })
      return NextResponse.json(
        { error: 'Digital ID token and provider are required' },
        { status: 400 }
      )
    }

    // Security: Rate limiting
    const rateLimitCheck = checkRateLimit(clientIp, provider)
    if (!rateLimitCheck.allowed) {
      logSecurityEvent({
        type: 'rate_limit',
        ip: clientIp,
        provider,
        details: { resetTime: rateLimitCheck.resetTime }
      })
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Security: Token format validation
    const tokenValidation = validateTokenFormat(provider, token)
    if (!tokenValidation.valid) {
      recordAuthAttempt(clientIp, provider, false)
      logSecurityEvent({
        type: 'auth_failure',
        ip: clientIp,
        provider,
        details: { reason: 'invalid_token_format', error: tokenValidation.error }
      })
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      )
    }

    console.log(`Digital ID login attempt with provider: ${provider} from IP: ${clientIp}`)

    // Step 1: Verify digital ID token with the provider
    const verificationResult = await verifyDigitalIdToken(provider, token)
    
    if (!verificationResult.valid) {
      recordAuthAttempt(clientIp, provider, false)
      logSecurityEvent({
        type: 'auth_failure',
        ip: clientIp,
        provider,
        details: { reason: 'token_verification_failed', error: verificationResult.error }
      })
      return NextResponse.json(
        { error: 'Invalid digital ID token' },
        { status: 401 }
      )
    }

    // Security: Sanitize user data from provider
    const digitalIdData = sanitizeUserData(verificationResult.userData, provider)
    
    // Security: Detect suspicious activity
    if (detectSuspiciousActivity(clientIp, provider, digitalIdData)) {
      recordAuthAttempt(clientIp, provider, false)
      return NextResponse.json(
        { error: 'Authentication request flagged for review' },
        { status: 403 }
      )
    }
    
    // Step 2: Find or create user based on digital ID
    let dbUser = await findOrCreateUserFromDigitalId(digitalIdData, provider)
    
    if (!dbUser) {
      recordAuthAttempt(clientIp, provider, false)
      logSecurityEvent({
        type: 'auth_failure',
        ip: clientIp,
        provider,
        details: { reason: 'user_creation_failed' }
      })
      return NextResponse.json(
        { error: 'Failed to create or find user account' },
        { status: 500 }
      )
    }

    // Success: Record successful authentication
    recordAuthAttempt(clientIp, provider, true)
    logSecurityEvent({
      type: 'auth_success',
      ip: clientIp,
      provider,
      userId: dbUser.id
    })

    // Step 3: Return user data for frontend authentication
    return NextResponse.json({
      success: true,
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        national_id: dbUser.national_id,
        phone: dbUser.phone,
        photo_url: dbUser.photo_url,
        provider: provider
      }
    })

  } catch (error) {
    console.error('Digital ID authentication error:', error)
    logSecurityEvent({
      type: 'auth_failure',
      ip: clientIp,
      details: { reason: 'internal_error', error: String(error) }
    })
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}

// Verify digital ID token with external provider
async function verifyDigitalIdToken(provider: string, token: string) {
  switch (provider) {
    case 'png_digital_id':
      return await verifyPNGDigitalId(token)
    case 'facebook':
      return await verifyFacebookToken(token)
    case 'google':
      return await verifyGoogleToken(token)
    case 'microsoft':
      return await verifyMicrosoftToken(token)
    default:
      throw new Error(`Unsupported provider: ${provider}`)
  }
}

// PNG Digital ID verification (example implementation)
async function verifyPNGDigitalId(token: string) {
  try {
    // Replace with actual PNG Digital ID API endpoint
    const response = await fetch(`${process.env.PNG_DIGITAL_ID_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PNG_DIGITAL_ID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    })

    if (!response.ok) {
      return { valid: false, error: 'Token verification failed' }
    }

    const data = await response.json()
    
    return {
      valid: true,
      userData: {
        nationalId: data.national_id,
        name: data.full_name,
        email: data.email,
        phone: data.phone,
        photoUrl: data.photo_url,
        dateOfBirth: data.date_of_birth,
        address: data.address
      }
    }
  } catch (error) {
    console.error('PNG Digital ID verification error:', error)
    return { valid: false, error: 'Verification service unavailable' }
  }
}

// Google OAuth token verification
async function verifyGoogleToken(token: string) {
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`)
    
    if (!response.ok) {
      return { valid: false, error: 'Invalid Google token' }
    }

    const data = await response.json()
    
    // Get user profile
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    const profile = await profileResponse.json()

    return {
      valid: true,
      userData: {
        nationalId: '', // Will need to be provided separately or linked later
        name: profile.name,
        email: profile.email,
        phone: '',
        photoUrl: profile.picture
      }
    }
  } catch (error) {
    console.error('Google token verification error:', error)
    return { valid: false, error: 'Google verification failed' }
  }
}

// Facebook token verification
async function verifyFacebookToken(token: string) {
  try {
    const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`)
    
    if (!response.ok) {
      return { valid: false, error: 'Invalid Facebook token' }
    }

    const data = await response.json()

    return {
      valid: true,
      userData: {
        nationalId: '', // Will need to be provided separately
        name: data.name,
        email: data.email || '',
        phone: '',
        photoUrl: data.picture?.data?.url
      }
    }
  } catch (error) {
    console.error('Facebook token verification error:', error)
    return { valid: false, error: 'Facebook verification failed' }
  }
}

// Microsoft token verification
async function verifyMicrosoftToken(token: string) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      return { valid: false, error: 'Invalid Microsoft token' }
    }

    const data = await response.json()

    return {
      valid: true,
      userData: {
        nationalId: '',
        name: data.displayName,
        email: data.mail || data.userPrincipalName,
        phone: data.mobilePhone || '',
        photoUrl: data.photo?.webUrl
      }
    }
  } catch (error) {
    console.error('Microsoft token verification error:', error)
    return { valid: false, error: 'Microsoft verification failed' }
  }
}

// Find existing user or create new one from digital ID data
async function findOrCreateUserFromDigitalId(digitalIdData: any, provider: string) {
  try {
    // First try to find existing user by email
    if (digitalIdData.email) {
      const { data: existingUser } = await userService.getUserByEmail(digitalIdData.email)
      if (existingUser) {
        // Update user with digital ID info if missing
        const updates: any = {}
        if (!existingUser.photo_url && digitalIdData.photoUrl) {
          updates.photo_url = digitalIdData.photoUrl
        }
        if (!existingUser.national_id && digitalIdData.nationalId) {
          updates.national_id = digitalIdData.nationalId
        }
        
        if (Object.keys(updates).length > 0) {
          await userService.updateUser(existingUser.id, updates)
        }
        
        return existingUser
      }
    }

    // Try to find by national ID if available
    if (digitalIdData.nationalId) {
      // This would require adding a method to find by national_id
      // For now, we'll create a new user
    }

    // Create new user from digital ID data
    const newUserData = {
      email: digitalIdData.email || `${provider}_${Date.now()}@temp.local`,
      name: digitalIdData.name || 'Digital ID User',
      national_id: digitalIdData.nationalId || '',
      phone: digitalIdData.phone || '',
      photo_url: digitalIdData.photoUrl || '',
      role: 'user' as const,
      email_verified: true, // Digital ID is pre-verified
      email_verified_at: new Date().toISOString()
    }

    const { data: newUser, error } = await userService.createUser(newUserData)
    
    if (error) {
      console.error('Failed to create user from digital ID:', error)
      return null
    }

    return newUser
  } catch (error) {
    console.error('Error finding/creating user from digital ID:', error)
    return null
  }
}
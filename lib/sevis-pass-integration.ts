// SEVIS Pass Digital ID Integration
// Integration with https://sevispass.netlify.app/

export interface SevisPassUser {
  id: string
  email: string
  name: string
  national_id?: string
  phone?: string
  photo_url?: string
  role?: 'user' | 'admin'
  verification_level: 'basic' | 'verified' | 'premium'
  services_access: string[]
  last_verified: string
}

export interface SevisPassAuthResponse {
  success: boolean
  user?: SevisPassUser
  token?: string
  error?: string
  expires_at?: string
}

/**
 * Initiate SEVIS Pass authentication flow
 * This opens a popup window for SEVIS Pass authentication
 */
export async function initiateSevisPassAuth(config?: {
  redirect_uri?: string
  scope?: string[]
  state?: string
}): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('SEVIS Pass authentication not available in server environment'))
      return
    }

    const baseUrl = 'https://sevispass.netlify.app'
    const clientId = process.env.NEXT_PUBLIC_SEVIS_PASS_CLIENT_ID
    
    if (!clientId) {
      reject(new Error('SEVIS Pass client ID not configured'))
      return
    }

    // Build OAuth-like authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: config?.redirect_uri || `${window.location.origin}/auth/sevis-pass/callback`,
      scope: config?.scope?.join(' ') || 'identity email profile government_services',
      state: config?.state || generateRandomState(),
      prompt: 'consent'
    })

    const authUrl = `${baseUrl}/auth/authorize?${params.toString()}`
    
    // Open popup window for authentication
    const popup = window.open(
      authUrl,
      'sevis-pass-auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      reject(new Error('Failed to open SEVIS Pass authentication popup'))
      return
    }

    // Listen for callback message
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== baseUrl) {
        return
      }

      if (event.data.type === 'SEVIS_PASS_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler)
        popup.close()
        resolve(event.data.code)
      } else if (event.data.type === 'SEVIS_PASS_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler)
        popup.close()
        reject(new Error(event.data.error || 'SEVIS Pass authentication failed'))
      }
    }

    window.addEventListener('message', messageHandler)

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
        reject(new Error('SEVIS Pass authentication was cancelled'))
      }
    }, 1000)
  })
}

/**
 * Exchange authorization code for access token and user data
 */
export async function exchangeSevisPassCode(code: string, state?: string): Promise<SevisPassAuthResponse> {
  try {
    const response = await fetch('/api/auth/sevis-pass/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        state,
        grant_type: 'authorization_code'
      })
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Failed to exchange authorization code'
      }
    }

    const data = await response.json()
    return {
      success: true,
      user: data.user,
      token: data.access_token,
      expires_at: data.expires_at
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during token exchange'
    }
  }
}

/**
 * Verify SEVIS Pass token and get user information
 */
export async function verifySevisPassToken(token: string): Promise<SevisPassAuthResponse> {
  try {
    const response = await fetch('/api/auth/sevis-pass/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    })

    if (!response.ok) {
      const error = await response.json()
      return {
        success: false,
        error: error.message || 'Token verification failed'
      }
    }

    const data = await response.json()
    return {
      success: true,
      user: data.user
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error during token verification'
    }
  }
}

/**
 * Get user's government services access permissions
 */
export async function getSevisPassPermissions(token: string): Promise<string[]> {
  try {
    const response = await fetch('/api/auth/sevis-pass/permissions', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch permissions')
    }

    const data = await response.json()
    return data.services || []
  } catch (error) {
    console.error('Error fetching SEVIS Pass permissions:', error)
    return []
  }
}

/**
 * Direct SEVIS Pass API integration (if available)
 */
export async function callSevisPassAPI(endpoint: string, token: string, options?: RequestInit): Promise<any> {
  const baseUrl = 'https://sevispass.netlify.app/api'
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    if (!response.ok) {
      throw new Error(`SEVIS Pass API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('SEVIS Pass API call failed:', error)
    throw error
  }
}

/**
 * Map SEVIS Pass user data to your application's user schema
 */
export function mapSevisPassUser(sevisUser: SevisPassUser) {
  return {
    email: sevisUser.email,
    name: sevisUser.name,
    national_id: sevisUser.national_id || '',
    phone: sevisUser.phone || '',
    photo_url: sevisUser.photo_url || '',
    role: 'user' as const,
    provider: 'sevis_pass',
    verification_level: sevisUser.verification_level,
    government_services_access: sevisUser.services_access,
    verified_at: sevisUser.last_verified
  }
}

/**
 * Generate random state parameter for OAuth security
 */
function generateRandomState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate SEVIS Pass callback parameters
 */
export function validateSevisPassCallback(params: URLSearchParams): {
  valid: boolean
  code?: string
  state?: string
  error?: string
} {
  const code = params.get('code')
  const state = params.get('state')
  const error = params.get('error')
  const errorDescription = params.get('error_description')

  if (error) {
    return {
      valid: false,
      error: errorDescription || error
    }
  }

  if (!code) {
    return {
      valid: false,
      error: 'No authorization code received'
    }
  }

  return {
    valid: true,
    code,
    state: state || undefined
  }
}

/**
 * SEVIS Pass service integration for accessing government services
 */
export class SevisPassServiceIntegration {
  private token: string
  
  constructor(token: string) {
    this.token = token
  }

  // Access G2C services (Government to Citizen)
  async accessCPFBoard() {
    return await callSevisPassAPI('/services/cpf', this.token)
  }

  async accessHDBServices() {
    return await callSevisPassAPI('/services/hdb', this.token)
  }

  async accessMOHServices() {
    return await callSevisPassAPI('/services/moh', this.token)
  }

  // Access G2B services (Government to Business)
  async accessIRASBusiness() {
    return await callSevisPassAPI('/services/iras', this.token)
  }

  async accessACRAServices() {
    return await callSevisPassAPI('/services/acra', this.token)
  }

  // Get user's service permissions
  async getAvailableServices() {
    return await getSevisPassPermissions(this.token)
  }
}
// Public Servant Pass G2G Integration
// Government-to-Government service for public servants authentication

export interface PublicServantPassUser {
  id: string
  email: string
  name: string
  employee_id: string
  department: string
  position: string
  security_clearance: 'basic' | 'confidential' | 'secret' | 'top_secret'
  photo_url?: string
  role?: 'user' | 'admin' | 'super_admin'
  verification_level: 'verified' | 'enhanced'
  government_services_access: string[]
  last_verified: string
  employment_status: 'active' | 'suspended' | 'terminated'
}

export interface PublicServantPassAuthResponse {
  success: boolean
  user?: PublicServantPassUser
  token?: string
  error?: string
  expires_at?: string
}

/**
 * Initiate Public Servant Pass G2G authentication flow
 * This opens a secure government authentication window
 */
export async function initiatePublicServantPassAuth(config?: {
  redirect_uri?: string
  scope?: string[]
  state?: string
}): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Public Servant Pass authentication not available in server environment'))
      return
    }

    const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_SERVANT_PASS_URL || 'https://gov-auth.png.gov.pg'
    const clientId = process.env.NEXT_PUBLIC_PUBLIC_SERVANT_PASS_CLIENT_ID
    
    if (!clientId) {
      reject(new Error('Public Servant Pass client ID not configured'))
      return
    }

    // Build G2G OAuth authorization URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: config?.redirect_uri || `${window.location.origin}/auth/public-servant-pass/callback`,
      scope: config?.scope?.join(' ') || 'identity email profile government_access department_info security_clearance',
      state: config?.state || generateRandomState(),
      prompt: 'consent',
      service_type: 'g2g'
    })

    const authUrl = `${baseUrl}/auth/g2g/authorize?${params.toString()}`
    
    // Open secure popup window for G2G authentication
    const popup = window.open(
      authUrl,
      'public-servant-pass-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    )

    if (!popup) {
      reject(new Error('Failed to open Public Servant Pass authentication popup'))
      return
    }

    // Listen for callback message
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== baseUrl) {
        return
      }

      if (event.data.type === 'PUBLIC_SERVANT_PASS_AUTH_SUCCESS') {
        window.removeEventListener('message', messageHandler)
        popup.close()
        resolve(event.data.code)
      } else if (event.data.type === 'PUBLIC_SERVANT_PASS_AUTH_ERROR') {
        window.removeEventListener('message', messageHandler)
        popup.close()
        reject(new Error(event.data.error || 'Public Servant Pass authentication failed'))
      }
    }

    window.addEventListener('message', messageHandler)

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageHandler)
        reject(new Error('Public Servant Pass authentication was cancelled'))
      }
    }, 1000)
  })
}

/**
 * Exchange G2G authorization code for access token and user data
 */
export async function exchangePublicServantPassCode(code: string, state?: string): Promise<PublicServantPassAuthResponse> {
  try {
    const response = await fetch('/api/auth/public-servant-pass/exchange', {
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
 * Verify Public Servant Pass token and get user information
 */
export async function verifyPublicServantPassToken(token: string): Promise<PublicServantPassAuthResponse> {
  try {
    const response = await fetch('/api/auth/public-servant-pass/verify', {
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
export async function getPublicServantPassPermissions(token: string): Promise<string[]> {
  try {
    const response = await fetch('/api/auth/public-servant-pass/permissions', {
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
    console.error('Error fetching Public Servant Pass permissions:', error)
    return []
  }
}

/**
 * Direct Public Servant Pass G2G API integration
 */
export async function callPublicServantPassAPI(endpoint: string, token: string, options?: RequestInit): Promise<any> {
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_SERVANT_PASS_URL || 'https://gov-auth.png.gov.pg/api'
  
  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Service-Type': 'g2g',
        ...options?.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Public Servant Pass API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Public Servant Pass API call failed:', error)
    throw error
  }
}

/**
 * Map Public Servant Pass user data to application's user schema
 */
export function mapPublicServantPassUser(publicServantUser: PublicServantPassUser) {
  return {
    email: publicServantUser.email,
    name: publicServantUser.name,
    employee_id: publicServantUser.employee_id,
    department: publicServantUser.department,
    position: publicServantUser.position,
    security_clearance: publicServantUser.security_clearance,
    photo_url: publicServantUser.photo_url || '',
    role: publicServantUser.role || 'user',
    provider: 'public_servant_pass',
    verification_level: publicServantUser.verification_level,
    government_services_access: publicServantUser.government_services_access,
    verified_at: publicServantUser.last_verified,
    employment_status: publicServantUser.employment_status
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
 * Validate Public Servant Pass callback parameters
 */
export function validatePublicServantPassCallback(params: URLSearchParams): {
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
 * Public Servant Pass G2G service integration for accessing government services
 */
export class PublicServantPassServiceIntegration {
  private token: string
  
  constructor(token: string) {
    this.token = token
  }

  // Access G2G services (Government to Government)
  async accessPersonnelManagement() {
    return await callPublicServantPassAPI('/services/g2g/personnel', this.token)
  }

  async accessPayrollServices() {
    return await callPublicServantPassAPI('/services/g2g/payroll', this.token)
  }

  async accessProcurementSystem() {
    return await callPublicServantPassAPI('/services/g2g/procurement', this.token)
  }

  async accessDocumentManagement() {
    return await callPublicServantPassAPI('/services/g2g/documents', this.token)
  }

  // Access departmental services
  async accessDepartmentalServices(department: string) {
    return await callPublicServantPassAPI(`/services/g2g/departments/${department}`, this.token)
  }

  // Security clearance specific services
  async accessClassifiedServices() {
    return await callPublicServantPassAPI('/services/g2g/classified', this.token)
  }

  // Inter-agency collaboration
  async accessInterAgencyServices() {
    return await callPublicServantPassAPI('/services/g2g/inter-agency', this.token)
  }

  // Get user's G2G service permissions
  async getAvailableG2GServices() {
    return await getPublicServantPassPermissions(this.token)
  }

  // Validate security clearance for specific service
  async validateSecurityClearance(serviceId: string, requiredLevel: string) {
    return await callPublicServantPassAPI('/services/g2g/security/validate', this.token, {
      method: 'POST',
      body: JSON.stringify({
        service_id: serviceId,
        required_clearance: requiredLevel
      })
    })
  }
}
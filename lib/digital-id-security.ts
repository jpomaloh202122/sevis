// Digital ID Security utilities and validation

interface AuthAttempt {
  ip: string
  timestamp: number
  provider: string
  success: boolean
}

// In-memory store for rate limiting (use Redis in production)
const authAttempts: Map<string, AuthAttempt[]> = new Map()

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 60 * 60 * 1000 // 1 hour
}

/**
 * Rate limiting for digital ID authentication attempts
 */
export function checkRateLimit(ip: string, provider: string): { allowed: boolean, remaining?: number, resetTime?: number } {
  const key = `${ip}:${provider}`
  const now = Date.now()
  const attempts = authAttempts.get(key) || []
  
  // Clean old attempts
  const validAttempts = attempts.filter(attempt => 
    now - attempt.timestamp < RATE_LIMIT_CONFIG.windowMs
  )
  
  // Check if blocked due to too many failed attempts
  const recentFailures = validAttempts.filter(attempt => !attempt.success)
  if (recentFailures.length >= RATE_LIMIT_CONFIG.maxAttempts) {
    const oldestFailure = recentFailures[0]
    const blockUntil = oldestFailure.timestamp + RATE_LIMIT_CONFIG.blockDurationMs
    
    if (now < blockUntil) {
      return {
        allowed: false,
        resetTime: blockUntil
      }
    }
  }
  
  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxAttempts - recentFailures.length
  }
}

/**
 * Record authentication attempt
 */
export function recordAuthAttempt(ip: string, provider: string, success: boolean) {
  const key = `${ip}:${provider}`
  const attempts = authAttempts.get(key) || []
  
  attempts.push({
    ip,
    timestamp: Date.now(),
    provider,
    success
  })
  
  // Keep only recent attempts
  const recentAttempts = attempts.filter(attempt => 
    Date.now() - attempt.timestamp < RATE_LIMIT_CONFIG.windowMs * 2
  )
  
  authAttempts.set(key, recentAttempts)
}

/**
 * Validate digital ID token format and basic structure
 */
export function validateTokenFormat(provider: string, token: string): { valid: boolean, error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Token must be a non-empty string' }
  }

  // Provider-specific token validation
  switch (provider) {
    case 'png_digital_id':
      // PNG Digital ID tokens should be JWTs
      if (!token.includes('.') || token.split('.').length !== 3) {
        return { valid: false, error: 'Invalid PNG Digital ID token format' }
      }
      break
      
    case 'google':
      // Google access tokens are typically longer alphanumeric strings
      if (token.length < 20 || !/^[a-zA-Z0-9._-]+$/.test(token)) {
        return { valid: false, error: 'Invalid Google token format' }
      }
      break
      
    case 'facebook':
      // Facebook tokens are alphanumeric with specific patterns
      if (!/^[A-Za-z0-9_-]{20,}$/.test(token)) {
        return { valid: false, error: 'Invalid Facebook token format' }
      }
      break
      
    case 'microsoft':
      // Microsoft tokens are typically JWTs or long strings
      if (token.length < 50) {
        return { valid: false, error: 'Invalid Microsoft token format' }
      }
      break
      
    default:
      return { valid: false, error: `Unsupported provider: ${provider}` }
  }
  
  return { valid: true }
}

/**
 * Sanitize user data from digital ID providers
 */
export function sanitizeUserData(rawData: any, provider: string) {
  const sanitized: any = {}
  
  // Common fields with sanitization
  if (rawData.name) {
    sanitized.name = String(rawData.name).trim().slice(0, 255)
  }
  
  if (rawData.email) {
    const email = String(rawData.email).toLowerCase().trim()
    if (isValidEmail(email)) {
      sanitized.email = email
    }
  }
  
  if (rawData.phone) {
    sanitized.phone = sanitizePhoneNumber(rawData.phone)
  }
  
  if (rawData.nationalId) {
    sanitized.nationalId = String(rawData.nationalId).trim().slice(0, 50)
  }
  
  if (rawData.photoUrl && isValidUrl(rawData.photoUrl)) {
    sanitized.photoUrl = rawData.photoUrl
  }
  
  // Provider-specific sanitization
  switch (provider) {
    case 'png_digital_id':
      if (rawData.address) {
        sanitized.address = String(rawData.address).trim().slice(0, 500)
      }
      if (rawData.dateOfBirth) {
        sanitized.dateOfBirth = sanitizeDateOfBirth(rawData.dateOfBirth)
      }
      break
  }
  
  return sanitized
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 320
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return ['http:', 'https:'].includes(parsedUrl.protocol)
  } catch {
    return false
  }
}

/**
 * Sanitize phone number
 */
function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // Ensure it starts with + or is a local number
  if (cleaned.startsWith('+')) {
    return cleaned.slice(0, 15) // International format max length
  } else {
    return cleaned.slice(0, 10) // Local format
  }
}

/**
 * Sanitize date of birth
 */
function sanitizeDateOfBirth(dob: string): string | null {
  try {
    const date = new Date(dob)
    if (isNaN(date.getTime())) {
      return null
    }
    
    // Check if date is reasonable (not in future, not too old)
    const now = new Date()
    const hundredYearsAgo = new Date()
    hundredYearsAgo.setFullYear(now.getFullYear() - 100)
    
    if (date > now || date < hundredYearsAgo) {
      return null
    }
    
    return date.toISOString().split('T')[0] // Return YYYY-MM-DD format
  } catch {
    return null
  }
}

/**
 * Generate secure session token
 */
export function generateSecureToken(): string {
  // Generate a random 32-byte token
  const bytes = new Uint8Array(32)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    // Fallback for Node.js environment
    const cryptoNode = require('crypto')
    const buffer = cryptoNode.randomBytes(32)
    bytes.set(buffer)
  }
  
  // Convert to base64url format
  return Buffer.from(bytes).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Log security events
 */
export function logSecurityEvent(event: {
  type: 'auth_attempt' | 'auth_success' | 'auth_failure' | 'rate_limit' | 'suspicious_activity'
  ip: string
  provider?: string
  userId?: string
  details?: any
}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ...event
  }
  
  // In production, send to security monitoring service
  console.log('[SECURITY]', JSON.stringify(logEntry))
  
  // You can integrate with services like:
  // - DataDog
  // - Sentry
  // - CloudWatch
  // - Custom security dashboard
}

/**
 * Detect suspicious patterns in authentication
 */
export function detectSuspiciousActivity(ip: string, provider: string, userData: any): boolean {
  // Check for rapid provider switching
  const userAttempts = authAttempts.get(`${ip}:*`) || []
  const recentProviders = new Set(
    userAttempts
      .filter(attempt => Date.now() - attempt.timestamp < 5 * 60 * 1000) // Last 5 minutes
      .map(attempt => attempt.provider)
  )
  
  if (recentProviders.size > 2) {
    logSecurityEvent({
      type: 'suspicious_activity',
      ip,
      provider,
      details: { reason: 'rapid_provider_switching', providers: Array.from(recentProviders) }
    })
    return true
  }
  
  // Check for missing essential data that should come from verified providers
  if (provider === 'png_digital_id' && (!userData.nationalId || !userData.name)) {
    logSecurityEvent({
      type: 'suspicious_activity',
      ip,
      provider,
      details: { reason: 'missing_essential_data', userData: Object.keys(userData) }
    })
    return true
  }
  
  return false
}
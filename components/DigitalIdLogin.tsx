'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  IdentificationIcon, 
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

interface DigitalIdLoginProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
}

export default function DigitalIdLogin({ onSuccess, onError, className = '' }: DigitalIdLoginProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const { loginWithUser } = useAuth()
  const router = useRouter()

  const handleDigitalIdLogin = async (provider: string) => {
    setIsLoading(provider)
    setError('')

    try {
      let token = ''
      
      // Get token based on provider
      switch (provider) {
        case 'png_digital_id':
          token = await getPNGDigitalIdToken()
          break
        case 'google':
          token = await getGoogleToken()
          break
        case 'facebook':
          token = await getFacebookToken()
          break
        case 'microsoft':
          token = await getMicrosoftToken()
          break
        default:
          throw new Error(`Unsupported provider: ${provider}`)
      }

      if (!token) {
        throw new Error('Failed to get authentication token')
      }

      // Authenticate with your backend
      const response = await fetch('/api/auth/digital-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          provider,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      // Login with the returned user data
      await loginWithUser(data.user)
      
      // Success callback
      onSuccess?.()
      
      // Redirect based on user role
      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Digital ID authentication failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(null)
    }
  }

  // PNG Digital ID integration
  const getPNGDigitalIdToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // This would integrate with PNG's Digital ID service
      // Example implementation:
      
      if (typeof window === 'undefined') {
        reject(new Error('Digital ID not available in server environment'))
        return
      }

      // Check if PNG Digital ID SDK is loaded
      const pngDigitalId = (window as any).PNGDigitalId
      
      if (!pngDigitalId) {
        reject(new Error('PNG Digital ID service not available. Please ensure the SDK is loaded.'))
        return
      }

      // Initialize PNG Digital ID authentication
      pngDigitalId.authenticate({
        onSuccess: (token: string) => resolve(token),
        onError: (error: any) => reject(new Error(`PNG Digital ID error: ${error.message}`)),
        scope: ['identity', 'email', 'phone']
      })
    })
  }

  // Google OAuth integration
  const getGoogleToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Sign-In not available in server environment'))
        return
      }

      const google = (window as any).google
      
      if (!google) {
        reject(new Error('Google Sign-In not loaded'))
        return
      }

      google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        callback: (response: any) => {
          if (response.access_token) {
            resolve(response.access_token)
          } else {
            reject(new Error('No access token received from Google'))
          }
        },
      }).requestAccessToken()
    })
  }

  // Facebook Login integration
  const getFacebookToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Facebook Login not available in server environment'))
        return
      }

      const FB = (window as any).FB
      
      if (!FB) {
        reject(new Error('Facebook SDK not loaded'))
        return
      }

      FB.login((response: any) => {
        if (response.authResponse) {
          resolve(response.authResponse.accessToken)
        } else {
          reject(new Error('Facebook login cancelled or failed'))
        }
      }, { scope: 'email,public_profile' })
    })
  }

  // Microsoft authentication
  const getMicrosoftToken = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Microsoft authentication not available in server environment'))
        return
      }

      // This would use Microsoft Authentication Library (MSAL)
      const msal = (window as any).msal
      
      if (!msal) {
        reject(new Error('Microsoft authentication library not loaded'))
        return
      }

      msal.acquireTokenPopup({
        scopes: ['openid', 'profile', 'email']
      }).then((response: any) => {
        resolve(response.accessToken)
      }).catch((error: any) => {
        reject(new Error(`Microsoft authentication failed: ${error.message}`))
      })
    })
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Login with Digital ID</h3>
        <p className="text-sm text-gray-600">Choose your preferred digital identity provider</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {/* PNG Digital ID */}
        <button
          onClick={() => handleDigitalIdLogin('png_digital_id')}
          disabled={isLoading !== null}
          className="flex items-center justify-center px-4 py-3 border border-png-red text-sm font-medium rounded-md text-png-red bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading === 'png_digital_id' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-png-red mr-3"></div>
          ) : (
            <IdentificationIcon className="h-5 w-5 mr-3" />
          )}
          PNG Digital ID
        </button>

        {/* Google */}
        <button
          onClick={() => handleDigitalIdLogin('google')}
          disabled={isLoading !== null}
          className="flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading === 'google' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
          ) : (
            <GlobeAltIcon className="h-5 w-5 mr-3" />
          )}
          Continue with Google
        </button>

        {/* Facebook */}
        <button
          onClick={() => handleDigitalIdLogin('facebook')}
          disabled={isLoading !== null}
          className="flex items-center justify-center px-4 py-3 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading === 'facebook' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
          ) : (
            <DevicePhoneMobileIcon className="h-5 w-5 mr-3" />
          )}
          Continue with Facebook
        </button>

        {/* Microsoft */}
        <button
          onClick={() => handleDigitalIdLogin('microsoft')}
          disabled={isLoading !== null}
          className="flex items-center justify-center px-4 py-3 border border-blue-500 text-sm font-medium rounded-md text-blue-500 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading === 'microsoft' ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-3"></div>
          ) : (
            <ShieldCheckIcon className="h-5 w-5 mr-3" />
          )}
          Continue with Microsoft
        </button>
      </div>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          By signing in with a digital ID, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  )
}
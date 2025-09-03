'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { IdentificationIcon, ShieldCheckIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import { initiateSevisPassAuth, exchangeSevisPassCode } from '@/lib/sevis-pass-integration'

interface SevisPassLoginProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  showServices?: boolean
}

export default function SevisPassLogin({ 
  onSuccess, 
  onError, 
  className = '',
  showServices = true 
}: SevisPassLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginWithUser } = useAuth()
  const router = useRouter()

  const handleSevisPassLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Step 1: Initiate SEVIS Pass authentication
      const authCode = await initiateSevisPassAuth({
        scope: ['identity', 'email', 'profile', 'government_services'],
        redirect_uri: `${window.location.origin}/auth/sevis-pass/callback`
      })

      // Step 2: Exchange code for user data
      const authResult = await exchangeSevisPassCode(authCode)

      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed')
      }

      // Step 3: Login with user data
      if (authResult.user) {
        await loginWithUser(authResult.user)
        
        // Success callback
        onSuccess?.()
        
        // Redirect based on user role
        if (authResult.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        throw new Error('No user data received from SEVIS Pass')
      }

    } catch (err: any) {
      const errorMessage = err.message || 'SEVIS Pass authentication failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SEVIS Pass Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <img 
            src="https://sevispass.netlify.app/favicon.ico" 
            alt="SEVIS Pass" 
            className="w-8 h-8 mr-3"
            onError={(e) => {
              // Fallback if favicon doesn't load
              e.currentTarget.style.display = 'none'
            }}
          />
          <h3 className="text-xl font-bold text-gray-900">SEVIS Pass</h3>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Secure Digital Identity for Papua New Guinea
        </p>
        <p className="text-xs text-gray-500">
          One secure identity, unlimited possibilities
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Main Login Button */}
      <button
        onClick={handleSevisPassLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-4 border-2 border-png-red text-lg font-semibold rounded-lg text-png-red bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-png-red mr-3"></div>
            Connecting to SEVIS Pass...
          </>
        ) : (
          <>
            <IdentificationIcon className="h-6 w-6 mr-3" />
            Login with SEVIS Pass
          </>
        )}
      </button>

      {/* Features */}
      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center text-sm text-gray-600">
          <ShieldCheckIcon className="h-4 w-4 mr-2 text-green-600" />
          <span>Multi-factor authentication & biometric verification</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <IdentificationIcon className="h-4 w-4 mr-2 text-blue-600" />
          <span>Government-verified digital identity</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <BuildingOfficeIcon className="h-4 w-4 mr-2 text-purple-600" />
          <span>Access to integrated government services</span>
        </div>
      </div>

      {/* Government Services Integration */}
      {showServices && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Integrated Government Services
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded px-2 py-1 text-center">
              <span className="font-medium text-gray-700">G2C Services</span>
              <div className="text-gray-600 mt-1">
                CPF Board, HDB, MOH
              </div>
            </div>
            <div className="bg-gray-50 rounded px-2 py-1 text-center">
              <span className="font-medium text-gray-700">G2B Services</span>
              <div className="text-gray-600 mt-1">
                IRAS, ACRA, Enterprise SG
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By signing in with SEVIS Pass, you agree to share your verified identity information.
          <br />
          <a 
            href="https://sevispass.netlify.app/privacy" 
            className="text-png-red hover:text-red-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          {' · '}
          <a 
            href="https://sevispass.netlify.app/terms" 
            className="text-png-red hover:text-red-700 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  )
}

// Optional: Compact version for smaller spaces
export function SevisPassLoginCompact({ onSuccess, onError, className = '' }: SevisPassLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { loginWithUser } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const authCode = await initiateSevisPassAuth()
      const authResult = await exchangeSevisPassCode(authCode)
      
      if (authResult.success && authResult.user) {
        await loginWithUser(authResult.user)
        onSuccess?.()
        
        if (authResult.user.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        throw new Error(authResult.error || 'Authentication failed')
      }
    } catch (err: any) {
      onError?.(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`flex items-center justify-center px-4 py-2 border border-png-red text-sm font-medium rounded-md text-png-red bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-png-red mr-2"></div>
      ) : (
        <IdentificationIcon className="h-4 w-4 mr-2" />
      )}
      SEVIS Pass
    </button>
  )
}
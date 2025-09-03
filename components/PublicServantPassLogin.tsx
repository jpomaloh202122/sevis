'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { IdentificationIcon, ShieldCheckIcon, BuildingOfficeIcon, UserGroupIcon, KeyIcon } from '@heroicons/react/24/outline'
import { initiatePublicServantPassAuth, exchangePublicServantPassCode } from '@/lib/public-servant-pass-integration'

interface PublicServantPassLoginProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  showServices?: boolean
}

export default function PublicServantPassLogin({ 
  onSuccess, 
  onError, 
  className = '',
  showServices = true 
}: PublicServantPassLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginWithUser } = useAuth()
  const router = useRouter()

  const handlePublicServantPassLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      // Step 1: Initiate Public Servant Pass G2G authentication
      const authCode = await initiatePublicServantPassAuth({
        scope: ['identity', 'email', 'profile', 'government_access', 'department_info', 'security_clearance'],
        redirect_uri: `${window.location.origin}/auth/public-servant-pass/callback`
      })

      // Step 2: Exchange code for user data
      const authResult = await exchangePublicServantPassCode(authCode)

      if (!authResult.success) {
        throw new Error(authResult.error || 'Authentication failed')
      }

      // Step 3: Login with user data
      if (authResult.user) {
        await loginWithUser(authResult.user)
        
        // Success callback
        onSuccess?.()
        
        // Redirect based on user role and security clearance
        if (authResult.user.role === 'admin' || authResult.user.role === 'super_admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
        throw new Error('No user data received from Public Servant Pass')
      }

    } catch (err: any) {
      const errorMessage = err.message || 'Public Servant Pass authentication failed'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Public Servant Pass Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-8 h-8 mr-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <UserGroupIcon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Public Servant Pass</h3>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Government-to-Government Authentication System
        </p>
        <p className="text-xs text-gray-500">
          Secure access for Papua New Guinea public servants
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Main Login Button */}
      <button
        onClick={handlePublicServantPassLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-4 border-2 border-blue-600 text-lg font-semibold rounded-lg text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
            Connecting to G2G Portal...
          </>
        ) : (
          <>
            <IdentificationIcon className="h-6 w-6 mr-3" />
            Login with Public Servant Pass
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
          <KeyIcon className="h-4 w-4 mr-2 text-purple-600" />
          <span>Security clearance-based access control</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <BuildingOfficeIcon className="h-4 w-4 mr-2 text-blue-600" />
          <span>Inter-agency collaboration platform</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <UserGroupIcon className="h-4 w-4 mr-2 text-orange-600" />
          <span>Employee verification & department integration</span>
        </div>
      </div>

      {/* G2G Services Integration */}
      {showServices && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Government-to-Government Services
          </h4>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="bg-blue-50 border border-blue-100 rounded px-3 py-2">
              <span className="font-medium text-blue-800">Personnel Management</span>
              <div className="text-blue-600 mt-1">
                HR Systems, Payroll, Performance Management
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded px-3 py-2">
              <span className="font-medium text-purple-800">Inter-Agency Services</span>
              <div className="text-purple-600 mt-1">
                Document Sharing, Procurement, Collaboration
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded px-3 py-2">
              <span className="font-medium text-green-800">Security Clearance</span>
              <div className="text-green-600 mt-1">
                Classified Access, Background Checks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
        <div className="flex items-start">
          <ShieldCheckIcon className="h-4 w-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div className="text-xs text-yellow-700">
            <strong>Security Notice:</strong> This system is for authorized government personnel only. 
            All access is logged and monitored. Unauthorized access is strictly prohibited.
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          By signing in, you acknowledge that you are a verified Papua New Guinea public servant.
          <br />
          <a 
            href={`${process.env.NEXT_PUBLIC_PUBLIC_SERVANT_PASS_URL || 'https://gov-auth.png.gov.pg'}/privacy`}
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          {' · '}
          <a 
            href={`${process.env.NEXT_PUBLIC_PUBLIC_SERVANT_PASS_URL || 'https://gov-auth.png.gov.pg'}/terms`}
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Service
          </a>
          {' · '}
          <a 
            href={`${process.env.NEXT_PUBLIC_PUBLIC_SERVANT_PASS_URL || 'https://gov-auth.png.gov.pg'}/security`}
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Security Policy
          </a>
        </p>
      </div>
    </div>
  )
}

// Compact version for smaller spaces
export function PublicServantPassLoginCompact({ onSuccess, onError, className = '' }: PublicServantPassLoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { loginWithUser } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    setIsLoading(true)
    try {
      const authCode = await initiatePublicServantPassAuth()
      const authResult = await exchangePublicServantPassCode(authCode)
      
      if (authResult.success && authResult.user) {
        await loginWithUser(authResult.user)
        onSuccess?.()
        
        if (authResult.user.role === 'admin' || authResult.user.role === 'super_admin') {
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
      className={`flex items-center justify-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
      ) : (
        <UserGroupIcon className="h-4 w-4 mr-2" />
      )}
      Public Servant Pass
    </button>
  )
}

// Badge component to show user's government credentials
export function PublicServantBadge({ 
  user, 
  showDepartment = true, 
  showClearance = false,
  className = '' 
}: { 
  user: any
  showDepartment?: boolean
  showClearance?: boolean
  className?: string
}) {
  const getClearanceColor = (clearance: string) => {
    switch (clearance) {
      case 'top_secret': return 'bg-red-100 text-red-800 border-red-200'
      case 'secret': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'confidential': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (user?.provider !== 'public_servant_pass') {
    return null
  }

  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <div className="flex items-center px-2 py-1 bg-blue-50 border border-blue-200 rounded text-xs font-medium text-blue-800">
        <UserGroupIcon className="h-3 w-3 mr-1" />
        Public Servant
      </div>
      
      {showDepartment && user.department && (
        <div className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs text-gray-700">
          {user.department}
        </div>
      )}
      
      {showClearance && user.security_clearance && (
        <div className={`px-2 py-1 border rounded text-xs font-medium ${getClearanceColor(user.security_clearance)}`}>
          {user.security_clearance.replace('_', ' ').toUpperCase()}
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { validatePublicServantPassCallback, exchangePublicServantPassCode } from '@/lib/public-servant-pass-integration'
import { UserGroupIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

function CallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { loginWithUser } = useAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Validate callback parameters
        const validation = validatePublicServantPassCallback(searchParams)
        
        if (!validation.valid) {
          setStatus('error')
          setMessage(validation.error || 'Invalid callback parameters')
          return
        }

        // Exchange code for user data
        const authResult = await exchangePublicServantPassCode(
          validation.code!,
          validation.state
        )

        if (!authResult.success) {
          setStatus('error')
          setMessage(authResult.error || 'Authentication failed')
          return
        }

        if (!authResult.user) {
          setStatus('error')
          setMessage('No user data received')
          return
        }

        // Login with user data
        const loginSuccess = await loginWithUser({
          ...authResult.user,
          provider: 'public_servant_pass'
        })

        if (loginSuccess) {
          setStatus('success')
          setMessage('Authentication successful')
          
          // Redirect based on user role
          setTimeout(() => {
            if (authResult.user!.role === 'admin' || authResult.user!.role === 'super_admin') {
              router.push('/admin')
            } else {
              router.push('/dashboard')
            }
          }, 2000)
        } else {
          setStatus('error')
          setMessage('Failed to complete login process')
        }

      } catch (error) {
        console.error('Public Servant Pass callback error:', error)
        setStatus('error')
        setMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
      }
    }

    handleCallback()
  }, [searchParams, loginWithUser, router])

  const handleRetry = () => {
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
            <UserGroupIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Public Servant Pass
          </h2>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'loading' && (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <h3 className="text-lg font-medium text-gray-900">
                  Processing Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Verifying your government credentials...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircleIcon className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Authentication Successful
                </h3>
                <p className="text-sm text-gray-600">
                  Welcome! Redirecting you to your dashboard...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-2000 ease-out"
                    style={{ animation: 'progressBar 2s ease-out forwards' }}
                  ></div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Authentication Failed
                </h3>
                <p className="text-sm text-red-600">
                  {message}
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleRetry}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Again
                  </button>
                  <a
                    href="/login"
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back to Login
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <div className="text-center">
              <p className="text-xs text-gray-500">
                This is a secure government authentication system.
                <br />
                All access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progressBar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  )
}

export default function PublicServantPassCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <h3 className="text-lg font-medium text-gray-900">Loading...</h3>
            </div>
          </div>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  )
}
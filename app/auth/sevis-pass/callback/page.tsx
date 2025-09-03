'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { validateSevisPassCallback, exchangeSevisPassCode } from '@/lib/sevis-pass-integration'

function SevisPassCallbackContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loginWithUser } = useAuth()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Validate callback parameters
        const validation = validateSevisPassCallback(searchParams)
        
        if (!validation.valid) {
          setError(validation.error || 'Invalid callback parameters')
          setStatus('error')
          return
        }

        // Exchange authorization code for user data
        const authResult = await exchangeSevisPassCode(validation.code!, validation.state)
        
        if (!authResult.success) {
          setError(authResult.error || 'Authentication failed')
          setStatus('error')
          return
        }

        // Login user with the returned data
        if (authResult.user) {
          await loginWithUser(authResult.user)
          setStatus('success')
          
          // Redirect based on user role
          setTimeout(() => {
            if (authResult.user!.role === 'admin') {
              router.push('/admin')
            } else {
              router.push('/dashboard')
            }
          }, 1500)
        } else {
          setError('No user data received')
          setStatus('error')
        }
      } catch (err) {
        console.error('SEVIS Pass callback error:', err)
        setError('An unexpected error occurred')
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, loginWithUser, router])

  // For popup windows, send message to parent
  useEffect(() => {
    if (window.opener && status !== 'loading') {
      if (status === 'success') {
        window.opener.postMessage({
          type: 'SEVIS_PASS_AUTH_SUCCESS',
          code: searchParams.get('code')
        }, window.location.origin)
      } else if (status === 'error') {
        window.opener.postMessage({
          type: 'SEVIS_PASS_AUTH_ERROR',
          error: error
        }, window.location.origin)
      }
      window.close()
    }
  }, [status, error, searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Completing SEVIS Pass Authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your digital identity...
          </p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'There was a problem completing your SEVIS Pass authentication.'}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-png-red text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Authentication Successful
        </h2>
        <p className="text-gray-600 mb-4">
          Welcome! You have been successfully authenticated with SEVIS Pass.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you to your dashboard...
        </p>
      </div>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Loading Authentication
        </h2>
        <p className="text-gray-600">
          Please wait...
        </p>
      </div>
    </div>
  )
}

export default function SevisPassCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SevisPassCallbackContent />
    </Suspense>
  )
}
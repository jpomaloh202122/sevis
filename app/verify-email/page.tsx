'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const [isDemo, setIsDemo] = useState(false)

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (!token || !email) {
      setVerificationStatus('error')
      setMessage('Invalid verification link. Please check your email and try again.')
      return
    }

    // Check if we're in demo mode (no database)
    if (process.env.NODE_ENV === 'development' || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
      setIsDemo(true)
      setVerificationStatus('success')
      setMessage('Demo: Email verification successful! In a real deployment, this would verify your email with the database.')
      return
    }

    // Verify email with API
    verifyEmail(token, email)
  }, [searchParams])

  const verifyEmail = async (token: string, email: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationStatus('success')
        setMessage('Email verified successfully! You can now log in to your account.')
      } else {
        if (data.error.includes('expired')) {
          setVerificationStatus('expired')
          setMessage('Verification link has expired. Please request a new verification email.')
        } else {
          setVerificationStatus('error')
          setMessage(data.error || 'Verification failed. Please try again.')
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationStatus('error')
      setMessage('An error occurred during verification. Please try again.')
    }
  }

  const resendVerification = async () => {
    try {
      const email = searchParams.get('email')
      if (!email) {
        setMessage('Unable to resend verification: email not found in URL parameters.')
        return
      }

      const response = await fetch('/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          name: 'User' // Default name for resend
        }),
      })

      if (response.ok) {
        setMessage('A new verification email has been sent! Please check your inbox and spam folder.')
      } else {
        setMessage('Failed to resend verification email. Please try again later.')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setMessage('An error occurred while resending the verification email.')
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-500" />
      case 'error':
        return <XCircleIcon className="h-16 w-16 text-red-500" />
      case 'expired':
        return <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500" />
      default:
        return <div className="h-16 w-16 border-4 border-png-red border-t-transparent rounded-full animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'expired':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {getStatusIcon()}
            </div>
            
            <h2 className={`text-2xl font-bold ${getStatusColor()}`}>
              {verificationStatus === 'loading' && 'Verifying Email...'}
              {verificationStatus === 'success' && 'Email Verified!'}
              {verificationStatus === 'error' && 'Verification Failed'}
              {verificationStatus === 'expired' && 'Link Expired'}
            </h2>
            
            <p className="mt-4 text-gray-600">
              {message}
            </p>

            {isDemo && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> This is a demonstration. In production, email verification would require:
                  <br />• SMTP server configuration
                  <br />• Database setup for verification tokens
                  <br />• Proper email templates
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {verificationStatus === 'success' && (
              <div className="space-y-4">
                <Link
                  href="/login"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-png-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
                >
                  Continue to Login
                </Link>
                
                <Link
                  href="/"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
                >
                  Return to Home
                </Link>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/register')}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-png-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
                >
                  Register Again
                </button>
                
                <Link
                  href="/contact"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
                >
                  Contact Support
                </Link>
              </div>
            )}

            {verificationStatus === 'expired' && (
              <div className="space-y-4">
                <button
                  onClick={resendVerification}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-png-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
                >
                  Resend Verification Email
                </button>
                
                <Link
                  href="/login"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red"
                >
                  Back to Login
                </Link>
              </div>
            )}

            {verificationStatus === 'loading' && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link href="/contact" className="font-medium text-png-red hover:text-red-700">
                Contact our support team
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-png-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

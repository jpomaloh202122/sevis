'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
// Removed direct service import - using API routes instead

function VerifyEmailCodeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !verificationCode) {
      setMessage('Please enter both email and verification code')
      setVerificationStatus('error')
      return
    }

    if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
      setMessage('Verification code must be exactly 6 digits')
      setVerificationStatus('error')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationStatus('success')
        setMessage('Account created successfully! Redirecting to login...')
        
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      } else {
        setVerificationStatus('error')
        setMessage(data.error || 'Verification failed. Please try again.')
      }
    } catch (error) {
      console.error('Verification error:', error)
      setVerificationStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      setMessage('Please enter your email address first')
      setVerificationStatus('error')
      return
    }

    setIsResending(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/complete-registration', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('A new verification code has been sent to your email!')
        setVerificationStatus('idle')
      } else {
        setVerificationStatus('error')
        setMessage(data.error || 'Failed to resend verification code. Please try again.')
      }
    } catch (error) {
      console.error('Resend error:', error)
      setVerificationStatus('error')
      setMessage('An unexpected error occurred while resending the code.')
    } finally {
      setIsResending(false)
    }
  }

  const formatVerificationCode = (value: string) => {
    // Only allow digits and limit to 6 characters
    const digits = value.replace(/\D/g, '').substring(0, 6)
    return digits
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <EnvelopeIcon className="h-16 w-16 text-png-red" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900">
              Complete Registration
            </h2>
            
            <p className="mt-4 text-gray-600">
              Enter the 6-digit verification code sent to your email to create your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Status Messages */}
            {message && (
              <div className={`p-4 rounded-md border ${
                verificationStatus === 'success' 
                  ? 'bg-green-50 border-green-200 text-green-600'
                  : verificationStatus === 'error'
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}>
                <div className="flex items-center">
                  {verificationStatus === 'success' && <CheckCircleIcon className="h-5 w-5 mr-2" />}
                  {verificationStatus === 'error' && <XCircleIcon className="h-5 w-5 mr-2" />}
                  <p className="text-sm">{message}</p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Verification Code Input */}
              <div>
                <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <div className="mt-1">
                  <input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(formatVerificationCode(e.target.value))}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm text-center text-2xl font-mono tracking-widest"
                    placeholder="123456"
                    style={{ letterSpacing: '0.5em' }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code sent to your email to create your account
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting || !email || !verificationCode}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-png-red py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-png-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin -ml-1 mr-3 h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="font-medium text-png-red hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? 'Sending...' : 'Resend Code'}
                </button>
              </p>
            </div>

            {/* Back to Registration */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Need to change your email?{' '}
                <Link href="/register" className="font-medium text-png-red hover:text-red-700">
                  Register with different email
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function VerifyEmailCodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 border-4 border-png-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading verification form...</p>
        </div>
      </div>
    }>
      <VerifyEmailCodeContent />
    </Suspense>
  )
}
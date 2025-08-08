'use client'

import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import WebcamCapture from '@/components/WebcamCapture'
import { userService } from '@/lib/database'
import { validatePassword } from '@/lib/utils'

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    confirmPassword: '',
    verificationMethod: 'email' as 'email' | 'sms',
    agreeToTerms: false
  })
  const [photoData, setPhotoData] = useState<string>('')

  const validateForm = () => {
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }

    // Check password strength
    const passwordValidation = validatePassword(formData.password)
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0])
      return false
    }

    // Check if terms are agreed to
    if (!formData.agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy')
      return false
    }

    // Check if all required fields are filled
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.nationalId) {
      setError('All fields are required')
      return false
    }

    // Check if photo is captured (optional for now, but can be made required)
    if (!photoData) {
      setError('Please capture a profile photo')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create user data for database
      const userData = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        role: 'user' as const,
        national_id: formData.nationalId,
        phone: formData.phone,
        photo_url: photoData
      }

      // Try to register user in database
      try {
        const { data: user, error } = await userService.createUser(userData)

        if (error) {
          if (error.message.includes('duplicate key')) {
            setError('An account with this email already exists')
          } else {
                    setError('Failed to create account. Please try again.')
          }
          return
        }

        // Send verification based on method
        const verificationEndpoint = formData.verificationMethod === 'sms' 
          ? '/api/auth/send-sms-verification'
          : '/api/auth/send-verification'
        
        const verificationData = formData.verificationMethod === 'sms'
          ? { phoneNumber: formData.phone, name: `${formData.firstName} ${formData.lastName}` }
          : { email: formData.email, name: `${formData.firstName} ${formData.lastName}` }

        const response = await fetch(verificationEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(verificationData),
        })

        if (response.ok) {
          const method = formData.verificationMethod === 'sms' ? 'SMS' : 'email'
          setSuccess(`Account created successfully! Please check your ${method.toLowerCase()} to verify your account before logging in.`)
        } else {
          const method = formData.verificationMethod === 'sms' ? 'SMS' : 'email'
          setSuccess(`Account created successfully! Please check your ${method.toLowerCase()} to verify your account before logging in.`)
        }
      } catch (dbError) {
        setError('Database connection failed. Please try again later.')
      }
      
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        nationalId: '',
        password: '',
        confirmPassword: '',
        verificationMethod: 'email',
        agreeToTerms: false
      })
      setPhotoData('')

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err) {
      console.error('Registration error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Join SEVIS PORTAL to access government services
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm"
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <div className="mt-1">
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm"
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
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
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm"
                    placeholder="+675 123 4567"
                  />
                </div>
              </div>

              {/* Verification Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="verificationMethod"
                      value="email"
                      checked={formData.verificationMethod === 'email'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-png-red focus:ring-png-red border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email verification</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="verificationMethod"
                      value="sms"
                      checked={formData.verificationMethod === 'sms'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-png-red focus:ring-png-red border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS verification</span>
                  </label>
                </div>
              </div>

              {/* National ID */}
              <div>
                <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700">
                  National ID Number
                </label>
                <div className="mt-1">
                  <input
                    id="nationalId"
                    name="nationalId"
                    type="text"
                    required
                    value={formData.nationalId}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm"
                    placeholder="Enter your National ID"
                  />
                </div>
              </div>

              {/* Profile Photo */}
              <WebcamCapture
                onPhotoCapture={setPhotoData}
                onPhotoClear={() => setPhotoData('')}
                photoData={photoData}
                isRequired={true}
              />

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm pr-10"
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-png-red focus:ring-png-red border-gray-300 rounded"
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <Link href="/terms" className="font-medium text-png-red hover:text-red-700">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="font-medium text-png-red hover:text-red-700">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-png-red py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-png-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-png-red hover:text-red-700">
                  Sign in here
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
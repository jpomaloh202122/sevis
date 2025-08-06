'use client'

import { useState } from 'react'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/lib/database'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { login, loginWithUser } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    try {
      // For demo purposes, still use the mock login for admin
      if (activeTab === 'admin') {
        const success = await login(formData.email, formData.password, activeTab)
        if (success) {
          router.push('/admin')
        } else {
          setError('Invalid admin credentials. Please try again.')
        }
      } else {
        // For regular users, try to find in database first
        try {
          const { data: dbUser, error } = await userService.getUserByEmail(formData.email)
          
          if (error || !dbUser) {
            // If user not found in database, check if it's the demo user
            if (formData.email === 'user@example.com' && formData.password === 'pawword') {
              // Demo user login
              await login(formData.email, formData.password, 'user')
              router.push('/dashboard')
              return
            } else {
              setError('User not found. Please check your email or register.')
              return
            }
          }

          // User found in database - for demo purposes, accept any password
          // In production, you would hash and compare passwords properly
          await loginWithUser(dbUser)
          router.push('/dashboard')
        } catch (dbError) {
          // If database is not available, allow demo login
          console.log('Database not available, allowing demo login')
          if (formData.password === 'pawword') {
            // Create a demo user object
            const demoUser = {
              id: 'demo-user',
              name: formData.email.split('@')[0],
              email: formData.email,
              role: 'user' as const,
              national_id: 'DEMO123',
              phone: '+675 000 0000'
            }
            await loginWithUser(demoUser)
            router.push('/dashboard')
          } else {
            setError('Demo login failed. Please use password: pawword')
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred. Please try again.')
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
               Sign in to your account
             </h2>
             <p className="mt-2 text-center text-sm text-gray-600">
               Access your SEVIS PORTAL account
             </p>
             
             {/* Dummy Account Info */}
             <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
               <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Accounts:</h3>
               <div className="text-xs text-blue-700 space-y-1">
                 <p><strong>Admin:</strong> admin@sevis.gov.pg / pawword</p>
                 <p><strong>User:</strong> user@example.com / pawword</p>
               </div>
             </div>
           </div>

          {/* Tab Navigation */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('user')}
              className={`flex-1 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === 'user'
                  ? 'bg-white text-png-red shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Citizen/User Login
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex-1 rounded-md py-2 px-3 text-sm font-medium transition-colors ${
                activeTab === 'admin'
                  ? 'bg-white text-png-red shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Admin Login
            </button>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {activeTab === 'admin' ? 'Admin Email' : 'Email Address'}
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
                    placeholder={activeTab === 'admin' ? 'admin@sevis.gov.pg' : 'your.email@example.com'}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-png-red focus:outline-none focus:ring-png-red sm:text-sm pr-10"
                    placeholder="Enter your password"
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
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-png-red focus:ring-png-red border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link href="/forgot-password" className="font-medium text-png-red hover:text-red-700">
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-png-red py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-png-red focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-png-red hover:text-red-700">
                  Register here
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
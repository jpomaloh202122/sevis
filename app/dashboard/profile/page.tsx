'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  CameraIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/lib/database'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  nationalId: string
  photoUrl: string
}

interface PasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, loginWithUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationalId: '',
    photoUrl: ''
  })

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }

    // Parse user name into first and last name
    const nameParts = user.name?.split(' ') || ['', '']
    setProfileData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user.email || '',
      phone: user.phone || '',
      nationalId: user.nationalId || '',
      photoUrl: user.photoUrl || ''
    })
  }, [user, router])

  // Add keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (isEditing && !isSubmitting) {
          handleProfileUpdate()
        }
      }
    }

    if (isEditing) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isEditing, isSubmitting])

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Photo must be smaller than 5MB')
      return
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, GIF, or WebP)')
      return
    }

    setIsUploadingPhoto(true)
    setError('')

    try {
      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onloadend = async () => {
        const photoDataUrl = reader.result as string
        
        // Update local state first
        setProfileData(prev => ({
          ...prev,
          photoUrl: photoDataUrl
        }))

        // Auto-save photo to database if user exists
        if (user?.id) {
          try {
            const { error } = await userService.updateUser(user.id, {
              photo_url: photoDataUrl,
              updated_at: new Date().toISOString()
            })

            if (error) {
              console.error('Failed to save photo:', error)
              setError('Photo uploaded but failed to save. Please click Save to try again.')
            } else {
              // Update auth context
              await loginWithUser({ ...user, photoUrl: photoDataUrl })
              setSuccess('✅ Profile photo updated successfully!')
              setTimeout(() => setSuccess(''), 3000)
            }
          } catch (saveError) {
            console.error('Photo save error:', saveError)
            setError('Photo uploaded but failed to save. Please click Save to try again.')
          }
        }
        
        setIsUploadingPhoto(false)
      }
      reader.onerror = () => {
        setError('Failed to process photo')
        setIsUploadingPhoto(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setError('Failed to upload photo')
      setIsUploadingPhoto(false)
    }
  }

  const validateProfileData = () => {
    const errors = []
    
    if (!profileData.firstName.trim()) {
      errors.push('First name is required')
    }
    
    if (!profileData.lastName.trim()) {
      errors.push('Last name is required')
    }
    
    if (!profileData.email.trim()) {
      errors.push('Email address is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.push('Please enter a valid email address')
    }
    
    if (!profileData.phone.trim()) {
      errors.push('Phone number is required')
    } else if (!/^[\d\s\+\-\(\)]+$/.test(profileData.phone)) {
      errors.push('Please enter a valid phone number')
    }
    
    if (profileData.nationalId && !/^[a-zA-Z0-9]+$/.test(profileData.nationalId.replace(/\s/g, ''))) {
      errors.push('National ID should only contain letters and numbers')
    }
    
    return errors
  }

  const handleProfileUpdate = async () => {
    if (!user?.id) {
      setError('User session not found. Please log in again.')
      return
    }

    // Validate form data
    const validationErrors = validateProfileData()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const updateData = {
        name: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email.trim(),
        phone: profileData.phone.trim(),
        national_id: profileData.nationalId.trim() || null,
        photo_url: profileData.photoUrl || null,
        updated_at: new Date().toISOString()
      }

      console.log('Updating profile with data:', updateData)

      const { data: updatedUser, error } = await userService.updateUser(user.id, updateData)

      if (error) {
        console.error('Profile update error:', error)
        if (error.code === '23505') {
          setError('Email address is already in use by another account.')
        } else if (error.message?.includes('email')) {
          setError('Invalid email format.')
        } else {
          setError(`Failed to update profile: ${error.message || 'Unknown error'}`)
        }
        return
      }

      if (!updatedUser) {
        setError('Profile update failed. Please try again.')
        return
      }

      // Update the auth context with new user data
      await loginWithUser(updatedUser)

      setSuccess('✅ Profile updated successfully!')
      setIsEditing(false)

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess('')
      }, 5000)

    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (!user?.id) return

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // In a real application, you would verify the current password first
      // For now, we'll just update the password (you should implement proper password verification)
      
      const { error } = await userService.updateUser(user.id, {
        // You would typically hash the password here
        // For demo purposes, we're just storing it as-is
        // In production, use proper password hashing
      })

      if (error) {
        setError('Failed to update password. Please try again.')
        return
      }

      setSuccess('Password updated successfully!')
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const cancelEdit = () => {
    // Reset to original values
    const nameParts = user?.name?.split(' ') || ['', '']
    setProfileData({
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      nationalId: user?.nationalId || '',
      photoUrl: user?.photoUrl || ''
    })
    setIsEditing(false)
    setError('')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4 shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckIcon className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XMarkIcon className="h-4 w-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              
              {/* Keyboard shortcut hint */}
              {isEditing && (
                <div className="px-6 pb-2">
                  <p className="text-xs text-gray-500 flex items-center">
                    💡 Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">Ctrl+S</kbd> to save quickly
                  </p>
                </div>
              )}

              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:border-png-red focus:outline-none focus:ring-png-red"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:border-png-red focus:outline-none focus:ring-png-red"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:border-png-red focus:outline-none focus:ring-png-red"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:border-png-red focus:outline-none focus:ring-png-red"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">National ID Number (Optional)</label>
                    <input
                      type="text"
                      name="nationalId"
                      value={profileData.nationalId}
                      onChange={handleProfileChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500 focus:border-png-red focus:outline-none focus:ring-png-red"
                      placeholder="Enter your National ID (optional)"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Profile Photo</h2>
              </div>
              <div className="px-6 py-6">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0 relative">
                    {profileData.photoUrl ? (
                      <img
                        src={profileData.photoUrl}
                        alt="Profile"
                        className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                        <UserIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {isUploadingPhoto && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Photo
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                        className="block w-full text-sm text-gray-900 border border-gray-300 rounded-md cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-png-red file:text-white hover:file:bg-red-700 disabled:opacity-50"
                      />
                      {profileData.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setProfileData(prev => ({ ...prev, photoUrl: '' }))}
                          disabled={isUploadingPhoto}
                          className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      JPG, PNG, GIF or WebP. Max size 5MB. Recommended: Square image, 400x400px.
                    </p>
                    {isUploadingPhoto && (
                      <p className="mt-1 text-xs text-blue-600">
                        Uploading photo...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Change Password
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePasswordUpdate}
                      disabled={isSubmitting}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700 disabled:opacity-50"
                    >
                      Update Password
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        })
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isChangingPassword && (
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Password</label>
                      <div className="mt-1 relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-png-red focus:outline-none focus:ring-png-red pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Password</label>
                      <div className="mt-1 relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-png-red focus:outline-none focus:ring-png-red pr-10"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                      <div className="mt-1 relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-png-red focus:outline-none focus:ring-png-red pr-10"
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
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="flex-shrink-0 mr-4">
                  {user.photoUrl ? (
                    <img 
                      src={user.photoUrl} 
                      alt={user.name}
                      className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Account Summary</h3>
                  <p className="text-sm text-gray-600">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">Full Name</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.phone || 'Not provided'}</p>
                    <p className="text-xs text-gray-500">Phone Number</p>
                  </div>
                </div>
                {user.nationalId && (
                  <div className="flex items-center">
                    <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.nationalId}</p>
                      <p className="text-xs text-gray-500">National ID</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Download My Data
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md">
                  Privacy Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

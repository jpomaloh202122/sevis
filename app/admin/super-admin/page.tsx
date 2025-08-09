'use client'

import { useState, useEffect } from 'react'
import { 
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UsersIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { userService } from '@/lib/database'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConfirmationModal from '@/components/ConfirmationModal'
import bcrypt from 'bcryptjs'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'super_admin' | 'approving_admin' | 'vetting_admin'
  phone: string
  national_id: string
  created_at: string
  email_verified: boolean
}

const roleColors = {
  super_admin: 'bg-purple-100 text-purple-800',
  approving_admin: 'bg-green-100 text-green-800',
  vetting_admin: 'bg-blue-100 text-blue-800',
  admin: 'bg-gray-100 text-gray-800'
}

const roleNames = {
  super_admin: 'Super Admin',
  approving_admin: 'Approving Admin',
  vetting_admin: 'Vetting Admin',
  admin: 'Admin'
}

export default function SuperAdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Create user form
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    nationalId: '',
    role: 'vetting_admin' as 'admin' | 'super_admin' | 'approving_admin' | 'vetting_admin',
    password: '',
    confirmPassword: ''
  })
  const [createFormErrors, setCreateFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!authLoading) {
      fetchAdminUsers()
    }
  }, [authLoading])

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Check if user is authenticated and super admin - after all hooks
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShieldCheckIcon className="h-12 w-12 text-png-red mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in with your administrator credentials to access this portal.</p>
            <div className="space-y-3">
              <Link 
                href="/admin/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-png-red hover:bg-red-700"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Admin Login
              </Link>
              <div className="text-sm">
                <Link href="/" className="text-png-red hover:text-red-700 font-medium">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (user.role !== ('super_admin' as any)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShieldCheckIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Super Admin Access Required</h2>
            <p className="text-gray-600 mb-6">You need super administrator privileges to access this page.</p>
            <Link href="/admin" className="text-png-red hover:text-red-700 font-medium">
              Return to Admin Dashboard
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await userService.getAdminUsers()
      if (error) {
        setError('Failed to load admin users')
      } else {
        setAdminUsers(data || [])
      }
    } catch (err) {
      console.error('Error fetching admin users:', err)
      setError('Failed to load admin users')
    } finally {
      setLoading(false)
    }
  }

  const validateCreateForm = () => {
    const errors: Record<string, string> = {}

    if (!createForm.name.trim()) errors.name = 'Name is required'
    if (!createForm.email.trim()) errors.email = 'Email is required'
    if (!createForm.phone.trim()) errors.phone = 'Phone is required'
    if (!createForm.nationalId.trim()) errors.nationalId = 'National ID is required'
    if (!createForm.password) errors.password = 'Password is required'
    if (createForm.password.length < 8) errors.password = 'Password must be at least 8 characters'
    if (createForm.password !== createForm.confirmPassword) errors.confirmPassword = 'Passwords do not match'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (createForm.email && !emailRegex.test(createForm.email)) {
      errors.email = 'Invalid email format'
    }

    setCreateFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateUser = async () => {
    if (!validateCreateForm()) return

    setActionLoading(true)

    try {
      const passwordHash = await bcrypt.hash(createForm.password, 12)

      const { data, error } = await userService.createAdminUser({
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone,
        national_id: createForm.nationalId,
        role: createForm.role,
        password_hash: passwordHash
      })

      if (error) {
        if (error.message.includes('duplicate key')) {
          setError('User with this email already exists')
        } else {
          setError('Failed to create admin user')
        }
      } else {
        await fetchAdminUsers()
        setShowCreateModal(false)
        setCreateForm({
          name: '',
          email: '',
          phone: '',
          nationalId: '',
          role: 'vetting_admin',
          password: '',
          confirmPassword: ''
        })
        setCreateFormErrors({})
      }
    } catch (err) {
      console.error('Error creating admin user:', err)
      setError('Failed to create admin user')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateRole = async (userId: string, newRole: 'admin' | 'super_admin' | 'approving_admin' | 'vetting_admin') => {
    setActionLoading(true)

    try {
      const { data, error } = await userService.updateUserRole(userId, newRole)

      if (error) {
        setError('Failed to update user role')
      } else {
        await fetchAdminUsers()
      }
    } catch (err) {
      console.error('Error updating user role:', err)
      setError('Failed to update user role')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    setActionLoading(true)

    try {
      // API call to delete user would go here
      // For now, we'll just refresh the list
      await fetchAdminUsers()
      setShowDeleteModal(false)
      setSelectedUser(null)
    } catch (err) {
      console.error('Error deleting user:', err)
      setError('Failed to delete user')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin users...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
              <p className="text-gray-600">Manage admin users and system roles</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/admin"
                className="text-png-red hover:text-red-700 text-sm font-medium"
              >
                ← Admin Dashboard
              </Link>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Add Admin User
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-8 w-8 text-png-red" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Admins</p>
                <p className="text-2xl font-semibold text-gray-900">{adminUsers.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Super Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {adminUsers.filter(u => u.role === 'super_admin').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approving Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {adminUsers.filter(u => u.role === 'approving_admin').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EyeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vetting Admins</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {adminUsers.filter(u => u.role === 'vetting_admin').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Users List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Admin Users</h3>
          </div>
          
          {adminUsers.length === 0 ? (
            <div className="p-8 text-center">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No admin users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {adminUsers.map((adminUser) => (
                <div key={adminUser.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{adminUser.name}</h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[adminUser.role]}`}>
                          {roleNames[adminUser.role]}
                        </span>
                        {adminUser.email_verified && (
                          <CheckCircleIcon className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>Email: {adminUser.email}</div>
                        <div>Phone: {adminUser.phone}</div>
                        <div>Created: {new Date(adminUser.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <select
                        value={adminUser.role}
                        onChange={(e) => handleUpdateRole(adminUser.id, e.target.value as any)}
                        disabled={adminUser.id === user?.id || actionLoading}
                        className="text-sm border border-gray-300 rounded px-2 py-1 disabled:opacity-50"
                      >
                        <option value="vetting_admin">Vetting Admin</option>
                        <option value="approving_admin">Approving Admin</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="admin">Admin (Legacy)</option>
                      </select>
                      
                      {adminUser.id !== user?.id && (
                        <button
                          onClick={() => {
                            setSelectedUser(adminUser)
                            setShowDeleteModal(true)
                          }}
                          className="inline-flex items-center px-2 py-1 border border-red-300 text-sm font-medium rounded text-red-700 bg-white hover:bg-red-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Create Admin User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowCreateModal(false)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Create Admin User</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${createFormErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createFormErrors.name && <p className="text-red-500 text-sm mt-1">{createFormErrors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${createFormErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createFormErrors.email && <p className="text-red-500 text-sm mt-1">{createFormErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${createFormErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createFormErrors.phone && <p className="text-red-500 text-sm mt-1">{createFormErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                    <input
                      type="text"
                      value={createForm.nationalId}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, nationalId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${createFormErrors.nationalId ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createFormErrors.nationalId && <p className="text-red-500 text-sm mt-1">{createFormErrors.nationalId}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, role: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                    >
                      <option value="vetting_admin">Vetting Admin</option>
                      <option value="approving_admin">Approving Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${createFormErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createFormErrors.password && <p className="text-red-500 text-sm mt-1">{createFormErrors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={createForm.confirmPassword}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${createFormErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {createFormErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{createFormErrors.confirmPassword}</p>}
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateUser}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedUser(null)
        }}
        onConfirm={handleDeleteUser}
        title="Delete Admin User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        isLoading={actionLoading}
      />
    </div>
  )
}
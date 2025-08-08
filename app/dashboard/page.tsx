'use client'

import { useState, useEffect } from 'react'
import { 
  UserIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilIcon,
  ArrowRightIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { applicationService } from '@/lib/database'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Application {
  id: string
  user_id: string
  service_name: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  application_data: any
  submitted_at: string
  updated_at: string
  reference_number: string
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100'
    case 'in_progress':
      return 'text-blue-600 bg-blue-100'
    case 'pending':
      return 'text-yellow-600 bg-yellow-100'
    case 'rejected':
      return 'text-red-600 bg-red-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircleIcon className="h-5 w-5" />
    case 'in_progress':
      return <ClockIcon className="h-5 w-5" />
    case 'pending':
      return <ExclamationTriangleIcon className="h-5 w-5" />
    case 'rejected':
      return <ExclamationTriangleIcon className="h-5 w-5" />
    default:
      return <DocumentTextIcon className="h-5 w-5" />
  }
}

const getStatusDisplayName = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'in_progress':
      return 'In Progress'
    case 'pending':
      return 'Pending'
    case 'rejected':
      return 'Rejected'
    default:
      return 'Unknown'
  }
}

const getProgressPercentage = (status: string) => {
  switch (status) {
    case 'completed':
      return 100
    case 'in_progress':
      return 75
    case 'pending':
      return 25
    case 'rejected':
      return 0
    default:
      return 0
  }
}

const getNextStep = (status: string, serviceName: string) => {
  switch (status) {
    case 'completed':
      return `${serviceName} has been processed successfully`
    case 'in_progress':
      return 'Document verification and processing in progress'
    case 'pending':
      return 'Awaiting initial review by government officials'
    case 'rejected':
      return 'Application requires additional documentation or corrections'
    default:
      return 'Status update pending'
  }
}

const getServiceIcon = (serviceName: string) => {
  if (serviceName.toLowerCase().includes('city pass')) {
    return <BuildingOfficeIcon className="h-5 w-5" />
  }
  return <DocumentTextIcon className="h-5 w-5" />
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'profile'>('overview')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const { data, error } = await applicationService.getUserApplications(user.id)
        if (error) {
          console.error('Error fetching applications:', error)
          setError('Failed to load applications')
        } else {
          setApplications(data || [])
        }
      } catch (err) {
        console.error('Error fetching applications:', err)
        setError('Failed to load applications')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [user?.id])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
                             <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-gray-600">Manage your government service applications and profile</p>
            </div>
                         <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-500">Last login: Today at 9:30 AM</span>
               <button 
                 onClick={logout}
                 className="text-png-red hover:text-red-700 text-sm font-medium"
               >
                 Logout
               </button>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-png-red text-png-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-png-red text-png-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Applications
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-png-red text-png-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-8 w-8 text-png-red" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {applications.filter(app => app.status === 'in_progress').length}
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
                    <p className="text-sm font-medium text-gray-500">Completed</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {applications.filter(app => app.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
              </div>
              {loading ? (
                <div className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-png-red mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading applications...</p>
                </div>
              ) : error ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No applications found</p>
                  <Link href="/services" className="mt-2 inline-flex items-center text-png-red hover:text-red-700">
                    Browse services
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {applications.slice(0, 3).map((application) => (
                    <div key={application.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${getStatusColor(application.status)}`}>
                            {getServiceIcon(application.service_name)}
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">{application.service_name}</p>
                            <p className="text-sm text-gray-500">Submitted: {new Date(application.submitted_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400">Ref: {application.reference_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusDisplayName(application.status)}
                          </span>
                          <Link href={`/dashboard/applications/${application.id}`} className="text-png-red hover:text-red-700">
                            <ArrowRightIcon className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/services" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <DocumentTextIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Apply for New Service</p>
                    <p className="text-sm text-gray-500">Browse available government services</p>
                  </div>
                </Link>
                <Link href="/dashboard/profile" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <UserIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Update Profile</p>
                    <p className="text-sm text-gray-500">Manage your personal information</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">My Applications</h3>
              </div>
              {loading ? (
                <div className="px-6 py-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-png-red mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading applications...</p>
                </div>
              ) : error ? (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              ) : applications.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No applications found</p>
                  <Link href="/services" className="mt-2 inline-flex items-center text-png-red hover:text-red-700">
                    Browse services
                    <ArrowRightIcon className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {applications.map((application) => (
                    <div key={application.id} className="px-6 py-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full ${getStatusColor(application.status)}`}>
                            {getServiceIcon(application.service_name)}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-lg font-medium text-gray-900">{application.service_name}</h4>
                            <p className="text-sm text-gray-500">Reference: {application.reference_number}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          {getStatusDisplayName(application.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Submitted</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(application.submitted_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(application.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Progress</p>
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-png-red h-2 rounded-full" 
                                style={{ width: `${getProgressPercentage(application.status)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{getProgressPercentage(application.status)}%</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Application Details */}
                      {application.application_data && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Application Details</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Name:</span> 
                              <span className="ml-2 font-medium">{application.application_data.firstName} {application.application_data.lastName}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Category:</span> 
                              <span className="ml-2 font-medium">{application.application_data.categoryName}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Email:</span> 
                              <span className="ml-2 font-medium">{application.application_data.email}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Phone:</span> 
                              <span className="ml-2 font-medium">{application.application_data.phone}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Next Step:</span> {getNextStep(application.status, application.service_name)}
                        </p>
                      </div>
                      
                      <div className="mt-4 flex space-x-3">
                        <Link 
                          href={`/dashboard/applications/${application.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700"
                        >
                          View Details
                        </Link>
                        {application.status === 'in_progress' && (
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                            Contact Support
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              </div>
              <div className="px-6 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">National ID</label>
                    <p className="mt-1 text-sm text-gray-900">{user?.nationalId || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{user?.role || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <button className="text-png-red hover:text-red-700 text-sm font-medium">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <button className="text-png-red hover:text-red-700 text-sm font-medium">
                    Enable
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Notification Preferences</p>
                    <p className="text-sm text-gray-500">Manage email and SMS notifications</p>
                  </div>
                  <button className="text-png-red hover:text-red-700 text-sm font-medium">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 
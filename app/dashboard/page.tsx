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
  BuildingOfficeIcon,
  TrashIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { applicationService } from '@/lib/database'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ConfirmationModal from '@/components/ConfirmationModal'

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
  const isDriverLicense = serviceName.toLowerCase().includes('driver') && serviceName.toLowerCase().includes('license')
  const isLearnerPermit = serviceName.toLowerCase().includes('learner') || serviceName.toLowerCase().includes('permit')
  
  switch (status) {
    case 'completed':
      if (isDriverLicense) return 'Driver\'s license approved and ready for collection'
      if (isLearnerPermit) return 'Learner\'s permit issued successfully'
      return `${serviceName} has been processed successfully`
    case 'in_progress':
      if (isDriverLicense) return 'Health and driving history review in progress'
      if (isLearnerPermit) return 'Medical certificate verification underway'
      return 'Document verification and processing in progress'
    case 'pending':
      if (isDriverLicense) return 'Document verification will begin within 2 business days'
      if (isLearnerPermit) return 'Initial document review in progress'
      return 'Awaiting initial review by government officials'
    case 'rejected':
      if (isDriverLicense) return 'Additional documentation required - check admin feedback'
      if (isLearnerPermit) return 'Missing documents identified - resubmission needed'
      return 'Application requires additional documentation or corrections'
    default:
      return 'Status update pending'
  }
}

const getServiceIcon = (serviceName: string) => {
  if (serviceName.toLowerCase().includes('city pass')) {
    return <BuildingOfficeIcon className="h-5 w-5" />
  }
  if (serviceName.toLowerCase().includes('public servant pass')) {
    return <UserIcon className="h-5 w-5" />
  }
  if (serviceName.toLowerCase().includes('learner') || 
      serviceName.toLowerCase().includes('permit') || 
      serviceName.toLowerCase().includes('driver') ||
      serviceName.toLowerCase().includes('license')) {
    return <TruckIcon className="h-5 w-5" />
  }
  return <DocumentTextIcon className="h-5 w-5" />
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'profile'>('overview')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [applicationToDelete, setApplicationToDelete] = useState<string | null>(null)
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
          console.log('Dashboard: Fetched applications for user', user.id, ':', data)
          console.log('Dashboard: Applications count:', data?.length || 0)
          data?.forEach((app, index) => {
            console.log(`Dashboard: App ${index + 1}:`, {
              id: app.id,
              service_name: app.service_name,
              status: app.status,
              user_id: app.user_id,
              has_application_data: !!app.application_data,
              has_personalInfo: !!app.application_data?.personalInfo,
              personalInfo_keys: app.application_data?.personalInfo ? Object.keys(app.application_data.personalInfo) : 'none'
            })
            
            // Log driver's license specific data
            if (app.service_name.toLowerCase().includes('driver') && app.service_name.toLowerCase().includes('license')) {
              console.log(`Dashboard: Driver license app ${index + 1} data:`, {
                personalInfo: app.application_data?.personalInfo,
                licenseType: app.application_data?.licenseType,
                licenseClass: app.application_data?.licenseClass
              })
            }
          })
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

  const handleDeleteClick = (applicationId: string) => {
    setApplicationToDelete(applicationId)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user?.id || !applicationToDelete) return

    setDeleteLoading(applicationToDelete)

    try {
      const response = await fetch(`/api/applications/${applicationToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        setApplications(prev => prev.filter(app => app.id !== applicationToDelete))
        setShowDeleteModal(false)
        setApplicationToDelete(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete application')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete application')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setApplicationToDelete(null)
  }

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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-8 w-8 text-png-red" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {applications.filter(app => app.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Processing</p>
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
                            {/* Driver's License Application Details */}
                            {(application.service_name.toLowerCase().includes('driver') && application.service_name.toLowerCase().includes('license')) ? (
                              <>
                                <div>
                                  <span className="text-gray-500">Name:</span> 
                                  <span className="ml-2 font-medium">
                                    {application.application_data?.personalInfo?.surname || 'N/A'} {application.application_data?.personalInfo?.givenNames || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">License Type:</span> 
                                  <span className="ml-2 font-medium">
                                    {application.application_data?.licenseType ? 
                                      application.application_data.licenseType.charAt(0).toUpperCase() + application.application_data.licenseType.slice(1) : 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Class:</span> 
                                  <span className="ml-2 font-medium">Class {application.application_data?.licenseClass || 'N/A'}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Mobile:</span> 
                                  <span className="ml-2 font-medium">{application.application_data?.personalInfo?.phoneNumber || 'N/A'}</span>
                                </div>
                              </>
                            ) : (application.service_name.toLowerCase().includes('learner') || application.service_name.toLowerCase().includes('permit')) ? (
                              /* Learner's Permit Details */
                              <>
                                <div>
                                  <span className="text-gray-500">Name:</span> 
                                  <span className="ml-2 font-medium">{application.application_data.personalInfo?.fullName}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">National ID:</span> 
                                  <span className="ml-2 font-medium">{application.application_data.personalInfo?.nationalId}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Email:</span> 
                                  <span className="ml-2 font-medium">{application.application_data.personalInfo?.email}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Phone:</span> 
                                  <span className="ml-2 font-medium">{application.application_data.personalInfo?.phoneNumber}</span>
                                </div>
                              </>
                            ) : application.service_name.toLowerCase().includes('public servant pass') ? (
                              /* Public Servant Pass Details */
                              <>
                                <div>
                                  <span className="text-gray-500">Name:</span> 
                                  <span className="ml-2 font-medium">
                                    {application.application_data.personalInfo?.firstName} {application.application_data.personalInfo?.lastName}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Public Servant ID:</span> 
                                  <span className="ml-2 font-medium">{application.application_data.employmentInfo?.publicServantId}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Department:</span> 
                                  <span className="ml-2 font-medium">{application.application_data.employmentInfo?.department}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Work Email:</span> 
                                  <span className="ml-2 font-medium">{application.application_data.employmentInfo?.workEmail}</span>
                                </div>
                              </>
                            ) : (
                              /* Other Applications (City Pass, etc.) */
                              <>
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
                              </>
                            )}
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
                        <button
                          onClick={() => handleDeleteClick(application.id)}
                          disabled={deleteLoading === application.id}
                          className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleteLoading === application.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                              Deleting...
                            </>
                          ) : (
                            <>
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </>
                          )}
                        </button>
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
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        isLoading={deleteLoading === applicationToDelete}
      />
    </div>
  )
} 
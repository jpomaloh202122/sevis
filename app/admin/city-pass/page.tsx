'use client'

import { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  IdentificationIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { applicationService } from '@/lib/database'
import { 
  isAdmin, 
  canApprove, 
  canVet, 
  getAdminLevel, 
  getAdminLevelName, 
  canPerformAction, 
  getWorkflowStatusMessage, 
  hasBeenVetted,
  getUnverifiedDocuments,
  isReadyForVettingCompletion
} from '@/lib/admin-roles'
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
  users?: {
    id: string
    name: string
    email: string
    phone: string
    national_id: string
    photo_url?: string
  }
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800', 
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
}

const statusIcons = {
  pending: ClockIcon,
  in_progress: DocumentTextIcon,
  completed: CheckIcon,
  rejected: XMarkIcon
}

const categoryColors = {
  'property-owner': 'bg-blue-50 text-blue-700',
  'business-person': 'bg-orange-50 text-orange-700',
  'student': 'bg-green-50 text-green-700',
  'employee': 'bg-purple-50 text-purple-700'
}

const categoryNames = {
  'property-owner': 'Property Owner',
  'business-person': 'Business Person', 
  'student': 'Student',
  'employee': 'Employee'
}

export default function CityPassAdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  
  // Selected application for detailed view
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  
  // Admin actions
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_info' | null>(null)
  const [actionNote, setActionNote] = useState('')
  
  // Document verification for vetting admins
  const [verificationLoading, setVerificationLoading] = useState<string | null>(null)

  // Check if user has admin access
  const hasAdminAccess = isAdmin(user)
  
  // Get user role permissions - simplified to allow any admin to do both
  const canApproveApps = canApprove(user)
  const canVetApps = canVet(user)
  const userAdminLevel = user ? getAdminLevel(user) : null

  // Filter applications function
  const filterApplications = () => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.users?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.users?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_data?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.application_data?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(app => app.application_data?.category === categoryFilter)
    }

    setFilteredApplications(filtered)
  }

  useEffect(() => {
    if (!authLoading) {
      fetchApplications()
    }
  }, [authLoading])

  useEffect(() => {
    filterApplications()
  }, [applications, searchTerm, statusFilter, categoryFilter])

  // Debug logging for admin level detection
  useEffect(() => {
    if (user) {
      console.log('=== ADMIN LEVEL DEBUG ===')
      console.log('User:', user)
      console.log('User Role (DB):', user.role)
      console.log('User National ID:', user.nationalId)
      console.log('User Photo URL:', user.photoUrl)
      console.log('Detected Admin Level:', userAdminLevel)
      console.log('Can Vet:', canVetApps)
      console.log('Can Approve:', canApproveApps)
      console.log('Is Admin:', isAdmin(user))
      console.log('getAdminLevel result:', getAdminLevel(user))
      console.log('canVet result:', canVet(user))
      console.log('========================')
    }
  }, [user, userAdminLevel, canVetApps, canApproveApps])

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

  // Early return after all hooks are defined and auth is loaded
  if (!hasAdminAccess) {
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

  const fetchApplications = async () => {
    try {
      const { data, error } = await applicationService.getAllApplications()
      if (error) {
        setError('Failed to load applications')
      } else {
        const cityPassApplications = (data || []).filter(app => 
          app.service_name === 'City Pass'
        )
        setApplications(cityPassApplications)
      }
    } catch (err) {
      console.error('Error fetching applications:', err)
      setError('Failed to load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleActionClick = (action: 'approve' | 'reject' | 'request_info', application: Application) => {
    setSelectedApplication(application)
    setActionType(action)
    setShowActionModal(true)
    setActionNote('')
  }

  const handleVettingAction = async (application: Application) => {
    console.log('=== VETTING ACTION DEBUG ===')
    console.log('Application:', application)
    console.log('Application Documents:', application.application_data?.documents)
    console.log('Application DocumentVerifications:', application.application_data?.documentVerifications)
    
    console.log('Proceeding with vetting submission...')
    setActionLoading(application.id)

    try {
      const requestBody = { 
        status: 'in_progress',
        adminNote: 'Application vetted and ready for approval',
        adminId: user?.id,
        adminRole: getAdminLevel(user),
        vettingData: {
          completed: true,
          vetted_by: user?.id,
          vetted_at: new Date().toISOString(),
          vetted_by_name: user?.name
        }
      }
      console.log('Vetting request body:', requestBody)

      const response = await fetch(`/api/admin/applications/${application.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Vetting response status:', response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log('Vetting success:', responseData)
        await fetchApplications()
        setError(null)
      } else {
        const errorData = await response.json()
        console.error('Vetting API error:', errorData)
        setError(errorData.error || 'Failed to vet application')
      }
    } catch (err) {
      console.error('Vetting error:', err)
      setError('Failed to vet application')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDocumentVerification = async (applicationId: string, documentType: string, verified: boolean) => {
    console.log('=== DOCUMENT VERIFICATION DEBUG ===')
    console.log('Application ID:', applicationId)
    console.log('Document Type:', documentType)
    console.log('Verified:', verified)
    console.log('User ID:', user?.id)
    
    setVerificationLoading(applicationId)

    try {
      const verificationData = {
        [`${documentType}_verified`]: verified,
        verified_by: user?.id,
        verification_notes: verified ? 'Document verified by vetting admin' : 'Document requires review'
      }
      
      console.log('Verification data being sent:', verificationData)

      const response = await fetch(`/api/admin/applications/${applicationId}/verify-documents`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationData),
      })

      console.log('Document verification response status:', response.status)

      if (response.ok) {
        const responseData = await response.json()
        console.log('Document verification success:', responseData)
        await fetchApplications()
        // Update the selected application if it's the same one
        if (selectedApplication && selectedApplication.id === applicationId) {
          const updatedApp = applications.find(app => app.id === applicationId)
          if (updatedApp) {
            console.log('Updated application after verification:', updatedApp)
            setSelectedApplication(updatedApp)
          }
        }
        setError(null)
      } else {
        const errorData = await response.json()
        console.error('Document verification API error:', errorData)
        setError(errorData.error || 'Failed to update document verification')
      }
    } catch (err) {
      console.error('Verification error:', err)
      setError('Failed to update document verification')
    } finally {
      setVerificationLoading(null)
    }
  }

  const handleActionConfirm = async () => {
    if (!selectedApplication || !actionType) return

    console.log('=== APPROVAL ACTION DEBUG ===')
    console.log('Selected Application:', selectedApplication)
    console.log('Action Type:', actionType)
    console.log('Action Note:', actionNote)
    console.log('User Admin Level:', getAdminLevel(user))
    console.log('Application has been vetted:', hasBeenVetted(selectedApplication))

    setActionLoading(selectedApplication.id)

    try {
      let newStatus: 'pending' | 'in_progress' | 'completed' | 'rejected' = selectedApplication.status

      switch (actionType) {
        case 'approve':
          newStatus = 'completed'
          break
        case 'reject':
          newStatus = 'rejected'
          break
        case 'request_info':
          newStatus = 'pending'
          break
      }

      const requestBody = { 
        status: newStatus,
        adminNote: actionNote,
        adminId: user?.id,
        adminRole: getAdminLevel(user)
      }
      
      console.log('Approval request body:', requestBody)

      const response = await fetch(`/api/admin/applications/${selectedApplication.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Approval response status:', response.status)

      if (response.ok) {
        const responseData = await response.json()
        console.log('Approval success:', responseData)
        await fetchApplications()
        setShowActionModal(false)
        setSelectedApplication(null)
        setActionType(null)
        setActionNote('')
        setError(null)
      } else {
        const errorData = await response.json()
        console.error('Approval API error:', errorData)
        setError(errorData.error || 'Failed to update application')
      }
    } catch (err) {
      console.error('Action error:', err)
      setError('Failed to update application')
    } finally {
      setActionLoading(null)
    }
  }

  const getActionModalContent = () => {
    switch (actionType) {
      case 'approve':
        return {
          title: 'Approve Application',
          message: `Are you sure you want to approve this city pass application? The applicant will be notified and can collect their pass.`,
          confirmText: 'Approve',
          color: 'green' as const
        }
      case 'reject':
        return {
          title: 'Reject Application', 
          message: `Are you sure you want to reject this city pass application? Please provide a reason for rejection.`,
          confirmText: 'Reject',
          color: 'red' as const
        }
      case 'request_info':
        return {
          title: 'Request Additional Information',
          message: `Request additional information from the applicant. Please specify what information is needed.`,
          confirmText: 'Send Request',
          color: 'blue' as const
        }
      default:
        return {
          title: '',
          message: '',
          confirmText: 'Confirm',
          color: 'blue' as const
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading city pass applications...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const modalContent = getActionModalContent()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">City Pass Applications</h1>
              <p className="text-gray-600">Review and manage city pass applications</p>
            </div>
            <Link 
              href="/admin"
              className="text-png-red hover:text-red-700 text-sm font-medium"
            >
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XMarkIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'rejected').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="property-owner">Property Owner</option>
              <option value="business-person">Business Person</option>
              <option value="student">Student</option>
              <option value="employee">Employee</option>
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setCategoryFilter('all')
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Applications ({filteredApplications.length})
            </h3>
          </div>
          
          {filteredApplications.length === 0 ? (
            <div className="p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredApplications.map((application) => {
                const StatusIcon = statusIcons[application.status]
                return (
                  <div key={application.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start flex-1">
                        {/* Profile Image */}
                        <div className="flex-shrink-0 mr-4">
                          {application.users?.photo_url || application.application_data?.photoUrl ? (
                            <img 
                              src={application.users?.photo_url || application.application_data?.photoUrl} 
                              alt={`${application.application_data?.firstName} ${application.application_data?.lastName}`}
                              className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                              <UserIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {application.application_data?.firstName} {application.application_data?.lastName}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {application.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {application.application_data?.category && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[application.application_data.category as keyof typeof categoryColors]}`}>
                              {categoryNames[application.application_data.category as keyof typeof categoryNames]}
                            </span>
                          )}
                          {/* Vetting Status Indicator */}
                          {application.status === 'pending' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Awaiting Vetting
                            </span>
                          )}
                          {application.status === 'in_progress' && hasBeenVetted(application) && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                              Vetted - Pending Approval
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <IdentificationIcon className="h-4 w-4 mr-2" />
                            Ref: {application.reference_number}
                          </div>
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            {application.application_data?.email}
                          </div>
                          <div className="flex items-center">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            {application.application_data?.phone}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-2" />
                            {new Date(application.submitted_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </button>
                        
                        {/* Admin Vetting Actions */}
                        {(() => {
                          const canVetThisApp = canPerformAction(user, application, 'vet')
                          
                          return canVetThisApp && (
                            <button
                              onClick={() => setSelectedApplication(application)}
                              disabled={actionLoading === application.id}
                              className="inline-flex items-center px-3 py-1 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Review documents and complete vetting process"
                            >
                              <InformationCircleIcon className="h-4 w-4 mr-1" />
                              Review & Vet
                            </button>
                          )
                        })()}

                        {/* Admin Approval Actions */}
                        {canPerformAction(user, application, 'approve') && (
                          <>
                            <button
                              onClick={() => handleActionClick('approve', application)}
                              disabled={actionLoading === application.id}
                              className="inline-flex items-center px-3 py-1 border border-green-300 text-sm font-medium rounded-md text-green-700 bg-white hover:bg-green-50 disabled:opacity-50"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            
                            <button
                              onClick={() => handleActionClick('reject', application)}
                              disabled={actionLoading === application.id}
                              className="inline-flex items-center px-3 py-1 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        
                        {/* Show workflow status for actions not allowed */}
                        {!canPerformAction(user, application, 'approve') && 
                         !canPerformAction(user, application, 'reject') && 
                         !canPerformAction(user, application, 'vet') && 
                         userAdminLevel && (
                          <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                            {getWorkflowStatusMessage(application, userAdminLevel)}
                          </span>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
      
      {/* Application Details Modal */}
      {selectedApplication && !showActionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSelectedApplication(null)}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Application Header */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedApplication.application_data?.firstName} {selectedApplication.application_data?.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">Reference: {selectedApplication.reference_number}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedApplication.status]}`}>
                        {selectedApplication.status.replace('_', ' ').toUpperCase()}
                      </span>
                      {selectedApplication.application_data?.category && (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors[selectedApplication.application_data.category as keyof typeof categoryColors]}`}>
                          {categoryNames[selectedApplication.application_data.category as keyof typeof categoryNames]}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Submitted:</span>
                      <span className="ml-2 font-medium">{new Date(selectedApplication.submitted_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Updated:</span>
                      <span className="ml-2 font-medium">{new Date(selectedApplication.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white border rounded-lg p-6 mb-6">
                  <div className="flex items-center mb-6">
                    <div className="flex-shrink-0 mr-4">
                      {selectedApplication.users?.photo_url || selectedApplication.application_data?.photoUrl ? (
                        <img 
                          src={selectedApplication.users?.photo_url || selectedApplication.application_data?.photoUrl} 
                          alt={`${selectedApplication.application_data?.firstName} ${selectedApplication.application_data?.lastName}`}
                          className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                          <UserIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                      <p className="text-sm text-gray-600">
                        {selectedApplication.application_data?.firstName} {selectedApplication.application_data?.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-medium">{selectedApplication.application_data?.firstName} {selectedApplication.application_data?.lastName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedApplication.application_data?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">{selectedApplication.application_data?.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">National ID</p>
                        <p className="font-medium">{selectedApplication.application_data?.nationalId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start col-span-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">
                          {selectedApplication.application_data?.address}<br/>
                          {selectedApplication.application_data?.city}
                          {selectedApplication.application_data?.postalCode && `, ${selectedApplication.application_data.postalCode}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                {selectedApplication.application_data?.documents && (
                  <div className="bg-white border rounded-lg p-6 mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Document Verification</h4>
                    <div className="space-y-4">
                      {Object.entries(selectedApplication.application_data.documents).map(([key, value]) => {
                        if (!value) return null
                        const documentNames = {
                          nationalIdDoc: 'National ID Document',
                          addressProof: 'Proof of Address',
                          categorySpecificDoc: 'Category-Specific Documents'
                        }
                        
                        // Fix verification key mapping
                        let verificationKey
                        if (key === 'nationalIdDoc') verificationKey = 'national_id'
                        else if (key === 'addressProof') verificationKey = 'address_proof'  
                        else if (key === 'categorySpecificDoc') verificationKey = 'category_doc'
                        else verificationKey = key.replace('Doc', '').replace(/([A-Z])/g, '_$1').toLowerCase()
                        
                        const isVerified = selectedApplication.application_data?.documentVerifications?.[`${verificationKey}_verified`]
                        
                        
                        return (
                          <div key={key} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                                <span className="font-medium">{documentNames[key as keyof typeof documentNames]}</span>
                                {isVerified && (
                                  <CheckCircleIcon className="h-4 w-4 text-green-500 ml-2" />
                                )}
                              </div>
                              <button className="text-png-red hover:text-red-700 text-sm font-medium">
                                View Document
                              </button>
                            </div>
                            
                            {/* Admin Verification Controls */}
                            {canVetApps && (
                              <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-700">Verification:</span>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`verify-${key}`}
                                    checked={isVerified === true}
                                    onChange={() => handleDocumentVerification(selectedApplication.id, verificationKey, true)}
                                    disabled={verificationLoading === selectedApplication.id}
                                    className="mr-2 text-green-600"
                                  />
                                  <span className="text-sm text-green-600">Verified</span>
                                </label>
                                <label className="flex items-center">
                                  <input
                                    type="radio"
                                    name={`verify-${key}`}
                                    checked={isVerified === false}
                                    onChange={() => handleDocumentVerification(selectedApplication.id, verificationKey, false)}
                                    disabled={verificationLoading === selectedApplication.id}
                                    className="mr-2 text-red-600"
                                  />
                                  <span className="text-sm text-red-600">Needs Review</span>
                                </label>
                                {verificationLoading === selectedApplication.id && (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-png-red"></div>
                                )}
                              </div>
                            )}
                            
                            {/* Show verification status for non-vetting admins - Debug: Hide this since we're showing controls above */}
                            {false && !canVetApps && isVerified !== undefined && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <span className={`text-sm font-medium ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
                                  Status: {isVerified ? 'Verified' : 'Needs Review'}
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      {/* Vetting Submit Button */}
                      {canVetApps && selectedApplication.status === 'pending' && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          {(() => {
                            const isReadyToComplete = isReadyForVettingCompletion(selectedApplication)
                            const unverifiedDocs = getUnverifiedDocuments(selectedApplication)
                            
                            return (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-base font-medium text-gray-900">Complete Vetting Process</h5>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                                    Ready to Submit
                                  </span>
                                </div>
                                
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                  <div className="flex">
                                    <InformationCircleIcon className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-blue-800">
                                        Document Review Complete
                                      </p>
                                      <p className="text-sm text-blue-700 mt-1">
                                        Review the document verification above, then submit your vetting decision to move this application to the approval queue.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <button
                                  onClick={() => handleVettingAction(selectedApplication)}
                                  disabled={actionLoading === selectedApplication.id}
                                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {actionLoading === selectedApplication.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckIcon className="h-5 w-5 mr-2" />
                                      Submit Vetting - Move to Approval Queue
                                    </>
                                  )}
                                </button>
                                
                                <p className="text-sm text-gray-600 text-center">
                                  Submit your document verification and move this application to the approval queue.
                                </p>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Approval Actions - Any admin can see approval section when applications are ready */}
                {canApproveApps && selectedApplication.status === 'in_progress' && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Application Approval</h4>
                      {hasBeenVetted(selectedApplication) ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Ready for Decision
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Awaiting Vetting Completion
                        </span>
                      )}
                    </div>

                    {hasBeenVetted(selectedApplication) ? (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex">
                          <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-green-800">Application Fully Vetted</p>
                            <p className="text-sm text-green-700 mt-1">All documents have been verified by the vetting team. This application is ready for your approval decision.</p>
                            {selectedApplication.application_data?.vetting?.vetted_at && (
                              <p className="text-xs text-green-600 mt-2">
                                Vetted on: {new Date(selectedApplication.application_data.vetting.vetted_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Vetting Incomplete</p>
                            <p className="text-sm text-yellow-700 mt-1">This application has not been fully vetted. Approval will remain disabled until vetting is complete.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => handleActionClick('approve', selectedApplication)}
                        disabled={actionLoading === selectedApplication.id || !hasBeenVetted(selectedApplication)}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === selectedApplication.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-5 w-5 mr-2" />
                            Approve Application
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleActionClick('reject', selectedApplication)}
                        disabled={actionLoading === selectedApplication.id}
                        className="inline-flex items-center justify-center px-6 py-3 border border-red-300 text-base font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading === selectedApplication.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-3"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <XMarkIcon className="h-5 w-5 mr-2" />
                            Reject Application
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 text-center mt-4">Your decision will be final and the applicant will be notified immediately.</p>
                  </div>
                )}

                {/* Workflow Status Information */}
                {(selectedApplication.status === 'pending' || selectedApplication.status === 'in_progress') && (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Workflow Status</h4>
                    
                    {/* Show workflow restrictions */}
                    {getAdminLevel(user) === 'approving_admin' && 
                     selectedApplication.status === 'pending' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Awaiting Vetting Process
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              This application must be vetted by a vetting administrator before you can make an approval decision.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {getAdminLevel(user) === 'approving_admin' && 
                     selectedApplication.status === 'in_progress' && 
                     !hasBeenVetted(selectedApplication) && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Vetting In Progress
                            </p>
                            <p className="text-sm text-yellow-700 mt-1">
                              This application is currently being vetted. Please wait for the vetting process to complete.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show workflow steps */}
                    <div className="mt-4">
                      <div className="flex items-center space-x-4">
                        <div className={`flex items-center ${selectedApplication.status === 'pending' ? 'text-blue-600' : 'text-green-600'}`}>
                          <div className={`w-3 h-3 rounded-full mr-2 ${selectedApplication.status === 'pending' ? 'bg-blue-600 animate-pulse' : 'bg-green-600'}`}></div>
                          <span className="text-sm font-medium">Document Verification</span>
                        </div>
                        <div className="flex-1 border-t border-gray-300"></div>
                        <div className={`flex items-center ${hasBeenVetted(selectedApplication) ? 'text-blue-600' : 'text-gray-400'}`}>
                          <div className={`w-3 h-3 rounded-full mr-2 ${
                            hasBeenVetted(selectedApplication)
                              ? 'bg-blue-600 animate-pulse'
                              : 'bg-gray-400'
                          }`}></div>
                          <span className="text-sm font-medium">Approval Decision</span>
                        </div>
                        <div className="flex-1 border-t border-gray-300"></div>
                        <div className={`flex items-center text-gray-400`}>
                          <div className={`w-3 h-3 rounded-full mr-2 bg-gray-400`}></div>
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false)
          setSelectedApplication(null)
          setActionType(null)
          setActionNote('')
        }}
        onConfirm={handleActionConfirm}
        title={modalContent.title}
        message={modalContent.message}
        confirmText={modalContent.confirmText}
        cancelText="Cancel"
        confirmButtonColor={modalContent.color}
        isLoading={actionLoading === selectedApplication?.id}
      >
        {(actionType === 'reject' || actionType === 'request_info') && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {actionType === 'reject' ? 'Reason for rejection:' : 'Information needed:'}
            </label>
            <textarea
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-png-red focus:border-transparent"
              placeholder={actionType === 'reject' ? 'Please provide a reason...' : 'Please specify what information is needed...'}
              required
            />
          </div>
        )}
      </ConfirmationModal>
    </div>
  )
}
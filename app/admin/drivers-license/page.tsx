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
  TruckIcon,
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
  getAdminLevelName
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

export default function DriversLicenseAdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string>('all')
  
  // Modal states
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'vet' | null>(null)
  const [actionNotes, setActionNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Document verification states
  const [documentVerifications, setDocumentVerifications] = useState<{[key: string]: boolean}>({})

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user || authLoading) return
      
      try {
        const { data, error } = await applicationService.getAllApplications()
        if (error) {
          console.error('Error fetching applications:', error)
          setError('Failed to load applications')
        } else {
          // Filter only driver's license applications
          const driverLicenseApps = (data || []).filter(app => 
            app.service_name.toLowerCase().includes('driver') && 
            app.service_name.toLowerCase().includes('license')
          )
          setApplications(driverLicenseApps)
        }
      } catch (err) {
        console.error('Error fetching applications:', err)
        setError('Failed to load applications')
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [user, authLoading])

  // Filter applications based on search and filters
  useEffect(() => {
    let filtered = applications

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.users?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.users?.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter)
    }

    if (licenseTypeFilter !== 'all') {
      filtered = filtered.filter(app => {
        const licenseType = app.application_data?.licenseType
        return licenseType === licenseTypeFilter
      })
    }

    setFilteredApplications(filtered)
  }, [applications, searchTerm, statusFilter, licenseTypeFilter])

  const openDetailsModal = (application: Application) => {
    setSelectedApplication(application)
    // Initialize document verification state
    const verifications = application.application_data?.documentVerifications || {}
    setDocumentVerifications({
      national_id_verified: verifications.national_id_verified || false,
      birth_certificate_verified: verifications.birth_certificate_verified || false,
      medical_certificate_verified: verifications.medical_certificate_verified || false,
      passport_photo_verified: verifications.passport_photo_verified || false,
      eye_test_verified: verifications.eye_test_verified || false,
      proof_of_address_verified: verifications.proof_of_address_verified || false,
      witness_id_verified: verifications.witness_id_verified || false,
      previous_license_verified: verifications.previous_license_verified || false,
      foreign_license_verified: verifications.foreign_license_verified || false
    })
    setShowDetailsModal(true)
  }

  const openActionModal = (application: Application, action: 'approve' | 'reject' | 'vet') => {
    setSelectedApplication(application)
    setActionType(action)
    setActionNotes('')
    setShowActionModal(true)
  }

  const handleDocumentVerification = async (applicationId: string) => {
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/admin/applications/${applicationId}/verify-documents`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          verified_by: user?.id,
          verification_notes: actionNotes,
          ...documentVerifications
        })
      })

      if (!response.ok) {
        throw new Error('Failed to verify documents')
      }

      // Refresh applications
      const { data } = await applicationService.getAllApplications()
      const driverLicenseApps = (data || []).filter(app => 
        app.service_name.toLowerCase().includes('driver') && 
        app.service_name.toLowerCase().includes('license')
      )
      setApplications(driverLicenseApps)
      
      alert('Documents verified successfully!')
      setShowDetailsModal(false)
    } catch (error) {
      console.error('Error verifying documents:', error)
      alert('Failed to verify documents')
    } finally {
      setActionLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedApplication || !actionType) return

    try {
      setActionLoading(true)
      
      const newStatus = actionType === 'approve' ? 'completed' : 
                       actionType === 'reject' ? 'rejected' : 'in_progress'

      const response = await fetch(`/api/admin/applications/${selectedApplication.id}/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          adminId: user?.id,
          status: newStatus,
          notes: actionNotes,
          adminRole: getAdminLevel(user)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update status')
      }

      // Refresh applications
      const { data } = await applicationService.getAllApplications()
      const driverLicenseApps = (data || []).filter(app => 
        app.service_name.toLowerCase().includes('driver') && 
        app.service_name.toLowerCase().includes('license')
      )
      setApplications(driverLicenseApps)
      
      alert(`Application ${actionType}d successfully!`)
      setShowActionModal(false)
    } catch (error) {
      console.error(`Error ${actionType}ing application:`, error)
      alert(`Failed to ${actionType} application: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setActionLoading(false)
    }
  }

  // Check admin permissions
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
          <Link href="/dashboard" className="bg-png-red text-white px-6 py-2 rounded-lg hover:bg-red-700">
            Return to Dashboard
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <TruckIcon className="h-8 w-8 text-png-red mr-3" />
                <div>
                  <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
                    Driver's License Applications
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    Review and process provisional and full driver's license applications
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <div className="flex items-center text-sm text-gray-600">
                <ShieldCheckIcon className="h-4 w-4 mr-1" />
                Admin Level: {getAdminLevelName(getAdminLevel(user))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-png-red focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-png-red focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">License Type</label>
              <select
                value={licenseTypeFilter}
                onChange={(e) => setLicenseTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-png-red focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="provisional">Provisional</option>
                <option value="full">Full License</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                <p><strong>Total:</strong> {filteredApplications.length} applications</p>
                <p><strong>Pending:</strong> {filteredApplications.filter(a => a.status === 'pending').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  License Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApplications.map((application) => {
                const StatusIcon = statusIcons[application.status]
                const licenseType = application.application_data?.licenseType || 'Unknown'
                const licenseClass = application.application_data?.licenseClass || 'N/A'
                
                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {application.users?.photo_url ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={application.users.photo_url}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.users?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.users?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {licenseType.charAt(0).toUpperCase() + licenseType.slice(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Class {licenseClass}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.reference_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[application.status]}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {application.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(application.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => openDetailsModal(application)}
                        className="text-png-red hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 inline mr-1" />
                        View
                      </button>
                      
                      {canVet(user) && application.status === 'pending' && (
                        <button
                          onClick={() => openActionModal(application, 'vet')}
                          className="text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                        >
                          Process
                        </button>
                      )}
                      
                      {canApprove(user) && application.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => openActionModal(application, 'approve')}
                            className="text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openActionModal(application, 'reject')}
                            className="text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <TruckIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No driver's license applications found</p>
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal - Simplified for now */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TruckIcon className="h-5 w-5 mr-2 text-png-red" />
                  Driver's License Application Details
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {/* Application Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Application Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>License Type:</strong> {selectedApplication.application_data?.licenseType}</p>
                      <p><strong>License Class:</strong> {selectedApplication.application_data?.licenseClass}</p>
                      <p><strong>License Period:</strong> {selectedApplication.application_data?.licensePeriod} year(s)</p>
                      <p><strong>Reference:</strong> {selectedApplication.reference_number}</p>
                    </div>
                    <div>
                      <p><strong>Status:</strong> {selectedApplication.status}</p>
                      <p><strong>Submitted:</strong> {new Date(selectedApplication.submitted_at).toLocaleDateString()}</p>
                      <p><strong>Updated:</strong> {new Date(selectedApplication.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Applicant Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Applicant Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Name:</strong> {selectedApplication.application_data?.personalInfo?.surname} {selectedApplication.application_data?.personalInfo?.givenNames}</p>
                      <p><strong>Date of Birth:</strong> {selectedApplication.application_data?.personalInfo?.dateOfBirth}</p>
                      <p><strong>Gender:</strong> {selectedApplication.application_data?.personalInfo?.gender}</p>
                      <p><strong>Phone:</strong> {selectedApplication.application_data?.personalInfo?.phoneNumber}</p>
                    </div>
                    <div>
                      <p><strong>Nationality:</strong> {selectedApplication.application_data?.personalInfo?.nationality}</p>
                      <p><strong>Height:</strong> {selectedApplication.application_data?.personalInfo?.height} cm</p>
                      <p><strong>Eye Color:</strong> {selectedApplication.application_data?.personalInfo?.eyeColour}</p>
                      <p><strong>Hair Color:</strong> {selectedApplication.application_data?.personalInfo?.hairColour}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
                {canVet(user) && selectedApplication.status === 'pending' && (
                  <button
                    onClick={() => handleDocumentVerification(selectedApplication.id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-png-red text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {actionLoading ? 'Processing...' : 'Verify Documents'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Confirmation Modal */}
      <ConfirmationModal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        onConfirm={handleStatusChange}
        title={`${actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Process'} Application`}
        message={`Are you sure you want to ${actionType} this driver's license application?`}
        confirmText={actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Process'}
        confirmButtonColor={actionType === 'reject' ? 'red' : 'red'}
        isLoading={actionLoading}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes {actionType === 'reject' && '*'}
          </label>
          <textarea
            value={actionNotes}
            onChange={(e) => setActionNotes(e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            placeholder={`Add notes for ${actionType}ing this application...`}
            required={actionType === 'reject'}
          />
        </div>
      </ConfirmationModal>

      <Footer />
    </div>
  )
}
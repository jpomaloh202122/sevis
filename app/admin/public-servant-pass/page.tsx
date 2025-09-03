'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { 
  UserGroupIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface PSApplication {
  id: string
  user_id: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  reference_number?: string
  submitted_at: string
  updated_at: string
  application_data: {
    personalInfo: {
      firstName: string
      lastName: string
      dateOfBirth: string
      gender: string
      phoneNumber: string
    }
    employmentInfo: {
      publicServantId: string
      workEmail: string
      department: string
      position: string
      employmentStartDate: string
      directSupervisor: string
      officeLocation: string
    }
    securityInfo?: {
      requiresBackgroundCheck: boolean
      hasPoliceClearance: boolean
      securityClearanceLevel?: string
    }
    vettingInfo?: {
      employmentVerified: boolean
      emailVerified: boolean
      backgroundCheckRequired: boolean
      recommendedAction: 'approve' | 'reject' | 'request_more_info'
      vettingNotes?: string
      vettedBy?: string
      vettedAt?: string
    }
    processingStatus?: {
      stage: string
      vettedAt?: string
      approvedAt?: string
    }
  }
  users?: {
    name: string
    email: string
  }
}

interface VettingFormData {
  employmentVerified: boolean
  emailVerified: boolean
  backgroundCheckRequired: boolean
  securityClearanceLevel: 'basic' | 'confidential' | 'secret'
  vettingNotes: string
  interviewRequired: boolean
  recommendedAction: 'approve' | 'reject' | 'request_more_info'
}

export default function PublicServantPassAdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<PSApplication[]>([])
  const [selectedApp, setSelectedApp] = useState<PSApplication | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVettingModal, setShowVettingModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [vettingForm, setVettingForm] = useState<VettingFormData>({
    employmentVerified: false,
    emailVerified: false,
    backgroundCheckRequired: false,
    securityClearanceLevel: 'basic',
    vettingNotes: '',
    interviewRequired: false,
    recommendedAction: 'approve'
  })
  const [approvalNote, setApprovalNote] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (!authLoading && (!user || !['admin', 'super_admin', 'vetting_admin', 'approving_admin'].includes(user.role))) {
      router.push('/admin/login')
      return
    }

    if (user) {
      fetchApplications()
    }
  }, [user, authLoading, router])

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications/public-servant-pass')
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
      } else {
        console.error('Failed to fetch applications')
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVetApplication = async () => {
    if (!selectedApp) return

    try {
      const response = await fetch('/api/admin/public-servant-pass/vet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          adminId: user?.id,
          vettingData: vettingForm
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Application vetted successfully!')
        setShowVettingModal(false)
        fetchApplications()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error vetting application:', error)
      alert('An error occurred while vetting the application')
    }
  }

  const handleApproveApplication = async () => {
    if (!selectedApp) return

    try {
      const response = await fetch('/api/admin/public-servant-pass/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          adminId: user?.id,
          adminNote: approvalNote
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`Application approved! Reference number: ${data.referenceNumber}`)
        setShowApprovalModal(false)
        setApprovalNote('')
        fetchApplications()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error approving application:', error)
      alert('An error occurred while approving the application')
    }
  }

  const handleRejectApplication = async () => {
    if (!selectedApp || !rejectionReason.trim()) return

    try {
      const response = await fetch('/api/admin/public-servant-pass/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          applicationId: selectedApp.id,
          adminId: user?.id,
          reason: rejectionReason
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Application rejected successfully')
        setShowRejectionModal(false)
        setRejectionReason('')
        fetchApplications()
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error rejecting application:', error)
      alert('An error occurred while rejecting the application')
    }
  }

  const getStatusBadge = (status: string, hasReferenceNumber: boolean) => {
    if (status === 'completed' && hasReferenceNumber) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">✅ Approved</span>
    }
    if (status === 'rejected') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">❌ Rejected</span>
    }
    if (status === 'in_progress') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">🔍 Vetted</span>
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">⏳ Pending</span>
  }

  const getProcessingStage = (app: PSApplication) => {
    const vettingInfo = app.application_data.vettingInfo
    const processingStatus = app.application_data.processingStatus

    if (app.status === 'completed' && app.reference_number) {
      return '✅ Approved with Reference Number'
    }
    if (app.status === 'rejected') {
      return '❌ Rejected'
    }
    if (vettingInfo && processingStatus?.stage === 'vetted') {
      return `🔍 Vetted - ${vettingInfo.recommendedAction === 'approve' ? 'Recommended for Approval' : vettingInfo.recommendedAction === 'reject' ? 'Recommended for Rejection' : 'Needs More Info'}`
    }
    return '⏳ Awaiting Vetting'
  }

  const canVet = (app: PSApplication) => {
    return app.status === 'pending' && !app.application_data.vettingInfo
  }

  const canApprove = (app: PSApplication) => {
    return app.application_data.vettingInfo?.recommendedAction === 'approve' && 
           app.status === 'in_progress' && 
           !app.reference_number
  }

  const canReject = (app: PSApplication) => {
    return app.status !== 'completed' && app.status !== 'rejected'
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-png-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Public Servant Pass applications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Public Servant Pass Administration</h1>
          <p className="mt-2 text-gray-600">
            Manage Public Servant Pass applications with vetting and approval workflow
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Vetting</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vetted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {applications.filter(app => app.status === 'completed' && app.reference_number).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Applications</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PS ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference No.
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
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {app.application_data.personalInfo.firstName} {app.application_data.personalInfo.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{app.users?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.application_data.employmentInfo.publicServantId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.application_data.employmentInfo.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status, !!app.reference_number)}
                      <p className="text-xs text-gray-500 mt-1">{getProcessingStage(app)}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {app.reference_number ? (
                        <span className="font-mono font-semibold text-green-600">{app.reference_number}</span>
                      ) : (
                        <span className="text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <EyeIcon className="h-4 w-4 inline" /> View
                      </button>
                      
                      {canVet(app) && (
                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setShowVettingModal(true)
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <ShieldCheckIcon className="h-4 w-4 inline" /> Vet
                        </button>
                      )}
                      
                      {canApprove(app) && (
                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setShowApprovalModal(true)
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          <CheckCircleIcon className="h-4 w-4 inline" /> Approve
                        </button>
                      )}
                      
                      {canReject(app) && (
                        <button
                          onClick={() => {
                            setSelectedApp(app)
                            setShowRejectionModal(true)
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <XCircleIcon className="h-4 w-4 inline" /> Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {applications.length === 0 && (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No Public Servant Pass applications found.</p>
            </div>
          )}
        </div>

        {/* Vetting Modal */}
        {showVettingModal && selectedApp && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Vet Application: {selectedApp.application_data.personalInfo.firstName} {selectedApp.application_data.personalInfo.lastName}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={vettingForm.employmentVerified}
                        onChange={(e) => setVettingForm({...vettingForm, employmentVerified: e.target.checked})}
                        className="mr-2"
                      />
                      Employment Verified
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={vettingForm.emailVerified}
                        onChange={(e) => setVettingForm({...vettingForm, emailVerified: e.target.checked})}
                        className="mr-2"
                      />
                      Email Verified
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={vettingForm.backgroundCheckRequired}
                        onChange={(e) => setVettingForm({...vettingForm, backgroundCheckRequired: e.target.checked})}
                        className="mr-2"
                      />
                      Background Check Required
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Security Clearance Level</label>
                    <select
                      value={vettingForm.securityClearanceLevel}
                      onChange={(e) => setVettingForm({...vettingForm, securityClearanceLevel: e.target.value as any})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="basic">Basic</option>
                      <option value="confidential">Confidential</option>
                      <option value="secret">Secret</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vetting Notes</label>
                    <textarea
                      value={vettingForm.vettingNotes}
                      onChange={(e) => setVettingForm({...vettingForm, vettingNotes: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                      placeholder="Enter vetting notes..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recommendation</label>
                    <select
                      value={vettingForm.recommendedAction}
                      onChange={(e) => setVettingForm({...vettingForm, recommendedAction: e.target.value as any})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="approve">Approve</option>
                      <option value="reject">Reject</option>
                      <option value="request_more_info">Request More Info</option>
                    </select>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowVettingModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVetApplication}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Complete Vetting
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && selectedApp && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Approve Public Servant Pass
                </h3>
                
                <p className="mb-4 text-gray-600">
                  This will approve the application and generate a reference number for:{' '}
                  <strong>
                    {selectedApp.application_data.personalInfo.firstName} {selectedApp.application_data.personalInfo.lastName}
                  </strong>
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Approval Note (Optional)</label>
                  <textarea
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                    placeholder="Enter any approval notes..."
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApproveApplication}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Approve & Generate Reference Number
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && selectedApp && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Reject Application
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rejection Reason *</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-20"
                    placeholder="Enter reason for rejection..."
                    required
                  />
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectApplication}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject Application
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
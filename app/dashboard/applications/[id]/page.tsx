'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  MapPinIcon,
  CalendarIcon,
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
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

const getServiceIcon = (serviceName: string) => {
  if (serviceName.toLowerCase().includes('city pass')) {
    return <BuildingOfficeIcon className="h-6 w-6" />
  }
  if (serviceName.toLowerCase().includes('learner') || 
      serviceName.toLowerCase().includes('permit') || 
      serviceName.toLowerCase().includes('driver') ||
      serviceName.toLowerCase().includes('license')) {
    return <TruckIcon className="h-6 w-6" />
  }
  return <DocumentTextIcon className="h-6 w-6" />
}

const getTimelineSteps = (status: string, serviceName: string) => {
  const isDriverLicense = serviceName.toLowerCase().includes('driver') && serviceName.toLowerCase().includes('license')
  const isLearnerPermit = serviceName.toLowerCase().includes('learner') || serviceName.toLowerCase().includes('permit')
  
  let steps = [
    { name: 'Application Submitted', completed: true, date: 'Submitted' },
    { name: 'Under Review', completed: status !== 'pending', date: 'In Progress' },
    { name: 'Document Verification', completed: status === 'in_progress' || status === 'completed', date: 'Processing' },
    { name: 'Approval Process', completed: status === 'completed', date: 'Completed' }
  ]

  if (isDriverLicense) {
    steps = [
      { name: 'Application Submitted', completed: true, date: 'Submitted' },
      { name: 'Document Verification', completed: status !== 'pending', date: 'In Progress' },
      { name: 'Health & History Review', completed: status === 'in_progress' || status === 'completed', date: 'Processing' },
      { name: 'License Processing', completed: status === 'completed', date: 'Completed' }
    ]
  } else if (isLearnerPermit) {
    steps = [
      { name: 'Application Submitted', completed: true, date: 'Submitted' },
      { name: 'Document Review', completed: status !== 'pending', date: 'In Progress' },
      { name: 'Medical Verification', completed: status === 'in_progress' || status === 'completed', date: 'Processing' },
      { name: 'Permit Issuance', completed: status === 'completed', date: 'Completed' }
    ]
  }
  
  return steps
}

export default function ApplicationDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname))
    }
  }, [user, router])

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) {
        // User not authenticated, don't fetch
        return
      }
      
      if (!params.id || !user.id) {
        console.log('Missing params.id or user.id:', { paramsId: params.id, userId: user.id })
        setLoading(false)
        return
      }

      try {
        console.log('Fetching application with ID:', params.id)
        const { data, error } = await applicationService.getApplicationById(params.id as string)
        
        if (error) {
          console.error('Error fetching application:', error)
          setError(`Failed to load application details: ${error.message}`)
        } else if (data) {
          console.log('Application data received:', data)
          if (data.user_id === user.id) {
            setApplication(data)
          } else {
            console.log('Access denied - user ID mismatch:', { 
              applicationUserId: data.user_id, 
              currentUserId: user.id 
            })
            setError('Application not found or access denied')
          }
        } else {
          console.log('No application data returned')
          setError('Application not found')
        }
      } catch (err) {
        console.error('Error fetching application:', err)
        setError(`Failed to load application details: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchApplication()
  }, [params.id, user?.id])

  const handleDeleteClick = () => {
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!user?.id || !application) return

    setDeleteLoading(true)

    try {
      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        router.push('/dashboard?tab=applications')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete application')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete application')
    } finally {
      setDeleteLoading(false)
      setShowDeleteModal(false)
    }
  }

  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading application details...</p>
            {params.id && (
              <p className="mt-2 text-sm text-gray-500">Application ID: {params.id}</p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The application you are looking for does not exist.'}</p>
            {params.id && (
              <p className="text-sm text-gray-500 mb-4">Application ID: {params.id}</p>
            )}
            <div className="space-y-3">
              <Link 
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="text-xs text-gray-500">
                <p>If you believe this is an error, please contact support.</p>
                <p>Make sure you are logged in and have permission to view this application.</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const timelineSteps = getTimelineSteps(application.status, application.service_name)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-png-red hover:text-red-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${getStatusColor(application.status)}`}>
                  {getServiceIcon(application.service_name)}
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{application.service_name}</h1>
                  <p className="text-gray-600">Reference: {application.reference_number}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                <span className="ml-2">{getStatusDisplayName(application.status)}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Application Details */}
            {application.application_data && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Application Details</h2>
                </div>
                <div className="px-6 py-6">
                  {/* Driver's License Application Details */}
                  {(application.service_name.toLowerCase().includes('driver') && application.service_name.toLowerCase().includes('license')) ? (
                    <div className="space-y-6">
                      {/* License Information */}
                      {application.application_data.licenseType && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="text-sm font-medium text-blue-900 mb-3">License Information</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-blue-700 font-medium">License Type</p>
                              <p className="text-blue-800">{application.application_data.licenseType.charAt(0).toUpperCase() + application.application_data.licenseType.slice(1)}</p>
                            </div>
                            <div>
                              <p className="text-blue-700 font-medium">License Class</p>
                              <p className="text-blue-800">Class {application.application_data.licenseClass}</p>
                            </div>
                            <div>
                              <p className="text-blue-700 font-medium">License Period</p>
                              <p className="text-blue-800">{application.application_data.licensePeriod} year(s)</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Personal Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-sm font-medium text-gray-900">
                              {application.application_data.personalInfo?.surname} {application.application_data.personalInfo?.givenNames}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="text-sm font-medium text-gray-900">{application.application_data.personalInfo?.dateOfBirth}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Mobile</p>
                            <p className="text-sm font-medium text-gray-900">{application.application_data.personalInfo?.mobile}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Gender</p>
                            <p className="text-sm font-medium text-gray-900">{application.application_data.personalInfo?.gender}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Nationality</p>
                            <p className="text-sm font-medium text-gray-900">{application.application_data.personalInfo?.nationality}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Height</p>
                            <p className="text-sm font-medium text-gray-900">{application.application_data.personalInfo?.height} cm</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center md:col-span-2">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="text-sm font-medium text-gray-900">
                              {application.application_data.personalInfo?.residentialAddress?.street}, {application.application_data.personalInfo?.residentialAddress?.suburb}
                            </p>
                          </div>
                        </div>

                        {application.application_data.witness && (
                          <div className="flex items-center md:col-span-2">
                            <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm text-gray-500">Witness</p>
                              <p className="text-sm font-medium text-gray-900">{application.application_data.witness.name}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Other Application Types (City Pass, Learner's Permit) */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="text-sm font-medium text-gray-900">
                            {application.application_data.firstName || application.application_data.personalInfo?.fullName} {application.application_data.lastName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="text-sm font-medium text-gray-900">{application.application_data.email || application.application_data.personalInfo?.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="text-sm font-medium text-gray-900">{application.application_data.phone || application.application_data.personalInfo?.phoneNumber}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <IdentificationIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">National ID</p>
                          <p className="text-sm font-medium text-gray-900">{application.application_data.nationalId || application.application_data.personalInfo?.nationalId}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center md:col-span-2">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-sm font-medium text-gray-900">
                            {application.application_data.address || application.application_data.personalInfo?.address}, {application.application_data.city}
                            {application.application_data.postalCode && `, ${application.application_data.postalCode}`}
                          </p>
                        </div>
                      </div>
                      
                      {application.application_data.categoryName && (
                        <div className="flex items-center md:col-span-2">
                          <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Category</p>
                            <p className="text-sm font-medium text-gray-900">{application.application_data.categoryName}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {application.application_data?.documents && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Uploaded Documents</h2>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-4">
                    {Object.entries(application.application_data.documents).map(([key, value]) => {
                      if (!value) return null
                      
                      // Define document names for different application types
                      const getDocumentName = (key: string) => {
                        const driverLicenseDocuments = {
                          nationalIdCopy: 'National ID Copy',
                          birthCertificate: 'Birth Certificate',
                          medicalCertificate: 'Medical Certificate',
                          passportPhoto: 'Passport Photo',
                          eyeTestCertificate: 'Eye Test Certificate',
                          previousLicenseCopy: 'Previous License Copy',
                          foreignLicenseCopy: 'Foreign License Copy',
                          proofOfAddress: 'Proof of Address',
                          witnessIdCopy: 'Witness ID Copy'
                        }
                        
                        const learnerPermitDocuments = {
                          nationalIdCopy: 'National ID Copy',
                          birthCertificate: 'Birth Certificate',
                          medicalCertificate: 'Medical Certificate',
                          passportPhoto: 'Passport Photo',
                          eyeTestCertificate: 'Eye Test Certificate',
                          parentalConsent: 'Parental Consent'
                        }
                        
                        const cityPassDocuments = {
                          nationalIdDoc: 'National ID Document',
                          addressProof: 'Proof of Address',
                          categorySpecificDoc: 'Category-Specific Documents'
                        }
                        
                        if (application.service_name.toLowerCase().includes('driver') && application.service_name.toLowerCase().includes('license')) {
                          return driverLicenseDocuments[key as keyof typeof driverLicenseDocuments] || key
                        } else if (application.service_name.toLowerCase().includes('learner') || application.service_name.toLowerCase().includes('permit')) {
                          return learnerPermitDocuments[key as keyof typeof learnerPermitDocuments] || key
                        } else {
                          return cityPassDocuments[key as keyof typeof cityPassDocuments] || key
                        }
                      }
                      
                      return (
                        <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center">
                            <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{getDocumentName(key)}</p>
                              <p className="text-xs text-gray-500">Document uploaded successfully</p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                              <EyeIcon className="h-3 w-3 mr-1" />
                              View
                            </button>
                            <button className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50">
                              <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Application Timeline</h2>
              </div>
              <div className="px-6 py-6">
                <div className="space-y-4">
                  {timelineSteps.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-png-red text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {step.completed ? (
                          <CheckCircleIcon className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className={`text-sm font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </p>
                        <p className="text-xs text-gray-400">{step.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                <span className="ml-2">{getStatusDisplayName(application.status)}</span>
              </div>
              
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium">{getProgressPercentage(application.status)}%</span>
                </div>
                <div className="mt-2 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-png-red h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${getProgressPercentage(application.status)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-3">
                {application.status === 'pending' && (
                  <>
                    <p className="text-sm text-gray-600">
                      Your application is currently under review. You will be notified once the initial assessment is complete.
                    </p>
                    {(application.service_name.toLowerCase().includes('driver') && application.service_name.toLowerCase().includes('license')) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-blue-800">
                          <strong>Expected timeline:</strong> Document verification will begin within 2 business days. You may be contacted for additional information or to schedule required tests.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {application.status === 'in_progress' && (
                  <>
                    <p className="text-sm text-gray-600">
                      Your documents are being verified. This process typically takes 1-2 weeks.
                    </p>
                    {(application.service_name.toLowerCase().includes('driver') && application.service_name.toLowerCase().includes('license')) && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Current stage:</strong> Health and driving history review is in progress. You may be contacted to schedule written or practical driving tests if required.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {application.status === 'completed' && (
                  <>
                    <p className="text-sm text-gray-600">
                      Your application has been approved! You will receive your {application.service_name} shortly.
                    </p>
                    {(application.service_name.toLowerCase().includes('driver') && application.service_name.toLowerCase().includes('license')) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-green-800">
                          <strong>Congratulations!</strong> Your {application.application_data?.licenseType} driver's license has been approved. You will be notified when it's ready for collection.
                        </p>
                      </div>
                    )}
                  </>
                )}
                {application.status === 'rejected' && (
                  <>
                    <p className="text-sm text-gray-600">
                      Your application requires additional documentation. Please check the requirements and resubmit.
                    </p>
                    {(application.service_name.toLowerCase().includes('driver') && application.service_name.toLowerCase().includes('license')) && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                        <p className="text-sm text-red-800">
                          <strong>Action required:</strong> Please review your application details and provide any missing documentation or correct any issues identified during the review process.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                If you have questions about your application, our support team is here to help.
              </p>
              <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Contact Support
              </button>
            </div>

            {/* Delete Application */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Application</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently remove this application from your account. This action cannot be undone.
              </p>
              <button 
                onClick={handleDeleteClick}
                disabled={deleteLoading}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Application
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message={`Are you sure you want to delete your ${application?.service_name} application? This action cannot be undone and all associated data will be permanently removed.`}
        confirmText="Delete Application"
        cancelText="Cancel"
        confirmButtonColor="red"
        isLoading={deleteLoading}
      />
    </div>
  )
}

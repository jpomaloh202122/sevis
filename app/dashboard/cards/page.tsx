'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { applicationService } from '@/lib/database'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CityPassCard from '@/components/CityPassCard'
import { 
  CreditCardIcon,
  DocumentTextIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface Application {
  id: string
  reference_number: string
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  service_name: string
  application_data: any
  submitted_at: string
  updated_at: string
  user_id: string
}

export default function CardsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCard, setSelectedCard] = useState<Application | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent('/dashboard/cards'))
      return
    }
    fetchUserCards()
  }, [user, router])

  const fetchUserCards = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      console.log('Fetching applications for user:', user.id)
      const { data, error } = await applicationService.getUserApplications(user.id)
      
      console.log('Applications response:', { data, error })
      
      if (error) {
        console.error('Error fetching applications:', error)
        setError(`Failed to load your cards: ${error.message}`)
        return
      }

      // For debugging - temporarily show all applications, then filter for completed ones
      const allApplications = data || []
      const approvedCards = data?.filter(app => app.status === 'completed') || []
      console.log('All applications:', allApplications)
      console.log('Approved cards:', approvedCards)
      
      // Temporarily show all applications in development mode for debugging
      if (process.env.NODE_ENV === 'development' && approvedCards.length === 0 && allApplications.length > 0) {
        console.log('No completed applications found, showing all for debugging')
        setApplications(allApplications)
      } else {
        setApplications(approvedCards)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCardTypeIcon = (serviceName: string) => {
    if (serviceName?.toLowerCase().includes('city pass')) {
      return <CreditCardIcon className="h-6 w-6" />
    }
    return <DocumentTextIcon className="h-6 w-6" />
  }

  const getCardTypeName = (serviceName: string) => {
    if (serviceName?.toLowerCase().includes('city pass')) {
      return 'City Pass'
    }
    return 'Digital Card'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50'
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50'
      case 'pending':
        return 'text-blue-600 bg-blue-50'
      case 'rejected':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const downloadCard = async (application: Application) => {
    try {
      // Create a temporary div to render the card for download
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.width = '800px' // Fixed width for consistent rendering
      document.body.appendChild(tempDiv)

      // Import html2canvas dynamically for client-side rendering
      const html2canvas = (await import('html2canvas')).default
      
      // Create a React element for the card
      const cardElement = document.createElement('div')
      cardElement.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
              <div>
                <h1 style="font-size: 24px; font-weight: bold; margin: 0 0 8px 0;">Papua New Guinea</h1>
                <p style="font-size: 14px; opacity: 0.9; margin: 0;">${getCardTypeName(application.service_name)}</p>
              </div>
              <div style="text-align: right;">
                <div style="width: 80px; height: 80px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                  <div style="width: 72px; height: 72px; background: #f3f4f6; border-radius: 4px;"></div>
                </div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
              <div>
                <div style="margin-bottom: 16px;">
                  <p style="font-size: 12px; opacity: 0.8; margin: 0 0 4px 0;">Holder Name</p>
                  <p style="font-size: 18px; font-weight: 600; margin: 0;">${user?.name || 'N/A'}</p>
                </div>
                <div>
                  <p style="font-size: 12px; opacity: 0.8; margin: 0 0 4px 0;">Reference Number</p>
                  <p style="font-size: 14px; font-weight: 500; font-family: monospace; margin: 0;">${application.reference_number}</p>
                </div>
              </div>
              <div style="text-align: center;">
                <div style="background: white; padding: 12px; border-radius: 8px; display: inline-block;">
                  <div style="width: 100px; height: 100px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">QR Code</div>
                </div>
              </div>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.2);">
              <div>
                <p style="font-size: 12px; opacity: 0.8; margin: 0 0 4px 0;">Issued</p>
                <p style="font-size: 14px; margin: 0;">${new Date(application.submitted_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p style="font-size: 12px; opacity: 0.8; margin: 0 0 4px 0;">Valid Until</p>
                <p style="font-size: 14px; margin: 0;">${new Date(new Date(application.submitted_at).setFullYear(new Date(application.submitted_at).getFullYear() + 1)).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          <div style="text-align: center; padding: 16px;">
            <p style="font-size: 12px; color: #666; margin: 0;">This is an official digital identification card issued by the Government of Papua New Guinea</p>
            <p style="font-size: 11px; color: #999; margin: 8px 0 0 0;">Digital verification available at gov.pg/verify</p>
          </div>
        </div>
      `
      tempDiv.appendChild(cardElement)

      // Capture the element as canvas
      const canvas = await html2canvas(cardElement)

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${getCardTypeName(application.service_name)}_${application.reference_number}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        }
      }, 'image/png')

      // Cleanup
      document.body.removeChild(tempDiv)
    } catch (error) {
      console.error('Download failed:', error)
      setError('Failed to download card. Please try again.')
    }
  }

  const deleteCard = async (application: Application) => {
    if (!user?.id) return
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${getCardTypeName(application.service_name)}? This action cannot be undone.`
    )
    
    if (!confirmed) return

    try {
      setDeleteLoading(application.id)
      setError('')

      const response = await fetch(`/api/applications/${application.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete card')
      }

      // Remove the deleted application from the list
      setApplications(prev => prev.filter(app => app.id !== application.id))
      
      // Close modal if this card was being viewed
      if (selectedCard?.id === application.id) {
        setSelectedCard(null)
      }

      // Success feedback could be added here if needed
    } catch (error: any) {
      console.error('Delete card error:', error)
      setError(`Failed to delete card: ${error.message}`)
    } finally {
      setDeleteLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cards...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <CreditCardIcon className="h-8 w-8 text-png-red" />
            <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
          </div>
          <p className="text-gray-600">View and manage your approved digital cards</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Debug:</strong> Total applications: {applications.length}
              {applications.length > 0 && (
                <>
                  <br />
                  <strong>Statuses:</strong> {applications.map(app => `${app.service_name}(${app.status})`).join(', ')}
                </>
              )}
            </p>
          </div>
        )}

        {/* Cards Grid */}
        {applications.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {applications.map((application) => (
              <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-png-red bg-opacity-10 rounded-lg text-png-red">
                      {getCardTypeIcon(application.service_name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {getCardTypeName(application.service_name)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Ref: {application.reference_number}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                    <div className="flex items-center space-x-1">
                      <CheckCircleIcon className="h-3 w-3" />
                      <span>Active</span>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Issued:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(application.submitted_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {application.application_data?.category?.replace('_', ' ') || 'Standard'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(application.updated_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setSelectedCard(application)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700 transition-colors"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Card
                  </button>
                  <button
                    onClick={() => downloadCard(application)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    title="Download Card"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCard(application)}
                    disabled={deleteLoading === application.id}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Card"
                  >
                    {deleteLoading === application.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <CreditCardIcon className="mx-auto h-24 w-24 text-gray-300" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No cards yet</h3>
            <p className="mt-2 text-gray-500 max-w-md mx-auto">
              You don't have any approved digital cards yet. Apply for services to get your cards.
            </p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/services')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700 transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Apply for Services
              </button>
            </div>
          </div>
        )}

        {/* Card Viewer Modal */}
        {selectedCard && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={() => setSelectedCard(null)}
              />

              {/* Modal content */}
              <div className="inline-block align-middle bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full sm:p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getCardTypeName(selectedCard.service_name)}
                  </h3>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Card Display */}
                <div className="mb-6">
                  <CityPassCard
                    userId={user?.id || ''}
                    holderName={user?.name || ''}
                    referenceNumber={selectedCard.reference_number}
                    vettedAt={selectedCard.submitted_at}
                    approvedAt={selectedCard.updated_at}
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex justify-between">
                  <button
                    onClick={() => deleteCard(selectedCard)}
                    disabled={deleteLoading === selectedCard.id}
                    className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === selectedCard.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete Card
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Close
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
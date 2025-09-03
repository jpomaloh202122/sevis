'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  TrashIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  UsersIcon,
  Squares2X2Icon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface DeletePreview {
  deleteScope: string
  applicationsToDelete: number
  summary: {
    total: number
    byService: Record<string, number>
    byStatus: Record<string, number>
  }
  applications: any[]
}

export default function AdminBulkDeletePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [deleteScope, setDeleteScope] = useState<'user' | 'all' | 'service'>('user')
  const [targetUserId, setTargetUserId] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [preview, setPreview] = useState<DeletePreview | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent('/admin/bulk-delete'))
      return
    }

    // Check if user is admin
    const hasAdminAccess = ['admin', 'super_admin'].includes(user.role)
    if (!hasAdminAccess) {
      router.push('/dashboard')
      return
    }

    setLoading(false)
  }, [user, router])

  const loadPreview = async () => {
    try {
      setPreviewLoading(true)
      setError('')
      setPreview(null)

      const params = new URLSearchParams({
        deleteScope
      })

      if (deleteScope === 'user' && targetUserId) {
        params.append('userId', targetUserId)
      } else if (deleteScope === 'service' && serviceName) {
        params.append('serviceName', serviceName)
      }

      const response = await fetch(`/api/applications/bulk-delete?${params.toString()}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load preview')
      }

      setPreview(result)
    } catch (error: any) {
      console.error('Preview error:', error)
      setError(`Failed to load preview: ${error.message}`)
    } finally {
      setPreviewLoading(false)
    }
  }

  const executeBulkDelete = async () => {
    if (!preview || preview.applicationsToDelete === 0) return

    const confirmMessage = `Are you sure you want to DELETE ${preview.applicationsToDelete} applications/cards? This action cannot be undone!
    
Breakdown:
${Object.entries(preview.summary.byService).map(([service, count]) => `- ${service}: ${count}`).join('\n')}

Type "DELETE" to confirm this action.`

    const confirmation = prompt(confirmMessage)
    if (confirmation !== 'DELETE') {
      return
    }

    try {
      setDeleteLoading(true)
      setError('')
      setSuccess('')

      const requestBody: any = {
        deleteScope,
        adminId: user?.id
      }

      if (deleteScope === 'user' && targetUserId) {
        requestBody.userId = targetUserId
      } else if (deleteScope === 'service' && serviceName) {
        requestBody.serviceName = serviceName
      }

      const response = await fetch('/api/applications/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to execute bulk delete')
      }

      setSuccess(result.message)
      setPreview(null)
      
      // Optionally reload preview to show updated state
      if (result.deletedCount > 0) {
        setTimeout(() => {
          loadPreview()
        }, 1000)
      }
      
    } catch (error: any) {
      console.error('Bulk delete error:', error)
      setError(`Bulk delete failed: ${error.message}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin panel...</p>
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
            <TrashIcon className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Bulk Delete Applications/Cards</h1>
          </div>
          <p className="text-gray-600">Remove applications and digital cards from the system</p>
        </div>

        {/* Warning Banner */}
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800 mb-1">⚠️ Danger Zone</h3>
              <p className="text-sm text-red-700">
                This action will permanently delete applications and cards from the system. 
                This cannot be undone. Use with extreme caution.
              </p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Configuration Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Delete Configuration</h2>
            
            {/* Delete Scope Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What to delete:
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="scope-user"
                    type="radio"
                    value="user"
                    checked={deleteScope === 'user'}
                    onChange={(e) => setDeleteScope(e.target.value as any)}
                    className="h-4 w-4 text-png-red border-gray-300 focus:ring-png-red"
                  />
                  <label htmlFor="scope-user" className="ml-2 text-sm text-gray-700 flex items-center">
                    <UsersIcon className="h-4 w-4 mr-2 text-blue-500" />
                    Delete all applications for a specific user
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="scope-service"
                    type="radio"
                    value="service"
                    checked={deleteScope === 'service'}
                    onChange={(e) => setDeleteScope(e.target.value as any)}
                    className="h-4 w-4 text-png-red border-gray-300 focus:ring-png-red"
                  />
                  <label htmlFor="scope-service" className="ml-2 text-sm text-gray-700 flex items-center">
                    <Squares2X2Icon className="h-4 w-4 mr-2 text-green-500" />
                    Delete all applications for a specific service
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="scope-all"
                    type="radio"
                    value="all"
                    checked={deleteScope === 'all'}
                    onChange={(e) => setDeleteScope(e.target.value as any)}
                    className="h-4 w-4 text-png-red border-gray-300 focus:ring-png-red"
                  />
                  <label htmlFor="scope-all" className="ml-2 text-sm text-gray-700 flex items-center">
                    <DocumentTextIcon className="h-4 w-4 mr-2 text-red-500" />
                    Delete ALL applications in the system
                  </label>
                </div>
              </div>
            </div>

            {/* Conditional Inputs */}
            {deleteScope === 'user' && (
              <div className="mb-6">
                <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
                  User ID:
                </label>
                <input
                  id="userId"
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-png-red focus:border-png-red"
                  placeholder="Enter user ID to delete their applications"
                />
              </div>
            )}

            {deleteScope === 'service' && (
              <div className="mb-6">
                <label htmlFor="serviceName" className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name:
                </label>
                <select
                  id="serviceName"
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-png-red focus:border-png-red"
                >
                  <option value="">Select service to delete</option>
                  <option value="Public Servant Pass">Public Servant Pass</option>
                  <option value="City Pass">City Pass</option>
                  <option value="SEVIS Pass">SEVIS Pass</option>
                  <option value="Learner's Permit">Learner's Permit</option>
                  <option value="Driver's License">Driver's License</option>
                </select>
              </div>
            )}

            {/* Preview Button */}
            <button
              onClick={loadPreview}
              disabled={previewLoading || (deleteScope === 'user' && !targetUserId) || (deleteScope === 'service' && !serviceName)}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {previewLoading ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Loading Preview...
                </>
              ) : (
                <>
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview What Will Be Deleted
                </>
              )}
            </button>
          </div>

          {/* Preview Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Delete Preview</h2>
            
            {!preview && !previewLoading && (
              <div className="text-center py-8">
                <EyeIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">Click "Preview" to see what will be deleted</p>
              </div>
            )}

            {preview && (
              <div>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-red-600">
                      {preview.applicationsToDelete}
                    </span>
                    <span className="text-sm text-gray-600">applications to delete</span>
                  </div>

                  {preview.applicationsToDelete > 0 && (
                    <>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">By Service:</h4>
                        <div className="space-y-1">
                          {Object.entries(preview.summary.byService).map(([service, count]) => (
                            <div key={service} className="flex justify-between text-sm">
                              <span className="text-gray-600">{service}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">By Status:</h4>
                        <div className="space-y-1">
                          {Object.entries(preview.summary.byStatus).map(([status, count]) => (
                            <div key={status} className="flex justify-between text-sm">
                              <span className="text-gray-600 capitalize">{status}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={executeBulkDelete}
                        disabled={deleteLoading}
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading ? (
                          <>
                            <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Execute Bulk Delete
                          </>
                        )}
                      </button>
                    </>
                  )}

                  {preview.applicationsToDelete === 0 && (
                    <div className="text-center py-4">
                      <p className="text-gray-600">No applications found to delete</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
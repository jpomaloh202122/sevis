'use client'
import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

interface ApplicationLimitResult {
  canApply: boolean
  reason?: string
  existingApplication?: any
  suggestedActions?: string[]
}

interface ApplicationLimitCheckerProps {
  userId: string
  serviceName: string
  onResult?: (result: ApplicationLimitResult) => void
  className?: string
}

export default function ApplicationLimitChecker({ 
  userId, 
  serviceName, 
  onResult, 
  className = '' 
}: ApplicationLimitCheckerProps) {
  const [result, setResult] = useState<ApplicationLimitResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkApplicationLimits = async () => {
    if (!userId || !serviceName) return

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/applications/check-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          serviceName
        })
      })

      if (!response.ok) {
        throw new Error('Failed to check application limits')
      }

      const data = await response.json()
      setResult(data)
      onResult?.(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkApplicationLimits()
  }, [userId, serviceName])

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
    if (error) return <AlertCircle className="h-5 w-5 text-red-500" />
    if (!result) return null
    
    return result.canApply ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = () => {
    if (isLoading) return 'border-blue-200 bg-blue-50'
    if (error) return 'border-red-200 bg-red-50'
    if (!result) return 'border-gray-200 bg-gray-50'
    
    return result.canApply ? 
      'border-green-200 bg-green-50' : 
      'border-red-200 bg-red-50'
  }

  const getExistingApplicationStatus = (status: string) => {
    switch (status) {
      case 'pending': return { text: 'Pending Review', color: 'text-yellow-600', icon: <Clock className="h-4 w-4" /> }
      case 'in_progress': return { text: 'In Progress', color: 'text-blue-600', icon: <RefreshCw className="h-4 w-4" /> }
      case 'completed': return { text: 'Completed', color: 'text-green-600', icon: <CheckCircle className="h-4 w-4" /> }
      case 'rejected': return { text: 'Rejected', color: 'text-red-600', icon: <XCircle className="h-4 w-4" /> }
      default: return { text: status, color: 'text-gray-600', icon: null }
    }
  }

  if (!userId || !serviceName) {
    return (
      <div className={`border border-gray-200 bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-gray-500" />
          <span className="text-gray-600">Please log in to check application eligibility</span>
        </div>
      </div>
    )
  }

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()} ${className}`}>
      <div className="flex items-start space-x-3">
        {getStatusIcon()}
        
        <div className="flex-1 min-w-0">
          {isLoading && (
            <div>
              <p className="text-sm font-medium text-blue-800">Checking application eligibility...</p>
              <p className="text-sm text-blue-600">Please wait while we verify your application status.</p>
            </div>
          )}
          
          {error && (
            <div>
              <p className="text-sm font-medium text-red-800">Error checking application status</p>
              <p className="text-sm text-red-600">{error}</p>
              <button 
                onClick={checkApplicationLimits}
                className="text-sm text-red-700 hover:text-red-800 underline mt-1"
              >
                Try again
              </button>
            </div>
          )}
          
          {result && !isLoading && !error && (
            <div>
              {result.canApply ? (
                <div>
                  <p className="text-sm font-medium text-green-800">✅ You can apply for {serviceName}</p>
                  <p className="text-sm text-green-600">
                    {result.reason || 'No existing applications found. You may proceed with your application.'}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-red-800">❌ Cannot apply for {serviceName}</p>
                  <p className="text-sm text-red-600 mb-2">{result.reason}</p>
                  
                  {result.existingApplication && (
                    <div className="bg-white bg-opacity-50 rounded p-3 mb-2 text-sm">
                      <p className="font-medium text-gray-800 mb-1">Existing Application:</p>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          {getExistingApplicationStatus(result.existingApplication.status).icon}
                          <span className="text-xs text-gray-600">Status:</span>
                          <span className={`text-xs font-medium ${getExistingApplicationStatus(result.existingApplication.status).color}`}>
                            {getExistingApplicationStatus(result.existingApplication.status).text}
                          </span>
                        </div>
                        
                        {result.existingApplication.reference_number && (
                          <div>
                            <span className="text-xs text-gray-600">Reference: </span>
                            <span className="text-xs font-mono bg-gray-100 px-1 py-0.5 rounded">
                              {result.existingApplication.reference_number}
                            </span>
                          </div>
                        )}
                        
                        {result.existingApplication.created_at && (
                          <div>
                            <span className="text-xs text-gray-600">Applied: </span>
                            <span className="text-xs">
                              {new Date(result.existingApplication.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {result.suggestedActions && result.suggestedActions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">What you can do:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {result.suggestedActions.map((action, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span className="text-gray-400">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {result && !isLoading && (
        <div className="mt-3 pt-3 border-t border-current border-opacity-20">
          <button 
            onClick={checkApplicationLimits}
            className="text-xs text-current hover:opacity-75 underline"
          >
            Refresh status
          </button>
        </div>
      )}
    </div>
  )
}
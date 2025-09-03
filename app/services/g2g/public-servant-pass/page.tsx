'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import PublicServantPassForm from '@/components/forms/PublicServantPassForm'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  UserGroupIcon, 
  ShieldCheckIcon, 
  ClockIcon, 
  DocumentTextIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

export default function PublicServantPassPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [serviceInfo, setServiceInfo] = useState<any>(null)

  useEffect(() => {
    // Load service information
    loadServiceInfo()
  }, [])

  const loadServiceInfo = async () => {
    try {
      // In production, this would fetch from the comprehensive services database
      setServiceInfo({
        name: 'Public Servant Pass',
        category: 'G2G',
        description: 'Digital identity and authentication system for Papua New Guinea government employees',
        processingTime: '14-30 business days',
        fee: 0,
        currency: 'PGK',
        requirements: [
          'Active government employment status',
          'Valid Public Servant ID number',
          'Government work email address',
          'Department verification',
          'Background check (if required)'
        ],
        documents: [
          'Government Employee ID Card',
          'Work Email Verification',
          'Department Authorization Letter (if required)',
          'Security Clearance Certificate (if applicable)'
        ]
      })
    } catch (error) {
      console.error('Error loading service info:', error)
    }
  }

  const handleStartApplication = () => {
    if (!user) {
      router.push('/login?redirect=/services/g2g/public-servant-pass')
      return
    }
    setShowForm(true)
  }

  if (showForm) {
    return (
      <div>
        <Header />
        <PublicServantPassForm />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="bg-gray-50">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-6">
                <UserGroupIcon className="w-10 h-10" />
              </div>
              <div>
                <div className="text-sm font-medium bg-white bg-opacity-20 rounded-full px-3 py-1 inline-block mb-2">
                  G2G Service
                </div>
                <h1 className="text-4xl font-bold mb-2">Public Servant Pass</h1>
                <p className="text-xl text-blue-100">
                  Government-to-Government Digital Identity System
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Service Overview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Overview</h2>
                <p className="text-gray-600 mb-6">
                  The Public Servant Pass is a comprehensive digital identity and authentication system designed 
                  specifically for Papua New Guinea government employees. This G2G (Government-to-Government) 
                  service provides secure access to inter-agency systems, classified information, and collaborative 
                  government platforms.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Security Clearance Integration</h3>
                    <p className="text-sm text-gray-600">
                      Supports all security clearance levels from Basic to Top Secret
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <UserGroupIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Inter-Agency Access</h3>
                    <p className="text-sm text-gray-600">
                      Seamless collaboration across government departments
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <DocumentTextIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">Digital Services</h3>
                    <p className="text-sm text-gray-600">
                      Access to G2G services like eProcurement, eFinance, and more
                    </p>
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <button
                    onClick={handleStartApplication}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center"
                  >
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    {user ? 'Start Application' : 'Login to Apply'}
                  </button>
                  
                  {!user && (
                    <p className="text-xs text-gray-500 mt-2">
                      You need to be logged in to submit an application
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-center text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Application takes approximately 15-20 minutes
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Information</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processing Time:</span>
                    <span className="text-sm font-medium text-gray-900">{serviceInfo?.processingTime}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Service Category:</span>
                    <span className="text-sm font-medium text-blue-600">G2G</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Validity Period:</span>
                    <span className="text-sm font-medium text-gray-900">5 years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}
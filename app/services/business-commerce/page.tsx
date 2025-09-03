'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, ArrowLeftIcon, BuildingOfficeIcon, DocumentTextIcon, CurrencyDollarIcon, TruckIcon, CalculatorIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import ApplyNowButton from '@/components/ApplyNowButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const businessServices = [
  {
    id: 'business-registration',
    name: 'Business Registration',
    description: 'Register your business with the government',
    status: 'Available',
    priority: 'High',
    processingTime: '1-2 weeks',
    requirements: ['Business Plan', 'Owner Identification', 'Business Address', 'Registration Fee'],
    // fee: 'K500', // Removed fees
    icon: BuildingOfficeIcon,
    color: 'bg-blue-500',
    details: 'Business registration is mandatory for all commercial enterprises operating in Papua New Guinea. This includes sole proprietorships, partnerships, and corporations.'
  },
  {
    id: 'trade-license',
    name: 'Trade License',
    description: 'Apply for trade and business licenses',
    status: 'Available',
    priority: 'High',
    processingTime: '2-3 weeks',
    requirements: ['Business Registration', 'Premises Inspection', 'Health Certificate', 'Fire Safety Certificate'],
    // fee: 'K300', // Removed fees
    icon: DocumentTextIcon,
    color: 'bg-green-500',
    details: 'Trade licenses are required for specific types of businesses including retail, food service, manufacturing, and import/export activities.'
  },
  {
    id: 'import-export-permits',
    name: 'Import/Export Permits',
    description: 'Apply for import and export permits',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-4 weeks',
    requirements: ['Business Registration', 'Product Documentation', 'Customs Declaration', 'Shipping Documents'],
    // fee: 'K200', // Removed fees
    icon: TruckIcon,
    color: 'bg-purple-500',
    details: 'Import and export permits are required for international trade activities. Different permits may be needed based on the type of goods being traded.'
  },
  {
    id: 'company-registration',
    name: 'Company Registration',
    description: 'Register a new company or corporation',
    status: 'Available',
    priority: 'High',
    processingTime: '2-4 weeks',
    requirements: ['Articles of Incorporation', 'Shareholder Information', 'Director Details', 'Registered Office'],
    // fee: 'K1000', // Removed fees
    icon: BuildingOfficeIcon,
    color: 'bg-orange-500',
    details: 'Company registration is for businesses that want to operate as a separate legal entity. This provides limited liability protection for shareholders.'
  },
  {
    id: 'tax-registration',
    name: 'Tax Registration',
    description: 'Register for tax purposes',
    status: 'Available',
    priority: 'High',
    processingTime: '1 week',
    requirements: ['Business Registration', 'Owner Identification', 'Business Address', 'Bank Account Details'],
    // fee: 'Free', // Removed fees
    icon: CalculatorIcon,
    color: 'bg-red-500',
    details: 'Tax registration is mandatory for all businesses to ensure compliance with Papua New Guinea tax laws and regulations.'
  }
]

export default function BusinessCommercePage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredServices = businessServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <Link href="/services" className="flex items-center text-png-red hover:text-red-700 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to All Services
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Business & Commerce Services
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Services for businesses and commercial enterprises
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="relative max-w-md mx-auto">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search business services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${service.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {service.status === 'Available' ? (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Available
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {service.status}
                    </>
                  )}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
              
              <div className="mb-4 text-sm">
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Processing Time:</span> {service.processingTime}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Priority:</span> {service.priority}
                </p>
              </div>

              {service.status === 'Available' ? (
                <ApplyNowButton
                  href={`/services/business-commerce/${service.id}`}
                  className="inline-flex items-center text-png-red hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Access Service
                  <svg className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </ApplyNowButton>
              ) : (
                <span className="inline-flex items-center text-gray-400 text-sm font-medium">
                  Available Soon
                </span>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 
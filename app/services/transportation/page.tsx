'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, ArrowLeftIcon, TruckIcon, DocumentTextIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import ApplyNowButton from '@/components/ApplyNowButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const transportationServices = [
  {
    id: 'drivers-license',
    name: 'Driver\'s License',
    description: 'Apply for provisional or full driver\'s license',
    status: 'Available',
    priority: 'High',
    processingTime: '3-6 weeks',
    requirements: ['National ID', 'Medical Certificate', 'Eye Test', 'Witness ID', 'Proof of Address'],
    // fee: 'K200-K300', // Removed fees
    icon: TruckIcon,
    color: 'bg-blue-500',
    details: 'Apply for provisional or full driver\'s license. Provisional licenses are for new drivers, while full licenses are for experienced drivers upgrading or with foreign licenses.'
  },
  {
    id: 'learners-permit',
    name: 'Learner\'s Permit',
    description: 'Apply for your learner\'s driving permit',
    status: 'Available',
    priority: 'High',
    processingTime: '2-3 weeks',
    requirements: ['National ID', 'Birth Certificate', 'Medical Certificate', 'Eye Test', 'Passport Photo'],
    // fee: 'K100', // Removed fees
    icon: TruckIcon,
    color: 'bg-green-600',
    details: 'A learner\'s permit allows you to practice driving under supervision before taking your full driving test. Required for all new drivers and valid for 12 months.'
  },
  {
    id: 'vehicle-registration',
    name: 'Vehicle Registration',
    description: 'Register your vehicle with the government',
    status: 'Available',
    priority: 'High',
    processingTime: '1-2 weeks',
    requirements: ['Vehicle Ownership Documents', 'Insurance Certificate', 'Roadworthiness Certificate', 'Import Documents'],
    // fee: 'K200', // Removed fees
    icon: TruckIcon,
    color: 'bg-green-500',
    details: 'Vehicle registration is mandatory for all motor vehicles operating on public roads. This includes cars, motorcycles, trucks, and commercial vehicles.'
  },
  {
    id: 'road-tax-payment',
    name: 'Road Tax Payment',
    description: 'Pay road tax and vehicle charges',
    status: 'Available',
    priority: 'Medium',
    processingTime: 'Immediate',
    requirements: ['Vehicle Registration', 'Previous Tax Receipt', 'Vehicle Inspection Certificate'],
    // fee: 'Varies by vehicle type', // Removed fees
    icon: CurrencyDollarIcon,
    color: 'bg-purple-500',
    details: 'Road tax is an annual requirement for all registered vehicles. The amount varies based on vehicle type, engine capacity, and usage.'
  },
  {
    id: 'transport-permits',
    name: 'Transport Permits',
    description: 'Apply for transport and logistics permits',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-3 weeks',
    requirements: ['Business Registration', 'Vehicle Fleet Details', 'Driver Qualifications', 'Safety Standards Compliance'],
    // fee: 'K500', // Removed fees
    icon: TruckIcon,
    color: 'bg-orange-500',
    details: 'Transport permits are required for businesses operating commercial transport services including passenger transport, freight, and logistics.'
  },
  {
    id: 'traffic-fines',
    name: 'Traffic Fines',
    description: 'Pay traffic fines and violations',
    status: 'Available',
    priority: 'Medium',
    processingTime: 'Immediate',
    requirements: ['Traffic Violation Notice', 'Vehicle Registration', 'Driver License'],
    // fee: 'Varies by violation', // Removed fees
    icon: ExclamationTriangleIcon,
    color: 'bg-red-500',
    details: 'Traffic fines can be paid online or at designated payment centers. Payment is required to avoid additional penalties and license suspension.'
  }
]

export default function TransportationPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredServices = transportationServices.filter(service =>
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
              Transportation Services
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Vehicle and transport-related services
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
              placeholder="Search transportation services..."
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
                  href={`/services/transportation/${service.id}`}
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
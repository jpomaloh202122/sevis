'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, ArrowLeftIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const legalServices = [
  {
    id: 'legal-documents',
    name: 'Legal Documents',
    description: 'Request legal documents and certificates',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-2 weeks'
  },
  {
    id: 'court-services',
    name: 'Court Services',
    description: 'Access court services and information',
    status: 'Available',
    priority: 'Medium',
    processingTime: 'Varies by case'
  },
  {
    id: 'notary-services',
    name: 'Notary Services',
    description: 'Access notary and legalization services',
    status: 'Available',
    priority: 'Low',
    processingTime: 'Same day'
  },
  {
    id: 'legal-aid',
    name: 'Legal Aid',
    description: 'Apply for legal aid and assistance',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-3 weeks'
  },
  {
    id: 'property-registration',
    name: 'Property Registration',
    description: 'Register property and legal documents',
    status: 'Available',
    priority: 'High',
    processingTime: '2-4 weeks'
  }
]

export default function LegalServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredServices = legalServices.filter(service =>
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
              Legal Services
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Legal and judicial services for citizens
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
              placeholder="Search legal services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            return (
              <div key={service.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(service.priority)}`}>
                    {service.priority} Priority
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{service.description}</p>
                
                <div className="text-xs text-gray-500 mb-4">
                  <div>Processing Time: <span className="font-medium text-gray-700">{service.processingTime}</span></div>
                  <div>Status: <span className={`font-medium ${service.status === 'Available' ? 'text-green-600' : 'text-red-600'}`}>{service.status}</span></div>
                </div>

                <Link 
                  href={`/services/legal-services/${service.id}`}
                  className="inline-flex items-center text-png-red hover:text-red-700 text-sm font-medium transition-colors"
                >
                  Access Service
                  <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                </Link>
              </div>
            )
          })}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 
'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, ArrowLeftIcon, ScaleIcon, DocumentTextIcon, UserIcon, BuildingOfficeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
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
    processingTime: '1-2 weeks',
    requirements: ['Identification Documents', 'Application Form', 'Supporting Evidence', 'Processing Fee'],
    fee: 'K100',
    icon: DocumentTextIcon,
    color: 'bg-blue-500',
    details: 'Legal documents include various certificates, affidavits, and official records required for legal proceedings, business transactions, and personal matters.'
  },
  {
    id: 'court-services',
    name: 'Court Services',
    description: 'Access court services and information',
    status: 'Available',
    priority: 'Medium',
    processingTime: 'Varies by case',
    requirements: ['Case Number', 'Legal Representation', 'Court Filing Fee', 'Supporting Documents'],
    fee: 'Varies',
    icon: ScaleIcon,
    color: 'bg-green-500',
    details: 'Court services include filing cases, accessing court records, scheduling hearings, and obtaining court orders and judgments.'
  },
  {
    id: 'notary-services',
    name: 'Notary Services',
    description: 'Access notary and legalization services',
    status: 'Available',
    priority: 'Low',
    processingTime: 'Same day',
    requirements: ['Original Documents', 'Valid Identification', 'Witnesses (if required)', 'Notary Fee'],
    fee: 'K50',
    icon: ShieldCheckIcon,
    color: 'bg-purple-500',
    details: 'Notary services include document authentication, witnessing signatures, administering oaths, and certifying copies of original documents.'
  },
  {
    id: 'legal-aid',
    name: 'Legal Aid',
    description: 'Apply for legal aid and assistance',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-3 weeks',
    requirements: ['Income Verification', 'Case Details', 'Financial Hardship Proof', 'Application Form'],
    fee: 'Free for eligible',
    icon: UserIcon,
    color: 'bg-orange-500',
    details: 'Legal aid provides free or low-cost legal representation for individuals who cannot afford private legal services. Eligibility is based on income and case type.'
  },
  {
    id: 'property-registration',
    name: 'Property Registration',
    description: 'Register property and legal documents',
    status: 'Available',
    priority: 'High',
    processingTime: '2-4 weeks',
    requirements: ['Property Title Deed', 'Survey Plans', 'Tax Clearance', 'Registration Fee'],
    fee: 'K500',
    icon: BuildingOfficeIcon,
    color: 'bg-red-500',
    details: 'Property registration is essential for establishing legal ownership of land and buildings. This includes residential, commercial, and agricultural properties.'
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
            const IconComponent = service.icon
            return (
              <div key={service.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 rounded-lg ${service.color} text-white mr-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(service.priority)}`}>
                        {service.priority} Priority
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Processing Time:</span>
                      <span className="font-medium">{service.processingTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Fee:</span>
                      <span className="font-medium">{service.fee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${service.status === 'Available' ? 'text-green-600' : 'text-red-600'}`}>
                        {service.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Requirements:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {service.requirements.map((req, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-png-red rounded-full mr-2"></span>
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Details:</h4>
                    <p className="text-sm text-gray-600">{service.details}</p>
                  </div>

                  <Link
                    href={`/services/legal-services/${service.id}`}
                    className="w-full bg-png-red text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-center block"
                  >
                    Apply Now
                  </Link>
                </div>
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
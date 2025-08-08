'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, ArrowLeftIcon, HeartIcon, DocumentTextIcon, ShieldCheckIcon, BeakerIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import ApplyNowButton from '@/components/ApplyNowButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const healthServices = [
  {
    id: 'medical-certificate',
    name: 'Medical Certificate',
    description: 'Request medical certificates and health records',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-3 days',
    requirements: ['Doctor Consultation', 'Medical Examination', 'Patient Identification', 'Medical History'],
    fee: 'K100',
    icon: DocumentTextIcon,
    color: 'bg-blue-500',
    details: 'Medical certificates are required for employment, insurance claims, legal proceedings, and various government applications.'
  },
  {
    id: 'health-insurance',
    name: 'Health Insurance',
    description: 'Apply for health insurance coverage',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-2 weeks',
    requirements: ['National ID', 'Medical Examination', 'Employment Details', 'Family Information'],
    fee: 'Varies',
    icon: ShieldCheckIcon,
    color: 'bg-green-500',
    details: 'Health insurance provides coverage for medical expenses, hospital stays, and prescription medications. Different plans are available based on individual and family needs.'
  },
  {
    id: 'vaccination-records',
    name: 'Vaccination Records',
    description: 'Access vaccination records and certificates',
    status: 'Available',
    priority: 'Low',
    processingTime: '1-2 days',
    requirements: ['Patient Identification', 'Vaccination History', 'Healthcare Provider Details'],
    fee: 'K25',
    icon: BeakerIcon,
    color: 'bg-purple-500',
    details: 'Vaccination records are essential for school enrollment, travel requirements, and maintaining public health standards.'
  },
  {
    id: 'pharmacy-license',
    name: 'Pharmacy License',
    description: 'Apply for pharmacy operating license',
    status: 'Available',
    priority: 'Medium',
    processingTime: '2-4 weeks',
    requirements: ['Qualified Pharmacist', 'Premises Inspection', 'Security Measures', 'Inventory Records'],
    fee: 'K500',
    icon: BeakerIcon,
    color: 'bg-orange-500',
    details: 'Pharmacy licenses are required for businesses that dispense prescription medications and provide pharmaceutical services to the public.'
  },
  {
    id: 'health-permits',
    name: 'Health Permits',
    description: 'Apply for health-related permits',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-3 weeks',
    requirements: ['Business Registration', 'Health Standards Compliance', 'Staff Qualifications', 'Facility Inspection'],
    fee: 'K300',
    icon: HeartIcon,
    color: 'bg-red-500',
    details: 'Health permits are required for businesses in the healthcare sector including clinics, laboratories, and medical equipment suppliers.'
  }
]

export default function HealthServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredServices = healthServices.filter(service =>
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
              Health Services
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Healthcare and medical services for citizens
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
              placeholder="Search health services..."
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

                  <ApplyNowButton
                    href={`/services/health-services/${service.id}`}
                    className="w-full bg-png-red text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-center block"
                  />
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
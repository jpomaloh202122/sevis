'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, ArrowLeftIcon, DocumentTextIcon, UserIcon, HeartIcon, IdentificationIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const citizenServices = [
  {
    id: 'national-id',
    name: 'National ID Application',
    description: 'Apply for or renew your national identification card',
    status: 'Available',
    priority: 'High',
    processingTime: '2-4 weeks',
    requirements: ['Birth Certificate', 'Passport Photo', 'Proof of Address'],
    fee: 'K50',
    icon: IdentificationIcon,
    color: 'bg-blue-500',
    details: 'The National ID is the primary identification document for all Papua New Guinea citizens. It is required for accessing government services, banking, and other official transactions.'
  },
  {
    id: 'birth-certificate',
    name: 'Birth Certificate',
    description: 'Request a copy of your birth certificate',
    status: 'Available',
    priority: 'High',
    processingTime: '1-2 weeks',
    requirements: ['Parent Information', 'Hospital Records', 'Witness Statement'],
    fee: 'K25',
    icon: DocumentTextIcon,
    color: 'bg-green-500',
    details: 'Birth certificates are essential documents required for school enrollment, passport applications, and other government services.'
  },
  {
    id: 'marriage-certificate',
    name: 'Marriage Certificate',
    description: 'Apply for marriage certificate or registration',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-3 weeks',
    requirements: ['Both Partners Present', 'Witnesses', 'Previous Marriage Documents'],
    fee: 'K75',
    icon: HeartIcon,
    color: 'bg-pink-500',
    details: 'Marriage certificates are required for legal recognition of marriage, property rights, and family-related government services.'
  },
  {
    id: 'passport-services',
    name: 'Passport Services',
    description: 'Apply for or renew your passport',
    status: 'Available',
    priority: 'High',
    processingTime: '3-6 weeks',
    requirements: ['National ID', 'Birth Certificate', 'Passport Photos', 'Application Form'],
    fee: 'K200',
    icon: DocumentTextIcon,
    color: 'bg-purple-500',
    details: 'Passports are required for international travel and serve as an alternative form of identification within the country.'
  },
  {
    id: 'voter-registration',
    name: 'Voter Registration',
    description: 'Register to vote in elections',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1 week',
    requirements: ['National ID', 'Proof of Address', 'Age Verification'],
    fee: 'Free',
    icon: UserIcon,
    color: 'bg-orange-500',
    details: 'Voter registration is mandatory for all eligible citizens to participate in national and local elections.'
  },
  {
    id: 'city-pass',
    name: 'City Pass',
    description: 'Apply for city pass for Property Owners, Students, Employees, and Business Persons',
    status: 'Available',
    priority: 'High',
    processingTime: '1-2 weeks',
    requirements: ['National ID', 'Proof of Address', 'Employment/Student/Property Documents', 'Passport Photo'],
    fee: 'K100',
    icon: BuildingOfficeIcon,
    color: 'bg-indigo-500',
    details: 'City Pass provides access to various city services and facilities for residents, students, employees, and business owners. Different categories available based on your status.'
  }
]

export default function CitizenServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredServices = citizenServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  };

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
              Citizen Services
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Essential services for Papua New Guinea citizens
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
              placeholder="Search citizen services..."
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
                    href={`/services/citizen-services/${service.id}`}
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
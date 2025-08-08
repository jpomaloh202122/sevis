'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, ArrowLeftIcon, TruckIcon, DocumentTextIcon, CurrencyDollarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import ApplyNowButton from '@/components/ApplyNowButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const transportationServices = [
  {
    id: 'driver-license',
    name: 'Driver License',
    description: 'Apply for or renew your driver license',
    status: 'Available',
    priority: 'High',
    processingTime: '2-3 weeks',
    requirements: ['National ID', 'Medical Certificate', 'Driving Test', 'Eye Test', 'Application Fee'],
    fee: 'K150',
    icon: TruckIcon,
    color: 'bg-blue-500',
    details: 'Driver licenses are required for operating motor vehicles on public roads. Different classes are available for various vehicle types including motorcycles, cars, and commercial vehicles.'
  },
  {
    id: 'vehicle-registration',
    name: 'Vehicle Registration',
    description: 'Register your vehicle with the government',
    status: 'Available',
    priority: 'High',
    processingTime: '1-2 weeks',
    requirements: ['Vehicle Ownership Documents', 'Insurance Certificate', 'Roadworthiness Certificate', 'Import Documents'],
    fee: 'K200',
    icon: TruckIcon,
    color: 'bg-green-500',
    details: 'Vehicle registration is mandatory for all motor vehicles operating on public roads. This includes cars, motorcycles, trucks, and commercial vehicles.'
  },
  {
    id: 'road-tax-payment',
    name: 'Road Tax Payment',
    description: 'Pay road tax and vehicle fees',
    status: 'Available',
    priority: 'Medium',
    processingTime: 'Immediate',
    requirements: ['Vehicle Registration', 'Previous Tax Receipt', 'Vehicle Inspection Certificate'],
    fee: 'Varies by vehicle type',
    icon: CurrencyDollarIcon,
    color: 'bg-purple-500',
    details: 'Road tax is an annual fee required for all registered vehicles. The amount varies based on vehicle type, engine capacity, and usage.'
  },
  {
    id: 'transport-permits',
    name: 'Transport Permits',
    description: 'Apply for transport and logistics permits',
    status: 'Available',
    priority: 'Medium',
    processingTime: '1-3 weeks',
    requirements: ['Business Registration', 'Vehicle Fleet Details', 'Driver Qualifications', 'Safety Standards Compliance'],
    fee: 'K500',
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
    fee: 'Varies by violation',
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
                    href={`/services/transportation/${service.id}`}
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
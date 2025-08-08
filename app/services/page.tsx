'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import ApplyNowButton from '@/components/ApplyNowButton'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const allServices = [
  // Citizen Services
  { name: 'National ID Application', category: 'Citizen Services', description: 'Apply for or renew your national identification card', status: 'Available', priority: 'High' },
  { name: 'Birth Certificate', category: 'Citizen Services', description: 'Request a copy of your birth certificate', status: 'Available', priority: 'High' },
  { name: 'Marriage Certificate', category: 'Citizen Services', description: 'Apply for marriage certificate or registration', status: 'Available', priority: 'Medium' },
  { name: 'Passport Services', category: 'Citizen Services', description: 'Apply for or renew your passport', status: 'Available', priority: 'High' },
  { name: 'Voter Registration', category: 'Citizen Services', description: 'Register to vote in elections', status: 'Available', priority: 'Medium' },
  { name: 'City Pass', category: 'Citizen Services', description: 'Apply for city pass for Property Owners, Students, Employees, and Business Persons', status: 'Available', priority: 'High' },
  
  // Business Services
  { name: 'Business Registration', category: 'Business & Commerce', description: 'Register your business with the government', status: 'Available', priority: 'High' },
  { name: 'Trade License', category: 'Business & Commerce', description: 'Apply for trade and business licenses', status: 'Available', priority: 'High' },
  { name: 'Import/Export Permits', category: 'Business & Commerce', description: 'Apply for import and export permits', status: 'Available', priority: 'Medium' },
  { name: 'Company Registration', category: 'Business & Commerce', description: 'Register a new company or corporation', status: 'Available', priority: 'High' },
  { name: 'Tax Registration', category: 'Business & Commerce', description: 'Register for tax purposes', status: 'Available', priority: 'High' },
  
  // Health Services
  { name: 'Medical Certificate', category: 'Health Services', description: 'Request medical certificates and health records', status: 'Available', priority: 'Medium' },
  { name: 'Health Insurance', category: 'Health Services', description: 'Apply for health insurance coverage', status: 'Available', priority: 'Medium' },
  { name: 'Vaccination Records', category: 'Health Services', description: 'Access vaccination records and certificates', status: 'Available', priority: 'Low' },
  { name: 'Pharmacy License', category: 'Health Services', description: 'Apply for pharmacy operating license', status: 'Available', priority: 'Medium' },
  { name: 'Health Permits', category: 'Health Services', description: 'Apply for health-related permits', status: 'Available', priority: 'Medium' },
  
  // Transportation
  { name: 'Driver License', category: 'Transportation', description: 'Apply for or renew your driver license', status: 'Available', priority: 'High' },
  { name: 'Vehicle Registration', category: 'Transportation', description: 'Register your vehicle with the government', status: 'Available', priority: 'High' },
  { name: 'Road Tax Payment', category: 'Transportation', description: 'Pay road tax and vehicle fees', status: 'Available', priority: 'Medium' },
  { name: 'Transport Permits', category: 'Transportation', description: 'Apply for transport and logistics permits', status: 'Available', priority: 'Medium' },
  { name: 'Traffic Fines', category: 'Transportation', description: 'Pay traffic fines and violations', status: 'Available', priority: 'Medium' },
  
  // Legal Services
  { name: 'Legal Documents', category: 'Legal Services', description: 'Request legal documents and certificates', status: 'Available', priority: 'Medium' },
  { name: 'Court Services', category: 'Legal Services', description: 'Access court services and information', status: 'Available', priority: 'Medium' },
  { name: 'Notary Services', category: 'Legal Services', description: 'Access notary and legalization services', status: 'Available', priority: 'Low' },
  { name: 'Legal Aid', category: 'Legal Services', description: 'Apply for legal aid and assistance', status: 'Available', priority: 'Medium' },
  { name: 'Property Registration', category: 'Legal Services', description: 'Register property and legal documents', status: 'Available', priority: 'High' },
]

const categories = ['All', 'Citizen Services', 'Business & Commerce', 'Health Services', 'Transportation', 'Legal Services']

export default function ServicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredServices = allServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Government Services
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Browse and access all available government services
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for services..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Links */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Link href="/services/citizen-services" className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">C</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Citizen Services</span>
            </Link>
            <Link href="/services/business-commerce" className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">B</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Business & Commerce</span>
            </Link>
            <Link href="/services/health-services" className="flex items-center p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">H</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Health Services</span>
            </Link>
            <Link href="/services/transportation" className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">T</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Transportation</span>
            </Link>
            <Link href="/services/legal-services" className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <span className="text-sm font-medium text-gray-900">Legal Services</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredServices.length} of {allServices.length} services
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredServices.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    <div className="flex space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(service.priority)}`}>
                        {service.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">
                    {service.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {service.category}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <ApplyNowButton
                    href={service.name === 'City Pass' ? '/services/citizen-services/city-pass' : `/services/${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-block px-4 py-2 bg-png-red text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Access Service
                  </ApplyNowButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  )
} 
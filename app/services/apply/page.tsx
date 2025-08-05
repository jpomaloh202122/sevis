'use client'

import { useState } from 'react'
import { 
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const serviceTypes = [
  { id: 'business-registration', name: 'Business Registration', description: 'Register a new business entity' },
  { id: 'driver-license', name: 'Driver License Renewal', description: 'Renew your driver license' },
  { id: 'national-id', name: 'National ID Application', description: 'Apply for National ID' },
  { id: 'tax-registration', name: 'Tax Registration', description: 'Register for tax purposes' },
  { id: 'building-permit', name: 'Building Permit', description: 'Apply for building construction permit' },
]

export default function ServiceApplicationPage() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState('')
  const [formData, setFormData] = useState({
    serviceType: '',
    businessName: '',
    businessType: '',
    address: '',
    phone: '',
    email: '',
    documents: [] as File[],
    additionalInfo: ''
  })
  const { user } = useAuth()

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId)
    setFormData(prev => ({ ...prev, serviceType: serviceId }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, documents: Array.from(e.target.files!) }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Application submitted:', formData)
    setStep(3) // Show success step
  }

  const nextStep = () => {
    if (step === 1 && selectedService) {
      setStep(2)
    }
  }

  const prevStep = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-png-red text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className={`text-sm ${step >= 1 ? 'text-png-red' : 'text-gray-500'}`}>
                Select Service
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-png-red text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm ${step >= 2 ? 'text-png-red' : 'text-gray-500'}`}>
                Fill Details
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-300 mx-4"></div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-png-red text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <span className={`text-sm ${step >= 3 ? 'text-png-red' : 'text-gray-500'}`}>
                Submit
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Service</h2>
              <p className="text-gray-600">Choose the government service you would like to apply for</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviceTypes.map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedService === service.id
                      ? 'border-png-red bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <DocumentTextIcon className="h-6 w-6 text-png-red mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <Link
                href="/services"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Services
              </Link>
              <button
                onClick={nextStep}
                disabled={!selectedService}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Application Form */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Details</h2>
              <p className="text-gray-600">Please provide the required information for your application</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                    Business/Organization Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-png-red focus:outline-none focus:ring-png-red"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                    Business Type
                  </label>
                  <select
                    id="businessType"
                    name="businessType"
                    value={formData.businessType}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-png-red focus:outline-none focus:ring-png-red"
                    required
                  >
                    <option value="">Select business type</option>
                    <option value="sole-proprietorship">Sole Proprietorship</option>
                    <option value="partnership">Partnership</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">Limited Liability Company</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-png-red focus:outline-none focus:ring-png-red"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-png-red focus:outline-none focus:ring-png-red"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-png-red focus:outline-none focus:ring-png-red"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="documents" className="block text-sm font-medium text-gray-700">
                  Required Documents
                </label>
                <input
                  type="file"
                  id="documents"
                  name="documents"
                  multiple
                  onChange={handleFileChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-png-red focus:outline-none focus:ring-png-red"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Upload required documents (PDF, DOC, or images). Maximum 5 files.
                </p>
              </div>
              
              <div>
                <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700">
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  rows={4}
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:border-png-red focus:outline-none focus:ring-png-red"
                  placeholder="Any additional information or special requirements..."
                />
              </div>
              
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="mb-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
              <p className="text-gray-600">
                Your application has been successfully submitted. You will receive a confirmation email shortly.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Application Details</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Application ID:</strong> APP-{Date.now().toString().slice(-6)}</p>
                <p><strong>Service:</strong> {serviceTypes.find(s => s.id === selectedService)?.name}</p>
                <p><strong>Submitted:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Status:</strong> Pending Review</p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-png-red hover:bg-red-700"
              >
                View Dashboard
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Apply for Another Service
              </Link>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 
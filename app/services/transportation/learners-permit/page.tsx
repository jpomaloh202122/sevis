'use client'

import { useState } from 'react'
import { ArrowLeftIcon, DocumentArrowUpIcon, UserIcon, IdentificationIcon, CameraIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SuccessModal from '@/components/SuccessModal'
import { useAuth } from '@/contexts/AuthContext'

interface FormData {
  personalInfo: {
    fullName: string
    dateOfBirth: string
    placeOfBirth: string
    nationalId: string
    phoneNumber: string
    email: string
    address: string
    emergencyContactName: string
    emergencyContactPhone: string
  }
  documents: {
    nationalIdCopy: File | null
    birthCertificate: File | null
    medicalCertificate: File | null
    passportPhoto: File | null
    eyeTestCertificate: File | null
    parentalConsent: File | null
  }
  declarations: {
    termsAccepted: boolean
    informationAccurate: boolean
    medicalFitness: boolean
  }
}

export default function LearnersPermitApplication() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    referenceNumber: string
    applicationId: string
  } | null>(null)
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {
      fullName: user?.name || '',
      dateOfBirth: '',
      placeOfBirth: '',
      nationalId: user?.nationalId || '',
      phoneNumber: user?.phone || '',
      email: user?.email || '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: ''
    },
    documents: {
      nationalIdCopy: null,
      birthCertificate: null,
      medicalCertificate: null,
      passportPhoto: null,
      eyeTestCertificate: null,
      parentalConsent: null
    },
    declarations: {
      termsAccepted: false,
      informationAccurate: false,
      medicalFitness: false
    }
  })

  const handleInputChange = (section: keyof FormData, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [field]: file
      }
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const applicationData = new FormData()
      
      // Add personal information
      Object.entries(formData.personalInfo).forEach(([key, value]) => {
        applicationData.append(`personalInfo[${key}]`, value)
      })
      
      // Add documents
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) {
          applicationData.append(key, file)
        }
      })
      
      // Add declarations
      Object.entries(formData.declarations).forEach(([key, value]) => {
        applicationData.append(`declarations[${key}]`, value.toString())
      })
      
      // Add service type
      applicationData.append('serviceType', 'learners-permit')
      
      const response = await fetch('/api/applications', {
        method: 'POST',
        body: applicationData
      })
      
      if (response.ok) {
        const result = await response.json()
        setSubmissionResult({
          referenceNumber: result.referenceNumber,
          applicationId: result.applicationId
        })
        setShowSuccessModal(true)
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        throw new Error(errorData.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      alert('Error submitting application. Please try again.')
    }
    
    setIsSubmitting(false)
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <UserIcon className="w-5 h-5 mr-2 text-png-red" />
        Personal Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.personalInfo.fullName}
            onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Place of Birth *
          </label>
          <input
            type="text"
            value={formData.personalInfo.placeOfBirth}
            onChange={(e) => handleInputChange('personalInfo', 'placeOfBirth', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            National ID Number *
          </label>
          <input
            type="text"
            value={formData.personalInfo.nationalId}
            onChange={(e) => handleInputChange('personalInfo', 'nationalId', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            value={formData.personalInfo.phoneNumber}
            onChange={(e) => handleInputChange('personalInfo', 'phoneNumber', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={formData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Residential Address *
        </label>
        <textarea
          value={formData.personalInfo.address}
          onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Name *
          </label>
          <input
            type="text"
            value={formData.personalInfo.emergencyContactName}
            onChange={(e) => handleInputChange('personalInfo', 'emergencyContactName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Emergency Contact Phone *
          </label>
          <input
            type="tel"
            value={formData.personalInfo.emergencyContactPhone}
            onChange={(e) => handleInputChange('personalInfo', 'emergencyContactPhone', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-png-red" />
        Required Documents
      </h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Document Requirements:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All documents must be clear and legible</li>
          <li>• Maximum file size: 5MB per document</li>
          <li>• Accepted formats: PDF, JPG, PNG</li>
          <li>• For minors (under 18), parental consent is required</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'nationalIdCopy', label: 'National ID Copy', required: true },
          { key: 'birthCertificate', label: 'Birth Certificate', required: true },
          { key: 'medicalCertificate', label: 'Medical Certificate', required: true },
          { key: 'passportPhoto', label: 'Passport Photo', required: true },
          { key: 'eyeTestCertificate', label: 'Eye Test Certificate', required: true },
          { key: 'parentalConsent', label: 'Parental Consent (if under 18)', required: false }
        ].map((doc) => (
          <div key={doc.key}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {doc.label} {doc.required && '*'}
            </label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload(doc.key, e.target.files?.[0] || null)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              required={doc.required}
            />
            {formData.documents[doc.key as keyof typeof formData.documents] && (
              <p className="text-sm text-green-600 mt-1">
                ✓ File uploaded: {formData.documents[doc.key as keyof typeof formData.documents]?.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <IdentificationIcon className="w-5 h-5 mr-2 text-png-red" />
        Review & Declarations
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Application Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Name:</strong> {formData.personalInfo.fullName}</p>
            <p><strong>Date of Birth:</strong> {formData.personalInfo.dateOfBirth}</p>
            <p><strong>National ID:</strong> {formData.personalInfo.nationalId}</p>
            <p><strong>Phone:</strong> {formData.personalInfo.phoneNumber}</p>
          </div>
          <div>
            <p><strong>Email:</strong> {formData.personalInfo.email}</p>
            <p><strong>Emergency Contact:</strong> {formData.personalInfo.emergencyContactName}</p>
            <p><strong>Emergency Phone:</strong> {formData.personalInfo.emergencyContactPhone}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms"
            checked={formData.declarations.termsAccepted}
            onChange={(e) => handleInputChange('declarations', 'termsAccepted', e.target.checked)}
            className="mt-1 mr-3"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I agree to the terms and conditions for learner's permit application and understand that providing false information is a criminal offense. *
          </label>
        </div>
        
        <div className="flex items-start">
          <input
            type="checkbox"
            id="accuracy"
            checked={formData.declarations.informationAccurate}
            onChange={(e) => handleInputChange('declarations', 'informationAccurate', e.target.checked)}
            className="mt-1 mr-3"
            required
          />
          <label htmlFor="accuracy" className="text-sm text-gray-700">
            I declare that all information provided is accurate and complete to the best of my knowledge. *
          </label>
        </div>
        
        <div className="flex items-start">
          <input
            type="checkbox"
            id="medical"
            checked={formData.declarations.medicalFitness}
            onChange={(e) => handleInputChange('declarations', 'medicalFitness', e.target.checked)}
            className="mt-1 mr-3"
            required
          />
          <label htmlFor="medical" className="text-sm text-gray-700">
            I declare that I am medically fit to operate a motor vehicle and have no conditions that would impair my driving ability. *
          </label>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Important Notes:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Processing time: 2-3 weeks from application submission</li>
          <li>• Application fee: K100 (payable upon approval)</li>
          <li>• You will be contacted to schedule your written and practical tests</li>
          <li>• Your learner's permit will be valid for 12 months</li>
        </ul>
      </div>
    </div>
  )

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-8">Please log in to apply for a learner's permit.</p>
          <div className="space-y-4">
            <Link href="/login" className="block bg-png-red text-white px-6 py-2 rounded-lg hover:bg-red-700">
              Log In
            </Link>
            <Link href="/register" className="block bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300">
              Create Account
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Debug: Log current user info
  console.log('Current user:', { id: user.id, email: user.email, name: user.name })

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <Link href="/services/transportation" className="flex items-center text-png-red hover:text-red-700 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Transportation Services
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Learner's Permit Application</h1>
            <p className="mt-2 text-lg text-gray-600">Apply for your learner's driving permit</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber ? 'bg-png-red text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {stepNumber}
                    </div>
                    <div className={`ml-2 text-sm ${step >= stepNumber ? 'text-png-red' : 'text-gray-500'}`}>
                      {stepNumber === 1 ? 'Personal Info' : stepNumber === 2 ? 'Documents' : 'Review'}
                    </div>
                    {stepNumber < 3 && <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="ml-auto px-6 py-2 bg-png-red text-white rounded-lg hover:bg-red-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.declarations.termsAccepted || !formData.declarations.informationAccurate || !formData.declarations.medicalFitness}
                  className="ml-auto px-6 py-2 bg-png-red text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      
      {/* Success Modal */}
      {submissionResult && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Application Submitted Successfully!"
          message="Your learner's permit application has been received and is being processed."
          referenceNumber={submissionResult.referenceNumber}
          applicationId={submissionResult.applicationId}
          processingTime="2-3 weeks"
          nextSteps={[
            'Document verification will begin within 2 business days',
            'You will be contacted for any additional information needed',
            'Once documents are verified, you will be scheduled for written and practical tests',
            'Your learner\'s permit will be issued upon successful completion of all requirements'
          ]}
        />
      )}
    </div>
  )
}
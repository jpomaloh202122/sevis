'use client'

import { useState } from 'react'
import { ArrowLeftIcon, DocumentArrowUpIcon, UserIcon, IdentificationIcon, TruckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SuccessModal from '@/components/SuccessModal'
import { useAuth } from '@/contexts/AuthContext'

interface FormData {
  licenseType: 'provisional' | 'full' | ''
  licenseClass: string
  licensePeriod: string
  personalInfo: {
    surname: string
    givenNames: string
    residentialAddress: {
      section: string
      lot: string
      street: string
      suburb: string
    }
    postalAddress: {
      address: string
      town: string
      province: string
    }
    phoneDay: string
    mobile: string
    gender: 'Male' | 'Female' | ''
    dateOfBirth: string
    placeOfBirth: {
      village: string
      province: string
      town: string
      country: string
    }
    nationality: string
    height: string
    eyeColour: string
    hairColour: string
    complexion: string
  }
  previousLicense: {
    oldLicenseNumber: string
    dateOfIssue: string
    placeOfIssue: string
  }
  foreignLicense: {
    hasForeignLicense: boolean
    countryOfIssue: string
    licenseNumber: string
    dateOfExpiry: string
    equivalentPNGClass: string
  }
  healthAndHistory: {
    healthAffectsDriving: boolean
    refusedLicense: boolean
    licensesCancelledSuspended: boolean
    convictedDrinkDriving: boolean
    convictedTrafficOffence: boolean
    healthAffectsDrivingDetails: string
    refusedLicenseDetails: string
    licensesCancelledSuspendedDetails: string
    convictedDrinkDrivingDetails: string
    convictedTrafficOffenceDetails: string
  }
  documents: {
    nationalIdCopy: File | null
    birthCertificate: File | null
    medicalCertificate: File | null
    passportPhoto: File | null
    eyeTestCertificate: File | null
    previousLicenseCopy: File | null
    foreignLicenseCopy: File | null
    proofOfAddress: File | null
    witnessIdCopy: File | null
  }
  witness: {
    name: string
    address: string
  }
  declarations: {
    informationAccurate: boolean
    understandPenalties: boolean
  }
}

const licenseClasses = [
  { value: 'A', label: 'Class A - Motorcycle' },
  { value: 'B', label: 'Class B - Motor Car' },
  { value: 'C', label: 'Class C - Light Truck' },
  { value: 'D', label: 'Class D - Heavy Truck' },
  { value: 'E', label: 'Class E - Bus/Passenger Vehicle' }
]

export default function DriversLicenseApplication() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submissionResult, setSubmissionResult] = useState<{
    referenceNumber: string
    applicationId: string
  } | null>(null)

  const [formData, setFormData] = useState<FormData>({
    licenseType: '',
    licenseClass: '',
    licensePeriod: '1',
    personalInfo: {
      surname: user?.name?.split(' ')[0] || '',
      givenNames: user?.name?.split(' ').slice(1).join(' ') || '',
      residentialAddress: {
        section: '',
        lot: '',
        street: '',
        suburb: ''
      },
      postalAddress: {
        address: '',
        town: '',
        province: ''
      },
      phoneDay: '',
      mobile: user?.phone || '',
      gender: '',
      dateOfBirth: '',
      placeOfBirth: {
        village: '',
        province: '',
        town: '',
        country: 'Papua New Guinea'
      },
      nationality: 'Papua New Guinea',
      height: '',
      eyeColour: '',
      hairColour: '',
      complexion: ''
    },
    previousLicense: {
      oldLicenseNumber: '',
      dateOfIssue: '',
      placeOfIssue: ''
    },
    foreignLicense: {
      hasForeignLicense: false,
      countryOfIssue: '',
      licenseNumber: '',
      dateOfExpiry: '',
      equivalentPNGClass: ''
    },
    healthAndHistory: {
      healthAffectsDriving: false,
      refusedLicense: false,
      licensesCancelledSuspended: false,
      convictedDrinkDriving: false,
      convictedTrafficOffence: false,
      healthAffectsDrivingDetails: '',
      refusedLicenseDetails: '',
      licensesCancelledSuspendedDetails: '',
      convictedDrinkDrivingDetails: '',
      convictedTrafficOffenceDetails: ''
    },
    documents: {
      nationalIdCopy: null,
      birthCertificate: null,
      medicalCertificate: null,
      passportPhoto: null,
      eyeTestCertificate: null,
      previousLicenseCopy: null,
      foreignLicenseCopy: null,
      proofOfAddress: null,
      witnessIdCopy: null
    },
    witness: {
      name: '',
      address: ''
    },
    declarations: {
      informationAccurate: false,
      understandPenalties: false
    }
  })

  const handleInputChange = (section: keyof FormData, field: string, value: any, subField?: string) => {
    setFormData(prev => {
      if (subField) {
        const sectionData = prev[section] as any
        const fieldData = sectionData[field] as any
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [field]: {
              ...fieldData,
              [subField]: value
            }
          }
        }
      } else {
        return {
          ...prev,
          [section]: {
            ...(prev[section] as any),
            [field]: value
          }
        }
      }
    })
  }

  const handleTopLevelChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
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

  const getRequiredDocuments = () => {
    const baseDocuments = [
      'nationalIdCopy',
      'birthCertificate', 
      'medicalCertificate',
      'passportPhoto',
      'eyeTestCertificate',
      'proofOfAddress',
      'witnessIdCopy'
    ]

    if (formData.previousLicense.oldLicenseNumber) {
      baseDocuments.push('previousLicenseCopy')
    }

    // Foreign license copy only required for non-PNG citizens who have a foreign license
    if (formData.foreignLicense.hasForeignLicense && formData.personalInfo.nationality !== 'Papua New Guinea') {
      baseDocuments.push('foreignLicenseCopy')
    }

    return baseDocuments
  }

  const getProcessingInfo = () => {
    if (formData.licenseType === 'provisional') {
      return {
        // fee: 'K200', // Removed fees
        processingTime: '3-4 weeks',
        description: 'Provisional License Application'
      }
    } else {
      return {
        // fee: 'K300', // Removed fees
        processingTime: '4-6 weeks', 
        description: 'Full Driver\'s License Application'
      }
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      const applicationData = new FormData()
      
      // Add form data
      applicationData.append('serviceType', 'drivers-license')
      applicationData.append('licenseType', formData.licenseType)
      applicationData.append('licenseClass', formData.licenseClass)
      applicationData.append('licensePeriod', formData.licensePeriod)
      
      // Add personal information
      Object.entries(formData.personalInfo).forEach(([key, value]) => {
        if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            applicationData.append(`personalInfo[${key}][${subKey}]`, subValue as string)
          })
        } else {
          applicationData.append(`personalInfo[${key}]`, value as string)
        }
      })
      
      // Add other sections
      Object.entries(formData.previousLicense).forEach(([key, value]) => {
        applicationData.append(`previousLicense[${key}]`, value)
      })
      
      Object.entries(formData.foreignLicense).forEach(([key, value]) => {
        applicationData.append(`foreignLicense[${key}]`, value.toString())
      })
      
      Object.entries(formData.healthAndHistory).forEach(([key, value]) => {
        applicationData.append(`healthAndHistory[${key}]`, value.toString())
      })
      
      Object.entries(formData.witness).forEach(([key, value]) => {
        applicationData.append(`witness[${key}]`, value)
      })
      
      Object.entries(formData.declarations).forEach(([key, value]) => {
        applicationData.append(`declarations[${key}]`, value.toString())
      })
      
      // Add user ID from authenticated user
      if (!user?.id) {
        alert('User not authenticated. Please log in again.')
        return
      }
      console.log('Frontend: Submitting driver license application for user:', {
        id: user.id,
        name: user.name,
        email: user.email
      })
      applicationData.append('userId', user.id)
      
      // Add documents
      Object.entries(formData.documents).forEach(([key, file]) => {
        if (file) {
          applicationData.append(key, file)
        }
      })
      
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
        <TruckIcon className="w-5 h-5 mr-2 text-png-red" />
        License Type & Class Selection
      </h3>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">License Information:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Provisional License:</strong> For new drivers who have passed written and practical tests</li>
          <li>• <strong>Full License:</strong> For experienced drivers upgrading from provisional or with foreign license</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type of License Applied For *
          </label>
          <select
            value={formData.licenseType}
            onChange={(e) => handleTopLevelChange('licenseType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          >
            <option value="">Select license type</option>
            <option value="provisional">Provisional License</option>
            <option value="full">Full Driver's License</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            License Class *
          </label>
          <select
            value={formData.licenseClass}
            onChange={(e) => handleTopLevelChange('licenseClass', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          >
            <option value="">Select license class</option>
            {licenseClasses.map((cls) => (
              <option key={cls.value} value={cls.value}>{cls.label}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Period of License (Years) *
          </label>
          <select
            value={formData.licensePeriod}
            onChange={(e) => handleTopLevelChange('licensePeriod', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          >
            <option value="1">1 Year</option>
            <option value="2">2 Years</option>
            <option value="3">3 Years</option>
            <option value="5">5 Years</option>
          </select>
        </div>
      </div>

      {formData.licenseType && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 mb-2">Selected: {getProcessingInfo().description}</h4>
          <div className="text-sm text-green-800">
            {/* Fee information removed */}
            <p><strong>Processing Time:</strong> {getProcessingInfo().processingTime}</p>
          </div>
        </div>
      )}
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <UserIcon className="w-5 h-5 mr-2 text-png-red" />
        Personal Information
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Surname/Family Name *
          </label>
          <input
            type="text"
            value={formData.personalInfo.surname}
            onChange={(e) => handleInputChange('personalInfo', 'surname', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Given Names *
          </label>
          <input
            type="text"
            value={formData.personalInfo.givenNames}
            onChange={(e) => handleInputChange('personalInfo', 'givenNames', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Residential Address */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Residential and Street Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
            <input
              type="text"
              value={formData.personalInfo.residentialAddress.section}
              onChange={(e) => handleInputChange('personalInfo', 'residentialAddress', e.target.value, 'section')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lot</label>
            <input
              type="text"
              value={formData.personalInfo.residentialAddress.lot}
              onChange={(e) => handleInputChange('personalInfo', 'residentialAddress', e.target.value, 'lot')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Street *</label>
            <input
              type="text"
              value={formData.personalInfo.residentialAddress.street}
              onChange={(e) => handleInputChange('personalInfo', 'residentialAddress', e.target.value, 'street')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Suburb *</label>
            <input
              type="text"
              value={formData.personalInfo.residentialAddress.suburb}
              onChange={(e) => handleInputChange('personalInfo', 'residentialAddress', e.target.value, 'suburb')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Postal Address */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Postal Address</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Postal Address</label>
            <input
              type="text"
              value={formData.personalInfo.postalAddress.address}
              onChange={(e) => handleInputChange('personalInfo', 'postalAddress', e.target.value, 'address')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Town</label>
            <input
              type="text"
              value={formData.personalInfo.postalAddress.town}
              onChange={(e) => handleInputChange('personalInfo', 'postalAddress', e.target.value, 'town')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
            <input
              type="text"
              value={formData.personalInfo.postalAddress.province}
              onChange={(e) => handleInputChange('personalInfo', 'postalAddress', e.target.value, 'province')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contact and Personal Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Day)</label>
          <input
            type="tel"
            value={formData.personalInfo.phoneDay}
            onChange={(e) => handleInputChange('personalInfo', 'phoneDay', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile *</label>
          <input
            type="tel"
            value={formData.personalInfo.mobile}
            onChange={(e) => handleInputChange('personalInfo', 'mobile', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
          <select
            value={formData.personalInfo.gender}
            onChange={(e) => handleInputChange('personalInfo', 'gender', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
          <input
            type="date"
            value={formData.personalInfo.dateOfBirth}
            onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
      </div>

      {/* Place of Birth */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">Place of Birth</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Village</label>
            <input
              type="text"
              value={formData.personalInfo.placeOfBirth.village}
              onChange={(e) => handleInputChange('personalInfo', 'placeOfBirth', e.target.value, 'village')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Province</label>
            <input
              type="text"
              value={formData.personalInfo.placeOfBirth.province}
              onChange={(e) => handleInputChange('personalInfo', 'placeOfBirth', e.target.value, 'province')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Town</label>
            <input
              type="text"
              value={formData.personalInfo.placeOfBirth.town}
              onChange={(e) => handleInputChange('personalInfo', 'placeOfBirth', e.target.value, 'town')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
            <input
              type="text"
              value={formData.personalInfo.placeOfBirth.country}
              onChange={(e) => handleInputChange('personalInfo', 'placeOfBirth', e.target.value, 'country')}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Physical Characteristics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nationality *</label>
          <input
            type="text"
            value={formData.personalInfo.nationality}
            onChange={(e) => handleInputChange('personalInfo', 'nationality', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm) *</label>
          <input
            type="number"
            value={formData.personalInfo.height}
            onChange={(e) => handleInputChange('personalInfo', 'height', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Eye Colour *</label>
          <input
            type="text"
            value={formData.personalInfo.eyeColour}
            onChange={(e) => handleInputChange('personalInfo', 'eyeColour', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hair Colour *</label>
          <input
            type="text"
            value={formData.personalInfo.hairColour}
            onChange={(e) => handleInputChange('personalInfo', 'hairColour', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Complexion *</label>
          <input
            type="text"
            value={formData.personalInfo.complexion}
            onChange={(e) => handleInputChange('personalInfo', 'complexion', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <ExclamationTriangleIcon className="w-5 h-5 mr-2 text-png-red" />
        Health & Driving History
      </h3>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Important:</h4>
        <p className="text-sm text-yellow-800">
          Please answer all questions truthfully. Providing false information is a criminal offense and may result in license refusal or cancellation.
        </p>
      </div>

      <div className="space-y-6">
        {/* Health Question */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">
                Is there anything wrong with your health that may affect your safe driving?
              </h4>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="healthAffectsDriving"
                    checked={formData.healthAndHistory.healthAffectsDriving === true}
                    onChange={() => handleInputChange('healthAndHistory', 'healthAffectsDriving', true)}
                    className="form-radio text-png-red"
                  />
                  <span className="ml-2 text-sm text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="healthAffectsDriving"
                    checked={formData.healthAndHistory.healthAffectsDriving === false}
                    onChange={() => handleInputChange('healthAndHistory', 'healthAffectsDriving', false)}
                    className="form-radio text-png-red"
                  />
                  <span className="ml-2 text-sm text-gray-700">No</span>
                </label>
              </div>
              {formData.healthAndHistory.healthAffectsDriving && (
                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please provide details:
                  </label>
                  <textarea
                    value={formData.healthAndHistory.healthAffectsDrivingDetails}
                    onChange={(e) => handleInputChange('healthAndHistory', 'healthAffectsDrivingDetails', e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
                    required={formData.healthAndHistory.healthAffectsDriving}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar structure for other questions */}
        {[
          {
            key: 'refusedLicense',
            detailsKey: 'refusedLicenseDetails',
            question: "Have you ever been refused a learner's permit or driver's licence anywhere?"
          },
          {
            key: 'licensesCancelledSuspended', 
            detailsKey: 'licensesCancelledSuspendedDetails',
            question: "Has your driver's licence ever been cancelled or suspended?"
          },
          {
            key: 'convictedDrinkDriving',
            detailsKey: 'convictedDrinkDrivingDetails', 
            question: "Have you ever been convicted of driving under the influence of intoxicating liquor (drink driving) or driving under the influence of drugs?"
          },
          {
            key: 'convictedTrafficOffence',
            detailsKey: 'convictedTrafficOffenceDetails',
            question: "Have you ever been convicted of any traffic offence other than parking?"
          }
        ].map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{item.question}</h4>
                <div className="mt-2 space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={item.key}
                      checked={formData.healthAndHistory[item.key as keyof typeof formData.healthAndHistory] === true}
                      onChange={() => handleInputChange('healthAndHistory', item.key, true)}
                      className="form-radio text-png-red"
                    />
                    <span className="ml-2 text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name={item.key}
                      checked={formData.healthAndHistory[item.key as keyof typeof formData.healthAndHistory] === false}
                      onChange={() => handleInputChange('healthAndHistory', item.key, false)}
                      className="form-radio text-png-red"
                    />
                    <span className="ml-2 text-sm text-gray-700">No</span>
                  </label>
                </div>
                {formData.healthAndHistory[item.key as keyof typeof formData.healthAndHistory] && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please provide details:
                    </label>
                    <textarea
                      value={formData.healthAndHistory[item.detailsKey as keyof typeof formData.healthAndHistory] as string}
                      onChange={(e) => handleInputChange('healthAndHistory', item.detailsKey, e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
                      required={formData.healthAndHistory[item.key as keyof typeof formData.healthAndHistory] === true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Foreign License Section - Only for non-PNG citizens */}
        {formData.personalInfo.nationality !== 'Papua New Guinea' && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-4">Foreign Driver's License (Required for Non-Citizens)</h4>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> As a non-PNG citizen, you must provide details of any foreign driver's license you hold. This is required for license conversion and verification purposes.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.foreignLicense.hasForeignLicense}
                  onChange={(e) => handleInputChange('foreignLicense', 'hasForeignLicense', e.target.checked)}
                  className="form-checkbox text-png-red"
                />
                <span className="ml-2 text-sm text-gray-700">I hold a foreign driver's license</span>
              </label>
            </div>

          {formData.foreignLicense.hasForeignLicense && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country of Issue *</label>
                <input
                  type="text"
                  value={formData.foreignLicense.countryOfIssue}
                  onChange={(e) => handleInputChange('foreignLicense', 'countryOfIssue', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
                  required={formData.foreignLicense.hasForeignLicense}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">License Number *</label>
                <input
                  type="text"
                  value={formData.foreignLicense.licenseNumber}
                  onChange={(e) => handleInputChange('foreignLicense', 'licenseNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
                  required={formData.foreignLicense.hasForeignLicense}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Expiry *</label>
                <input
                  type="date"
                  value={formData.foreignLicense.dateOfExpiry}
                  onChange={(e) => handleInputChange('foreignLicense', 'dateOfExpiry', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
                  required={formData.foreignLicense.hasForeignLicense}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Equivalent PNG Class *</label>
                <select
                  value={formData.foreignLicense.equivalentPNGClass}
                  onChange={(e) => handleInputChange('foreignLicense', 'equivalentPNGClass', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
                  required={formData.foreignLicense.hasForeignLicense}
                >
                  <option value="">Select PNG class</option>
                  {licenseClasses.map((cls) => (
                    <option key={cls.value} value={cls.value}>{cls.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          </div>
        )}

        {/* Previous License Section */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-gray-900 mb-4">Previous License (if renewing/upgrading)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Old License Number</label>
              <input
                type="text"
                value={formData.previousLicense.oldLicenseNumber}
                onChange={(e) => handleInputChange('previousLicense', 'oldLicenseNumber', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date of Issue</label>
              <input
                type="date"
                value={formData.previousLicense.dateOfIssue}
                onChange={(e) => handleInputChange('previousLicense', 'dateOfIssue', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Place of Issue</label>
              <input
                type="text"
                value={formData.previousLicense.placeOfIssue}
                onChange={(e) => handleInputChange('previousLicense', 'placeOfIssue', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
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
          <li>• Upload copies of original documents</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { key: 'nationalIdCopy', label: 'National ID Copy', required: true },
          { key: 'birthCertificate', label: 'Birth Certificate', required: true },
          { key: 'medicalCertificate', label: 'Medical Certificate', required: true },
          { key: 'passportPhoto', label: 'Passport Photo', required: true },
          { key: 'eyeTestCertificate', label: 'Eye Test Certificate', required: true },
          { key: 'proofOfAddress', label: 'Proof of Address', required: true },
          { key: 'witnessIdCopy', label: 'Witness ID Copy', required: true },
          { key: 'previousLicenseCopy', label: 'Previous License Copy', required: !!formData.previousLicense.oldLicenseNumber },
          { key: 'foreignLicenseCopy', label: 'Foreign License Copy', required: formData.foreignLicense.hasForeignLicense && formData.personalInfo.nationality !== 'Papua New Guinea' }
        ].filter(doc => doc.required || doc.key === 'previousLicenseCopy' || doc.key === 'foreignLicenseCopy').map((doc) => (
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

      {/* Witness Information */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Witness Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Witness Name *</label>
            <input
              type="text"
              value={formData.witness.name}
              onChange={(e) => handleInputChange('witness', 'name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Witness Address *</label>
            <textarea
              value={formData.witness.address}
              onChange={(e) => handleInputChange('witness', 'address', e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-png-red focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <IdentificationIcon className="w-5 h-5 mr-2 text-png-red" />
        Review & Declaration
      </h3>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Application Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p><strong>License Type:</strong> {formData.licenseType.charAt(0).toUpperCase() + formData.licenseType.slice(1)}</p>
            <p><strong>License Class:</strong> Class {formData.licenseClass}</p>
            <p><strong>License Period:</strong> {formData.licensePeriod} year(s)</p>
            <p><strong>Name:</strong> {formData.personalInfo.surname}, {formData.personalInfo.givenNames}</p>
            <p><strong>Date of Birth:</strong> {formData.personalInfo.dateOfBirth}</p>
            <p><strong>Gender:</strong> {formData.personalInfo.gender}</p>
          </div>
          <div className="space-y-2">
            <p><strong>Mobile:</strong> {formData.personalInfo.mobile}</p>
            <p><strong>Address:</strong> {formData.personalInfo.residentialAddress.street}, {formData.personalInfo.residentialAddress.suburb}</p>
            <p><strong>Nationality:</strong> {formData.personalInfo.nationality}</p>
            {/* Fee information removed */}
            <p><strong>Processing Time:</strong> {getProcessingInfo().processingTime}</p>
            <p><strong>Witness:</strong> {formData.witness.name}</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="informationAccurate"
            checked={formData.declarations.informationAccurate}
            onChange={(e) => handleInputChange('declarations', 'informationAccurate', e.target.checked)}
            className="mt-1 mr-3"
            required
          />
          <label htmlFor="informationAccurate" className="text-sm text-gray-700">
            I declare that to the best of my knowledge and belief the above details and answers are true and correct. I understand that providing false information is a criminal offense. *
          </label>
        </div>
        
        <div className="flex items-start">
          <input
            type="checkbox"
            id="understandPenalties"
            checked={formData.declarations.understandPenalties}
            onChange={(e) => handleInputChange('declarations', 'understandPenalties', e.target.checked)}
            className="mt-1 mr-3"
            required
          />
          <label htmlFor="understandPenalties" className="text-sm text-gray-700">
            I understand the penalties for driving without a valid license and agree to comply with all Road Traffic Rules and Regulations of Papua New Guinea. *
          </label>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">Next Steps After Submission:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>1. Document verification by Road Traffic Authority</li>
          <li>2. Medical and eye test scheduling (if required)</li>
          <li>3. Written knowledge test (if required)</li>
          <li>4. Practical driving test (if required)</li>
          <li>5. License issuance upon successful completion</li>
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
          <p className="text-gray-600 mb-8">Please log in to apply for a driver's license.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Driver's License Application</h1>
            <p className="mt-2 text-lg text-gray-600">Apply for provisional or full driver's license</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4, 5].map((stepNumber) => (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNumber ? 'bg-png-red text-white' : 'bg-gray-300 text-gray-600'
                    }`}>
                      {stepNumber}
                    </div>
                    <div className={`ml-2 text-sm ${step >= stepNumber ? 'text-png-red' : 'text-gray-500'}`}>
                      {stepNumber === 1 ? 'License Type' : 
                       stepNumber === 2 ? 'Personal Info' : 
                       stepNumber === 3 ? 'History & Health' : 
                       stepNumber === 4 ? 'Documents' : 'Review'}
                    </div>
                    {stepNumber < 5 && <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}

            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Previous
                </button>
              )}
              
              {step < 5 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={step === 1 && (!formData.licenseType || !formData.licenseClass)}
                  className="ml-auto px-6 py-2 bg-png-red text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
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
          title="Driver's License Application Submitted!"
          message={`Your ${formData.licenseType} driver's license application has been received and is being processed.`}
          referenceNumber={submissionResult.referenceNumber}
          applicationId={submissionResult.applicationId}
          processingTime={getProcessingInfo().processingTime}
          nextSteps={[
            'Document verification will begin within 2 business days',
            'You will be contacted for any additional information needed',
            'Written and practical driving tests will be scheduled if required',
            `Your ${formData.licenseType} license will be issued upon successful completion`
          ]}
        />
      )}
    </div>
  )
}
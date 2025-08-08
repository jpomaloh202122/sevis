'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, DocumentIcon, UserIcon, BuildingOfficeIcon, HomeIcon, AcademicCapIcon, BriefcaseIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
// WebcamCapture removed per request (documents only)
import { applicationService } from '@/lib/database'
import { useAuth } from '@/contexts/AuthContext'

interface ApplicationData {
  // Step 1: Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  nationalId: string
  address: string
  city: string
  postalCode: string
  
  // Step 2: Category Selection
  category: 'property-owner' | 'business-person' | 'student' | 'employee' | ''
  
  // Step 3: Document Upload (base64 strings for demo; swap to storage later)
  documents: {
    nationalIdDoc: string
    addressProof: string
    categorySpecificDoc: string
  }
  
  // Step 4: Review & Submit
  termsAccepted: boolean
}

const categories = [
  {
    id: 'property-owner' as const,
    name: 'Property Owner',
    icon: HomeIcon,
    color: 'bg-blue-500',
    description: 'For individuals who own property within the city limits',
    requiredDocuments: ['Property ownership documents', 'Property tax receipts', 'Assessment records']
  },
  {
    id: 'business-person' as const,
    name: 'Business Person',
    icon: UserGroupIcon,
    color: 'bg-orange-500',
    description: 'For business owners and entrepreneurs operating within the city',
    requiredDocuments: ['Business registration', 'Tax identification', 'Operating licenses']
  },
  {
    id: 'student' as const,
    name: 'Student',
    icon: AcademicCapIcon,
    color: 'bg-green-500',
    description: 'For students enrolled in educational institutions within the city',
    requiredDocuments: ['Enrollment certificate', 'Student ID', 'Academic transcripts']
  },
  {
    id: 'employee' as const,
    name: 'Employee',
    icon: BriefcaseIcon,
    color: 'bg-purple-500',
    description: 'For individuals employed within the city limits',
    requiredDocuments: ['Employment verification letter', 'Salary certificate', 'Tax records']
  }
]

function generateReferenceNumber(): string {
  const ts = Date.now().toString().slice(-6)
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `CP-${ts}-${rand}`
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function CityPassApplicationClient() {
  const searchParams = useSearchParams()
  const initialCategory = (searchParams.get('category') as ApplicationData['category']) || ''
  const { user } = useAuth()

  const [currentStep, setCurrentStep] = useState(1)
  const [referenceNumber, setReferenceNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState<string | null>(null)

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: user?.phone || '',
    nationalId: user?.nationalId || '',
    address: '',
    city: '',
    postalCode: '',
    category: initialCategory,
    documents: {
      nationalIdDoc: '',
      addressProof: '',
      categorySpecificDoc: ''
    },
    termsAccepted: false
  })

  useEffect(() => {
    // Prefill category when query changes
    const q = searchParams.get('category') as ApplicationData['category'] | null
    if (q && q !== applicationData.category) {
      setApplicationData(prev => ({ ...prev, category: q }))
    }
  }, [searchParams])

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 1) {
      if (!applicationData.firstName) newErrors.firstName = 'First name is required'
      if (!applicationData.lastName) newErrors.lastName = 'Last name is required'
      if (!applicationData.email) newErrors.email = 'Email is required'
      if (!applicationData.phone) newErrors.phone = 'Phone number is required'
      if (!applicationData.nationalId) newErrors.nationalId = 'National ID is required'
      if (!applicationData.address) newErrors.address = 'Address is required'
      if (!applicationData.city) newErrors.city = 'City is required'
    }

    if (step === 2) {
      if (!applicationData.category) newErrors.category = 'Please select a category'
    }

    if (step === 3) {
      if (!applicationData.documents.nationalIdDoc) newErrors.nationalIdDoc = 'National ID document is required'
      if (!applicationData.documents.addressProof) newErrors.addressProof = 'Address proof is required'
      if (!applicationData.documents.categorySpecificDoc) newErrors.categorySpecificDoc = 'Category-specific document is required'
    }

    if (step === 4) {
      if (!applicationData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms to continue'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) setCurrentStep(s => s + 1)
  }

  const handlePrev = () => setCurrentStep(s => s - 1)

  const onUpload = useCallback(async (field: keyof ApplicationData['documents'], file: File | null) => {
    if (!file) return
    const base64 = await fileToBase64(file)
    setApplicationData(prev => ({
      ...prev,
      documents: { ...prev.documents, [field]: base64 }
    }))
  }, [])

  // photo capture removed

  const handleSubmit = async () => {
    if (!validateStep(4)) return

    setIsSubmitting(true)
    setNotice(null)

    const ref = generateReferenceNumber()
    setReferenceNumber(ref)

    const payload = {
      referenceNumber: ref,
      ...applicationData,
      categoryName: categories.find(c => c.id === applicationData.category)?.name || ''
    }

    try {
      if (!user?.id) {
        throw new Error('User must be logged in to submit application')
      }
      
      const { error } = await applicationService.createApplication({
        user_id: user.id,
        service_name: 'City Pass',
        application_data: payload,
        reference_number: ref
      })
      
      if (error) {
        console.error('Create application error:', error)
        throw new Error('Failed to save application to database')
      }
      
      setSubmissionComplete(true)
    } catch (err) {
      console.error('Submission error:', err)
      setNotice(`Application submission failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setSubmissionComplete(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submissionComplete) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckIcon className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted Successfully!</h1>
              {notice && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-4">{notice}</p>}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reference Number:</span>
                    <span className="font-mono font-medium text-png-red">{referenceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Category:</span>
                    <span className="font-medium">{categories.find(c => c.id === applicationData.category)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Submitted:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ul className="text-sm text-blue-800 space-y-1 text-left">
                  <li>• You will receive a confirmation email/SMS shortly</li>
                  <li>• Your application will be reviewed by our verification team</li>
                  <li>• Processing time: 1-2 weeks (depending on category)</li>
                  <li>• You will be notified once your City Pass is ready</li>
                </ul>
              </div>

              <div className="flex space-x-4">
                <Link href="/services/citizen-services" className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">Back to Services</Link>
                <Link href="/dashboard" className="flex-1 bg-png-red text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Go to Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const steps = [
    { number: 1, title: 'Personal Information', icon: UserIcon },
    { number: 2, title: 'Category Selection', icon: BuildingOfficeIcon },
    { number: 3, title: 'Document Upload', icon: DocumentIcon },
    { number: 4, title: 'Review & Submit', icon: CheckIcon }
  ]

  return (
    <div className="min-h-screen">
      <Header />

      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <Link href="/services/citizen-services/city-pass" className="flex items-center text-png-red hover:text-red-700 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to City Pass
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">City Pass Application</h1>
            <p className="mt-4 text-lg text-gray-600">Complete your application in 4 simple steps</p>
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => {
              const Icon = step.icon
              const active = currentStep === step.number
              const done = currentStep > step.number
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${done ? 'bg-png-red border-png-red text-white' : active ? 'border-png-red text-png-red' : 'border-gray-300 text-gray-400'}`}>
                    {done ? <CheckIcon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${active ? 'text-png-red' : 'text-gray-500'}`}>{step.title}</p>
                  </div>
                  {i < steps.length - 1 && <div className={`w-16 h-0.5 mx-4 ${done ? 'bg-png-red' : 'bg-gray-300'}`} />}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">

            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input type="text" value={applicationData.firstName} onChange={(e) => setApplicationData(p => ({ ...p, firstName: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input type="text" value={applicationData.lastName} onChange={(e) => setApplicationData(p => ({ ...p, lastName: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input type="email" value={applicationData.email} onChange={(e) => setApplicationData(p => ({ ...p, email: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                    <input type="tel" value={applicationData.phone} onChange={(e) => setApplicationData(p => ({ ...p, phone: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID Number *</label>
                    <input type="text" value={applicationData.nationalId} onChange={(e) => setApplicationData(p => ({ ...p, nationalId: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.nationalId ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input type="text" value={applicationData.city} onChange={(e) => setApplicationData(p => ({ ...p, city: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.city ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Address *</label>
                    <input type="text" value={applicationData.address} onChange={(e) => setApplicationData(p => ({ ...p, address: e.target.value }))} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.address ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input type="text" value={applicationData.postalCode} onChange={(e) => setApplicationData(p => ({ ...p, postalCode: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Category</h2>
                <p className="text-gray-600 mb-6">Choose the category that best describes your status:</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {categories.map(category => {
                    const Icon = category.icon
                    return (
                      <div key={category.id} className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 ${applicationData.category === category.id ? 'border-png-red bg-red-50' : 'border-gray-200 hover:border-png-red'}`} onClick={() => setApplicationData(p => ({ ...p, category: category.id }))}>
                        <div className="flex items-center mb-4">
                          <div className={`p-3 rounded-lg ${category.color} text-white mr-4`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                            <p className="text-sm text-gray-600">{category.description}</p>
                          </div>
                        </div>
                        <div className="mb-2">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">Required Documents</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {category.requiredDocuments.map((doc, idx) => (
                              <li key={idx} className="flex items-center"><span className="w-1.5 h-1.5 bg-png-red rounded-full mr-2"></span>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {errors.category && <p className="text-red-500 text-sm mt-4">{errors.category}</p>}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Required Documents</h2>
                <p className="text-gray-600 mb-6">Please upload in PDF, JPG, or PNG format (max ~5MB each).</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">National ID Document *</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => onUpload('nationalIdDoc', e.target.files?.[0] || null)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.nationalIdDoc ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.nationalIdDoc && <p className="text-red-500 text-sm mt-1">{errors.nationalIdDoc}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Proof of Address *</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => onUpload('addressProof', e.target.files?.[0] || null)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.addressProof ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.addressProof && <p className="text-red-500 text-sm mt-1">{errors.addressProof}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{categories.find(c => c.id === applicationData.category)?.name || 'Category'} Documents *</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => onUpload('categorySpecificDoc', e.target.files?.[0] || null)} className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent ${errors.categorySpecificDoc ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.categorySpecificDoc && <p className="text-red-500 text-sm mt-1">{errors.categorySpecificDoc}</p>}
                    <p className="text-sm text-gray-500 mt-1">Upload: {categories.find(c => c.id === applicationData.category)?.requiredDocuments.join(', ')}</p>
                  </div>
                  {/* Photo capture removed */}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review Your Application</h2>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Name:</span> <span className="font-medium ml-2">{applicationData.firstName} {applicationData.lastName}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium ml-2">{applicationData.email}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="font-medium ml-2">{applicationData.phone}</span></div>
                    <div><span className="text-gray-500">National ID:</span> <span className="font-medium ml-2">{applicationData.nationalId}</span></div>
                    <div className="md:col-span-2"><span className="text-gray-500">Address:</span> <span className="font-medium ml-2">{applicationData.address}, {applicationData.city}</span></div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Category & Documents</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Category:</span> <span className="font-medium ml-2">{categories.find(c => c.id === applicationData.category)?.name}</span></div>
                    <div><span className="text-gray-500">Documents Uploaded:</span> <span className="font-medium ml-2">{applicationData.documents.nationalIdDoc ? '✓' : '✗'} National ID, {applicationData.documents.addressProof ? '✓' : '✗'} Address Proof, {applicationData.documents.categorySpecificDoc ? '✓' : '✗'} Category Documents</span></div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="flex items-start">
                    <input type="checkbox" checked={applicationData.termsAccepted} onChange={(e) => setApplicationData(p => ({ ...p, termsAccepted: e.target.checked }))} className="mt-1 h-4 w-4 text-png-red focus:ring-png-red border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">I confirm that all information provided is accurate and complete. I understand that providing false information may result in the rejection of my application.</span>
                  </label>
                  {errors.termsAccepted && <p className="text-red-500 text-sm mt-1">{errors.termsAccepted}</p>}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex justify-between mt-8">
              <button onClick={handlePrev} disabled={currentStep === 1} className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ArrowLeftIcon className="w-4 h-4 mr-2" />Previous</button>
              {currentStep < 4 ? (
                <button onClick={handleNext} className="flex items-center px-6 py-2 bg-png-red text-white rounded-lg hover:bg-red-700 transition-colors">Next<ArrowRightIcon className="w-4 h-4 ml-2" /></button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center px-6 py-2 bg-png-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">{isSubmitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Submitting...</>) : (<>Submit Application<CheckIcon className="w-4 h-4 ml-2" /></>)}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default function CityPassApplicationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen"><Header /><div className="mx-auto max-w-3xl px-4 py-16 text-center text-gray-600">Loading application...</div><Footer /></div>}>
      <CityPassApplicationClient />
    </Suspense>
  )
}

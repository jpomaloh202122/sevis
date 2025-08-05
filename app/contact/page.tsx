'use client'

import { useState } from 'react'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const contactMethods = [
  {
    name: 'Phone Support',
    description: 'Call us for immediate assistance',
    icon: PhoneIcon,
    contact: '+675 123 4567',
    available: 'Mon-Fri 8:00 AM - 6:00 PM',
    color: 'bg-blue-50',
    iconColor: 'text-blue-600'
  },
  {
    name: 'Email Support',
    description: 'Send us an email for detailed inquiries',
    icon: EnvelopeIcon,
    contact: 'support@sevis.gov.pg',
    available: '24/7 response within 24 hours',
    color: 'bg-green-50',
    iconColor: 'text-green-600'
  },
  {
    name: 'Live Chat',
    description: 'Chat with our support team',
    icon: ChatBubbleLeftRightIcon,
    contact: 'Available on website',
    available: 'Mon-Fri 9:00 AM - 5:00 PM',
    color: 'bg-purple-50',
    iconColor: 'text-purple-600'
  },
  {
    name: 'Office Visit',
    description: 'Visit our main office',
    icon: MapPinIcon,
    contact: 'Port Moresby, PNG',
    available: 'Mon-Fri 8:00 AM - 4:00 PM',
    color: 'bg-orange-50',
    iconColor: 'text-orange-600'
  }
]

const departments = [
  { name: 'General Inquiries', email: 'info@sevis.gov.pg', phone: '+675 123 4567' },
  { name: 'Technical Support', email: 'tech@sevis.gov.pg', phone: '+675 123 4568' },
  { name: 'Business Services', email: 'business@sevis.gov.pg', phone: '+675 123 4569' },
  { name: 'Citizen Services', email: 'citizen@sevis.gov.pg', phone: '+675 123 4570' },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    department: 'General Inquiries'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSubmitStatus('success')
    setIsSubmitting(false)
    
    // Reset form after success
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        department: 'General Inquiries'
      })
      setSubmitStatus('idle')
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Get in touch with our support team for assistance
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Get in Touch
            </h2>
            
            <div className="space-y-6">
              {contactMethods.map((method) => (
                <div key={method.name} className={`${method.color} rounded-xl p-6`}>
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 w-12 h-12 ${method.iconColor} bg-white rounded-lg flex items-center justify-center`}>
                      <method.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{method.name}</h3>
                      <p className="text-gray-600 mt-1">{method.description}</p>
                      <p className="text-gray-900 font-medium mt-2">{method.contact}</p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {method.available}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Department Contacts */}
            <div className="mt-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Department Contacts
              </h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  {departments.map((dept) => (
                    <div key={dept.name} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <h4 className="font-medium text-gray-900">{dept.name}</h4>
                        <p className="text-sm text-gray-600">{dept.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">{dept.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a Message
              </h2>

              {submitStatus === 'success' && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        Thank you! Your message has been sent successfully. We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                    >
                      {departments.map((dept) => (
                        <option key={dept.name} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-png-red focus:border-transparent"
                    placeholder="Please describe your inquiry or issue..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  )
} 
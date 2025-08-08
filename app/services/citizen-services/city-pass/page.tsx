'use client'

import { useState } from 'react'
import { ArrowLeftIcon, BuildingOfficeIcon, HomeIcon, AcademicCapIcon, BriefcaseIcon, UserGroupIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const cityPassCategories = [
  {
    id: 'property-owner',
    name: 'Property Owner',
    icon: HomeIcon,
    color: 'bg-blue-500',
    description: 'For individuals who own property within the city limits',
    benefits: [
      'Access to city facilities and services',
      'Reduced rates for city utilities',
      'Priority access to city programs',
      'Voting rights in local elections',
      'Access to property tax information'
    ],
    requirements: [
      'Property ownership documents',
      'National ID',
      'Proof of address',
      'Property tax clearance',
      'Passport photo'
    ],
    fee: 'K150',
    processingTime: '1-2 weeks',
    validity: '2 years'
  },
  {
    id: 'student',
    name: 'Student',
    icon: AcademicCapIcon,
    color: 'bg-green-500',
    description: 'For students enrolled in educational institutions within the city',
    benefits: [
      'Access to student discounts',
      'Library access',
      'Transportation discounts',
      'Access to student facilities',
      'Educational program notifications'
    ],
    requirements: [
      'Student ID or enrollment certificate',
      'National ID',
      'Proof of address',
      'School/University letter',
      'Passport photo'
    ],
    fee: 'K50',
    processingTime: '3-5 days',
    validity: '1 year'
  },
  {
    id: 'employee',
    name: 'Employee',
    icon: BriefcaseIcon,
    color: 'bg-purple-500',
    description: 'For individuals employed within the city limits',
    benefits: [
      'Access to employee facilities',
      'Transportation benefits',
      'Access to city services',
      'Professional networking opportunities',
      'Employment support services'
    ],
    requirements: [
      'Employment letter or contract',
      'National ID',
      'Proof of address',
      'Employer verification',
      'Passport photo'
    ],
    fee: 'K100',
    processingTime: '1 week',
    validity: '2 years'
  },
  {
    id: 'business-person',
    name: 'Business Person',
    icon: UserGroupIcon,
    color: 'bg-orange-500',
    description: 'For business owners and entrepreneurs operating within the city',
    benefits: [
      'Business networking opportunities',
      'Access to business support services',
      'Reduced business license fees',
      'Access to city business programs',
      'Priority access to city contracts'
    ],
    requirements: [
      'Business registration certificate',
      'National ID',
      'Business address proof',
      'Tax clearance certificate',
      'Passport photo'
    ],
    fee: 'K200',
    processingTime: '1-2 weeks',
    validity: '2 years'
  }
]

export default function CityPassPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <Link href="/services/citizen-services" className="flex items-center text-png-red hover:text-red-700 transition-colors">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Citizen Services
            </Link>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-indigo-500 rounded-lg text-white mr-4">
                <BuildingOfficeIcon className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                City Pass Application
              </h1>
            </div>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Apply for a City Pass to access various city services and facilities. Choose the category that best describes your status and enjoy the benefits available to you.
            </p>
          </div>
        </div>
      </div>

      {/* General Information */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About City Pass</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">What is City Pass?</h3>
                <p className="text-gray-600 mb-4">
                  City Pass is an official identification and access card that provides residents, students, employees, and business owners with access to various city services, facilities, and benefits.
                </p>
                <h3 className="text-lg font-medium text-gray-900 mb-2">General Benefits</h3>
                <ul className="text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Access to city facilities and services
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Reduced rates for various services
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Priority access to city programs
                  </li>
                  <li className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                    Official identification within the city
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Application Process</h3>
                <ol className="text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <span className="bg-png-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-2 mt-0.5">1</span>
                    Choose your category and gather required documents
                  </li>
                  <li className="flex items-start">
                    <span className="bg-png-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-2 mt-0.5">2</span>
                    Complete the online application form
                  </li>
                  <li className="flex items-start">
                    <span className="bg-png-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-2 mt-0.5">3</span>
                    Submit required documents and pay the fee
                  </li>
                  <li className="flex items-start">
                    <span className="bg-png-red text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-2 mt-0.5">4</span>
                    Receive your City Pass within the processing time
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Category</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cityPassCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <div
                  key={category.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedCategory === category.id
                      ? 'border-png-red bg-red-50'
                      : 'border-gray-200 hover:border-png-red'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="text-center">
                    <div className={`p-3 rounded-lg ${category.color} text-white mx-auto mb-4 w-fit`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fee:</span>
                        <span className="font-medium">{category.fee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Processing:</span>
                        <span className="font-medium">{category.processingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Valid for:</span>
                        <span className="font-medium">{category.validity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Selected Category Details */}
      {selectedCategory && (
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {(() => {
              const category = cityPassCategories.find(c => c.id === selectedCategory)
              if (!category) return null
              const IconComponent = category.icon
              
              return (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <div className={`p-3 rounded-lg ${category.color} text-white mr-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{category.name} City Pass</h2>
                      <p className="text-gray-600">{category.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Benefits */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
                      <ul className="space-y-2">
                        {category.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
                      <ul className="space-y-2">
                        {category.requirements.map((requirement, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 bg-png-red rounded-full mr-3 mt-2 flex-shrink-0"></div>
                            <span className="text-gray-700">{requirement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Application Button */}
                  <div className="mt-8 text-center">
                    <Link
                      href={`/services/apply?service=city-pass&category=${category.id}`}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-png-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-png-red transition-colors"
                    >
                      Apply for {category.name} City Pass
                    </Link>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

'use client'

import { 
  DocumentTextIcon, 
  IdentificationIcon, 
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  TruckIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

const quickServices = [
  {
    name: 'Business & Commerce',
    description: 'Business registration, licensing, and commercial services',
    icon: BuildingOfficeIcon,
    href: '/services/business-commerce',
    color: 'bg-png-gold',
    iconColor: 'text-png-black'
  },
  {
    name: 'Citizen Services',
    description: 'Personal identification, documents, and citizen services',
    icon: IdentificationIcon,
    href: '/services/citizen-services',
    color: 'bg-png-red',
    iconColor: 'text-png-white'
  },
  {
    name: 'Health Services',
    description: 'Healthcare, medical certificates, and health services',
    icon: CurrencyDollarIcon,
    href: '/services/health-services',
    color: 'bg-png-gold',
    iconColor: 'text-png-black'
  },
  {
    name: 'Transportation',
    description: 'Vehicle registration, licensing, and transport services',
    icon: TruckIcon,
    href: '/services/transportation',
    color: 'bg-png-red',
    iconColor: 'text-png-white'
  },
  {
    name: 'Legal Services',
    description: 'Legal documents, court services, and legal assistance',
    icon: AcademicCapIcon,
    href: '/services/legal-services',
    color: 'bg-png-gold',
    iconColor: 'text-png-black'
  },
  {
    name: 'All Services',
    description: 'Browse complete directory of government services',
    icon: DocumentTextIcon,
    href: '/services',
    color: 'bg-png-black',
    iconColor: 'text-png-white'
  }
]

export default function QuickAccess() {
  return (
    <section className="py-16 bg-png-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-png-black sm:text-4xl">
            Quick Access to Popular Services
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Get started with the most commonly used government services
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickServices.map((service) => (
            <Link
              key={service.name}
              href={service.href}
              className="group relative bg-png-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:border-png-gold"
            >
              <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-12 h-12 ${service.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <service.icon className={`h-6 w-6 ${service.iconColor}`} aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-png-black group-hover:text-png-red transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {service.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm text-png-red font-medium">
                Access Service
                <svg className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/services"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-png-red hover:bg-red-700 transition-colors"
          >
            View All Services
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
} 
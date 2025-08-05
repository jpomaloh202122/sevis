'use client'

import { 
  UserGroupIcon,
  BuildingLibraryIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  HeartIcon,
  WrenchScrewdriverIcon,
  ScaleIcon,
  MapIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

const serviceCategories = [
  {
    name: 'Citizen Services',
    description: 'Personal identification, documents, and citizen-related services',
    icon: UserGroupIcon,
    services: [
      'National ID Application',
      'Birth Certificate',
      'Marriage Certificate',
      'Passport Services',
      'Voter Registration'
    ],
    color: 'bg-png-red/10',
    iconColor: 'text-png-red'
  },
  {
    name: 'Business & Commerce',
    description: 'Business registration, licensing, and commercial services',
    icon: BuildingLibraryIcon,
    services: [
      'Business Registration',
      'Trade License',
      'Import/Export Permits',
      'Company Registration',
      'Tax Registration'
    ],
    color: 'bg-png-gold/10',
    iconColor: 'text-png-gold'
  },
  {
    name: 'Public Safety',
    description: 'Law enforcement, emergency services, and security',
    icon: ShieldCheckIcon,
    services: [
      'Police Clearance',
      'Fire Safety Certificate',
      'Security License',
      'Emergency Services',
      'Crime Reporting'
    ],
    color: 'bg-png-black/10',
    iconColor: 'text-png-black'
  },
  {
    name: 'Transportation',
    description: 'Vehicle registration, licensing, and transport services',
    icon: GlobeAltIcon,
    services: [
      'Driver License',
      'Vehicle Registration',
      'Road Tax Payment',
      'Transport Permits',
      'Traffic Fines'
    ],
    color: 'bg-png-gold/10',
    iconColor: 'text-png-gold'
  },
  {
    name: 'Health Services',
    description: 'Healthcare, medical certificates, and health-related services',
    icon: HeartIcon,
    services: [
      'Medical Certificate',
      'Health Insurance',
      'Vaccination Records',
      'Pharmacy License',
      'Health Permits'
    ],
    color: 'bg-png-red/10',
    iconColor: 'text-png-red'
  },
  {
    name: 'Infrastructure',
    description: 'Construction permits, utilities, and infrastructure services',
    icon: WrenchScrewdriverIcon,
    services: [
      'Building Permits',
      'Construction License',
      'Utility Connections',
      'Land Development',
      'Infrastructure Projects'
    ],
    color: 'bg-png-black/10',
    iconColor: 'text-png-black'
  },
  {
    name: 'Legal Services',
    description: 'Legal documents, court services, and legal assistance',
    icon: ScaleIcon,
    services: [
      'Legal Documents',
      'Court Services',
      'Notary Services',
      'Legal Aid',
      'Property Registration'
    ],
    color: 'bg-png-gold/10',
    iconColor: 'text-png-gold'
  },
  {
    name: 'Land & Property',
    description: 'Land registration, property services, and land management',
    icon: MapIcon,
    services: [
      'Land Registration',
      'Property Title',
      'Land Survey',
      'Property Tax',
      'Land Use Permits'
    ],
    color: 'bg-png-red/10',
    iconColor: 'text-png-red'
  }
]

export default function ServicesGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-png-black sm:text-4xl">
            Government Services by Category
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Browse our comprehensive range of government services organized by category
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {serviceCategories.map((category) => (
            <div key={category.name} className={`${category.color} rounded-xl p-6 hover:shadow-lg transition-all duration-300`}>
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 ${category.iconColor} bg-png-white rounded-lg flex items-center justify-center mr-3`}>
                  <category.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-png-black">{category.name}</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                {category.description}
              </p>
              
              <ul className="space-y-2 mb-6">
                {category.services.slice(0, 3).map((service) => (
                  <li key={service} className="text-sm text-gray-700 flex items-center">
                    <div className="w-1.5 h-1.5 bg-png-red rounded-full mr-2"></div>
                    {service}
                  </li>
                ))}
                {category.services.length > 3 && (
                  <li className="text-sm text-gray-500">
                    +{category.services.length - 3} more services
                  </li>
                )}
              </ul>
              
              <Link
                href={category.name === 'Citizen Services' ? '/services/citizen-services' :
                      category.name === 'Business & Commerce' ? '/services/business-commerce' :
                      category.name === 'Health Services' ? '/services/health-services' :
                      category.name === 'Transportation' ? '/services/transportation' :
                      category.name === 'Legal Services' ? '/services/legal-services' :
                      `/services/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center text-sm font-medium text-png-red hover:text-red-700 transition-colors"
              >
                View all services
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-png-white rounded-xl shadow-sm p-8 border border-gray-200">
            <h3 className="text-xl font-semibold text-png-black mb-4">
              Can't find what you're looking for?
            </h3>
            <p className="text-gray-600 mb-6">
              Contact our support team or browse our complete service directory
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-primary"
              >
                Contact Support
              </Link>
              <Link
                href="/services"
                className="btn-secondary"
              >
                Browse All Services
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 
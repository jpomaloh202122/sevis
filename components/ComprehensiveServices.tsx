'use client'

import { useState } from 'react'
import { 
  UserGroupIcon, 
  BuildingOfficeIcon, 
  GlobeAltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowTopRightOnSquareIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Service {
  name: string
  description: string
  status: 'available' | 'coming_soon' | 'internal'
  link: string
}

const g2cServices: Service[] = [
  {
    name: 'ePassport',
    description: 'Online application, payment, and status tracking for passports, with notifications for collection.',
    status: 'coming_soon',
    link: '/services/citizen-services/passport'
  },
  {
    name: 'City Pass',
    description: 'Digital city access pass for residents and visitors with integrated services.',
    status: 'available',
    link: '/services/citizen-services/city-pass'
  },
  {
    name: 'Driver\'s License',
    description: 'Online application for provisional and full driver\'s licenses with document upload.',
    status: 'available', 
    link: '/services/transportation/drivers-license'
  },
  {
    name: 'Learner\'s Permit',
    description: 'Apply for learner\'s permits online with medical certificate verification.',
    status: 'available',
    link: '/services/transportation/learners-permit'
  },
  {
    name: 'eHealth',
    description: 'Access to health information, medical reports, appointment booking, and welfare services.',
    status: 'coming_soon',
    link: '/services/health-services/ehealth'
  },
  {
    name: 'eEducation',
    description: 'E-learning platforms, school management, statement of results, and enrollment services.',
    status: 'coming_soon',
    link: '/services/education/e-education'
  },
  {
    name: 'eCensus',
    description: 'Electronic data collection for population statistics, allowing citizens to update personal information.',
    status: 'coming_soon',
    link: '/services/citizen-services/census'
  },
  {
    name: 'eLands',
    description: 'Online inquiries and payments for state land leases and titles.',
    status: 'coming_soon',
    link: '/services/legal-services/lands'
  },
  {
    name: 'Digital ID',
    description: 'Secure digital identity issuance and management for accessing services, including biometric onboarding.',
    status: 'coming_soon',
    link: '/services/citizen-services/digital-id'
  },
  {
    name: 'eAgriculture',
    description: 'Access to farming information, market data, and agricultural support resources.',
    status: 'coming_soon',
    link: '/services/agriculture/e-agriculture'
  },
  {
    name: 'eJustice',
    description: 'Online access to legal services, case tracking, and justice-related applications using digital ID.',
    status: 'coming_soon',
    link: '/services/legal-services/justice'
  },
  {
    name: 'eCommon Roll',
    description: 'Voter registration updates and electoral information management.',
    status: 'coming_soon',
    link: '/services/citizen-services/voting'
  }
]

const g2bServices: Service[] = [
  {
    name: 'GovService Portal',
    description: 'A unified platform for accessing various government services, including forms and applications.',
    status: 'coming_soon',
    link: '/services/business-commerce/gov-portal'
  },
  {
    name: 'SME Startup Portal',
    description: 'Online business registration, resources, and tools for small and medium enterprises.',
    status: 'coming_soon',
    link: '/services/business-commerce/sme-startup'
  },
  {
    name: 'ICT Cluster Portal',
    description: 'Support for ICT entrepreneurship, innovation hubs, and startup incubation.',
    status: 'coming_soon',
    link: '/services/business-commerce/ict-cluster'
  },
  {
    name: 'Investment Portal',
    description: 'Centralized information on investment opportunities, economic data, and application processes.',
    status: 'coming_soon',
    link: '/services/business-commerce/investment'
  },
  {
    name: 'Business Registration',
    description: 'Online company registration, licensing, and compliance management for businesses.',
    status: 'coming_soon',
    link: '/services/business-commerce/registration'
  },
  {
    name: 'eProcurement',
    description: 'Online tendering, procurement tracking, and supplier management for businesses.',
    status: 'coming_soon',
    link: '/services/business-commerce/procurement'
  }
]

const g2gServices: Service[] = [
  {
    name: 'Public Servant Pass',
    description: 'Digital identity and authentication system for Papua New Guinea government employees. Apply for secure G2G access credentials.',
    status: 'available',
    link: '/services/g2g/public-servant-pass'
  },
  {
    name: 'eFinance',
    description: 'Real-time access to financial data and reporting across government entities.',
    status: 'internal',
    link: '/admin/finance'
  },
  {
    name: 'eBudget',
    description: 'Online management of budgetary processes, from planning to execution.',
    status: 'internal',
    link: '/admin/budget'
  },
  {
    name: 'eCabinet',
    description: 'Digital submission, tracking, and approval of executive council papers.',
    status: 'internal',
    link: '/admin/cabinet'
  },
  {
    name: 'eParliament',
    description: 'Digitization of parliamentary records, sessions, and information sharing.',
    status: 'internal',
    link: '/admin/parliament'
  },
  {
    name: 'eHR',
    description: 'Automated human resources management, including payroll and personnel records.',
    status: 'internal',
    link: '/admin/hr'
  },
  {
    name: 'eCustoms',
    description: 'Digital customs declarations and business transactions for trade facilitation.',
    status: 'internal',
    link: '/admin/customs'
  },
  {
    name: 'eAdmission',
    description: 'Online admissions processes for higher education institutions.',
    status: 'internal',
    link: '/admin/admission'
  },
  {
    name: 'ePIP',
    description: 'Submission and monitoring of public investment programs.',
    status: 'internal',
    link: '/admin/pip'
  }
]

interface ServiceCardProps {
  service: Service
}

function ServiceCard({ service }: ServiceCardProps) {
  const getStatusInfo = () => {
    switch (service.status) {
      case 'available':
        return {
          icon: <CheckCircleIcon className="h-4 w-4" />,
          text: 'Available',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        }
      case 'coming_soon':
        return {
          icon: <ClockIcon className="h-4 w-4" />,
          text: 'Coming Soon',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800'
        }
      case 'internal':
        return {
          icon: <BuildingOfficeIcon className="h-4 w-4" />,
          text: 'Internal',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const isAvailable = service.status === 'available'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">{service.name}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.icon}
          <span className="ml-1">{statusInfo.text}</span>
        </span>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">{service.description}</p>
      
      {isAvailable ? (
        <Link 
          href={service.link}
          className="inline-flex items-center text-png-red hover:text-red-700 text-sm font-medium transition-colors"
        >
          Access Service
          <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
        </Link>
      ) : (
        <span className="inline-flex items-center text-gray-400 dark:text-gray-500 text-sm font-medium">
          {service.status === 'internal' ? 'Admin Access Required' : 'Available Soon'}
        </span>
      )}
    </div>
  )
}

interface ServiceSectionProps {
  title: string
  subtitle: string
  icon: React.ReactNode
  services: Service[]
  defaultExpanded?: boolean
}

function ServiceSection({ title, subtitle, icon, services, defaultExpanded = false }: ServiceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  
  const availableCount = services.filter(s => s.status === 'available').length
  const totalCount = services.length

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 px-6 py-4 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 p-2 bg-png-red rounded-lg text-white mr-4">
            {icon}
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{subtitle}</p>
            <p className="text-png-red dark:text-png-gold text-xs mt-1">
              {availableCount} of {totalCount} services available
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-6 bg-white dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.name} service={service} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ComprehensiveServices() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Papua New Guinea Digital Government Services
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive digital transformation enabling efficient service delivery across Government-to-Citizen (G2C), 
            Government-to-Business (G2B), and Government-to-Government (G2G) interactions.
          </p>
        </div>

        <div className="space-y-6">
          <ServiceSection
            title="Government-to-Citizen (G2C) Services"
            subtitle="Direct citizen interactions, enabling online access to essential public resources, reducing paperwork, and improving service delivery."
            icon={<UserGroupIcon className="h-6 w-6" />}
            services={g2cServices}
            defaultExpanded={true}
          />

          <ServiceSection
            title="Government-to-Business (G2B) Services"
            subtitle="Streamline business operations, foster economic growth, and support sectors vital to PNG's economy."
            icon={<BuildingOfficeIcon className="h-6 w-6" />}
            services={g2bServices}
          />

          <ServiceSection
            title="Government-to-Government (G2G) Services"
            subtitle="Internal services enhancing inter-agency collaboration, data sharing, and administrative efficiency."
            icon={<GlobeAltIcon className="h-6 w-6" />}
            services={g2gServices}
          />
        </div>

        <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Get Started?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Access available services now or stay updated on upcoming releases.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-png-red hover:bg-red-700 transition-colors"
              >
                Create Account
              </Link>
              <Link
                href="/services"
                className="inline-flex justify-center items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
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
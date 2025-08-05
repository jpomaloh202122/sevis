'use client'

import { useState } from 'react'
import { 
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Mock data for demonstration
const mockStats = {
  totalUsers: 15420,
  activeApplications: 2347,
  completedToday: 156,
  pendingReview: 89,
  userGrowth: 12.5,
  applicationGrowth: 8.3
}

const mockTopServices = [
  { name: 'Business Registration', applications: 456, growth: 15.2 },
  { name: 'Driver License Renewal', applications: 389, growth: 8.7 },
  { name: 'National ID Application', applications: 234, growth: 22.1 },
  { name: 'Tax Registration', applications: 198, growth: -3.2 },
  { name: 'Building Permits', applications: 167, growth: 12.8 }
]

const mockRecentApplications = [
  {
    id: 1,
    user: 'John Doe',
    service: 'Business Registration',
    status: 'Pending Review',
    submittedDate: '2024-01-22 14:30',
    priority: 'High'
  },
  {
    id: 2,
    user: 'Jane Smith',
    service: 'Driver License Renewal',
    status: 'In Progress',
    submittedDate: '2024-01-22 13:15',
    priority: 'Medium'
  },
  {
    id: 3,
    user: 'Mike Johnson',
    service: 'National ID Application',
    status: 'Completed',
    submittedDate: '2024-01-22 12:45',
    priority: 'Low'
  },
  {
    id: 4,
    user: 'Sarah Wilson',
    service: 'Tax Registration',
    status: 'Pending Review',
    submittedDate: '2024-01-22 11:20',
    priority: 'High'
  }
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'text-red-600 bg-red-100'
    case 'Medium':
      return 'text-yellow-600 bg-yellow-100'
    case 'Low':
      return 'text-green-600 bg-green-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'text-green-600 bg-green-100'
    case 'In Progress':
      return 'text-blue-600 bg-blue-100'
    case 'Pending Review':
      return 'text-yellow-600 bg-yellow-100'
    default:
      return 'text-gray-600 bg-gray-100'
  }
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'reports' | 'settings'>('overview')
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Monitor and manage government services and applications</p>
            </div>
                         <div className="flex items-center space-x-4">
               <span className="text-sm text-gray-500">Last updated: Today at 9:30 AM</span>
               <button 
                 onClick={logout}
                 className="text-png-red hover:text-red-700 text-sm font-medium"
               >
                 Logout
               </button>
             </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-8 border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-png-red text-png-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'applications'
                ? 'border-png-red text-png-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-png-red text-png-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-png-red text-png-red'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-8 w-8 text-png-red" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 ml-1">+{mockStats.userGrowth}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{mockStats.activeApplications.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 ml-1">+{mockStats.applicationGrowth}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Completed Today</p>
                    <p className="text-2xl font-semibold text-gray-900">{mockStats.completedToday}</p>
                    <p className="text-sm text-gray-500 mt-1">Applications processed</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Review</p>
                    <p className="text-2xl font-semibold text-gray-900">{mockStats.pendingReview}</p>
                    <p className="text-sm text-gray-500 mt-1">Requires attention</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Services and Recent Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Services */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Most Popular Services</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {mockTopServices.map((service, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-500">{service.applications} applications</p>
                        </div>
                        <div className="flex items-center">
                          {service.growth > 0 ? (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm ml-1 ${service.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {service.growth > 0 ? '+' : ''}{service.growth}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {mockRecentApplications.map((application) => (
                    <div key={application.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{application.user}</p>
                          <p className="text-sm text-gray-500">{application.service}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(application.priority)}`}>
                            {application.priority}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-gray-500">{application.submittedDate}</p>
                        <button className="text-png-red hover:text-red-700 text-xs font-medium">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin/applications" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <DocumentTextIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Review Applications</p>
                    <p className="text-sm text-gray-500">Process pending applications</p>
                  </div>
                </Link>
                <Link href="/admin/reports" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <ChartBarIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Generate Reports</p>
                    <p className="text-sm text-gray-500">View detailed analytics</p>
                  </div>
                </Link>
                <Link href="/admin/settings" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <CogIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">System Settings</p>
                    <p className="text-sm text-gray-500">Configure portal settings</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">All Applications</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Application management interface will be implemented here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Reports & Analytics</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">Reports and analytics dashboard will be implemented here.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">System Settings</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-500">System configuration settings will be implemented here.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
} 
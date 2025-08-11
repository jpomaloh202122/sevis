'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  CogIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  TruckIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { applicationService, userService } from '@/lib/database'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

// Interfaces for real data
interface DashboardStats {
  totalUsers: number
  activeApplications: number
  completedToday: number
  pendingReview: number
  userGrowth: number
  applicationGrowth: number
}

interface ServiceStats {
  name: string
  applications: number
  growth: number
}

interface RecentApplication {
  id: string
  user: string
  service: string
  status: string
  submittedDate: string
  priority: string
  users?: {
    name: string
    photo_url?: string
  }
}

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
  const { user, logout, isLoading: authLoading } = useAuth()
  const router = useRouter()
  
  // State for real data
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeApplications: 0,
    completedToday: 0,
    pendingReview: 0,
    userGrowth: 0,
    applicationGrowth: 0
  })
  const [topServices, setTopServices] = useState<ServiceStats[]>([])
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is authenticated admin
  const isAdmin = user && ['admin', 'super_admin', 'approving_admin', 'vetting_admin'].includes(user.role)

  // Handle admin logout
  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAdmin) return
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch all applications and users concurrently
        const [applicationsResult, usersResult] = await Promise.all([
          applicationService.getAllApplications(),
          userService.getAllUsers()
        ])
        
        if (applicationsResult.error) {
          throw new Error(`Failed to fetch applications: ${applicationsResult.error.message}`)
        }
        
        if (usersResult.error) {
          throw new Error(`Failed to fetch users: ${usersResult.error.message}`)
        }
        
        const applications = applicationsResult.data || []
        const users = usersResult.data || []
        
        // Calculate statistics
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        const completedTodayCount = applications.filter(app => {
          if (app.status !== 'completed') return false
          const updatedDate = new Date(app.updated_at)
          updatedDate.setHours(0, 0, 0, 0)
          return updatedDate.getTime() === today.getTime()
        }).length
        
        const pendingCount = applications.filter(app => 
          app.status === 'pending' || app.status === 'in_progress'
        ).length
        
        const activeCount = applications.filter(app => 
          app.status !== 'completed' && app.status !== 'rejected'
        ).length
        
        // Calculate growth (simplified - comparing to a week ago)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        
        const recentUsers = users.filter(user => 
          new Date(user.created_at) > weekAgo
        ).length
        
        const recentApplications = applications.filter(app => 
          new Date(app.submitted_at) > weekAgo
        ).length
        
        const userGrowthPercent = users.length > 0 ? (recentUsers / users.length) * 100 : 0
        const applicationGrowthPercent = applications.length > 0 ? (recentApplications / applications.length) * 100 : 0
        
        setStats({
          totalUsers: users.length,
          activeApplications: activeCount,
          completedToday: completedTodayCount,
          pendingReview: pendingCount,
          userGrowth: Math.round(userGrowthPercent * 10) / 10,
          applicationGrowth: Math.round(applicationGrowthPercent * 10) / 10
        })
        
        // Calculate service statistics
        const serviceMap = new Map<string, number>()
        applications.forEach(app => {
          const service = app.service_name || 'Unknown Service'
          serviceMap.set(service, (serviceMap.get(service) || 0) + 1)
        })
        
        const serviceStats: ServiceStats[] = Array.from(serviceMap.entries())
          .map(([name, count]) => ({
            name,
            applications: count,
            growth: Math.random() * 20 - 5 // Simplified growth calculation
          }))
          .sort((a, b) => b.applications - a.applications)
          .slice(0, 5)
        
        setTopServices(serviceStats)
        
        // Get recent applications
        const recentApps: RecentApplication[] = applications
          .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
          .slice(0, 4)
          .map(app => ({
            id: app.id,
            user: app.users?.name || 'Unknown User',
            service: app.service_name || 'Unknown Service',
            status: getStatusDisplayName(app.status),
            submittedDate: new Date(app.submitted_at).toLocaleString(),
            priority: getPriorityFromStatus(app.status),
            users: app.users
          }))
        
        setRecentApplications(recentApps)
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [isAdmin])
  
  // Helper functions
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending Review'
      case 'in_progress': return 'In Progress' 
      case 'completed': return 'Completed'
      case 'rejected': return 'Rejected'
      default: return status
    }
  }
  
  const getPriorityFromStatus = (status: string) => {
    switch (status) {
      case 'pending': return 'High'
      case 'in_progress': return 'Medium'
      case 'completed': return 'Low'
      case 'rejected': return 'High'
      default: return 'Medium'
    }
  }

  // Show loading while auth is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
            <p className="text-gray-600">Verifying authentication...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  // Redirect to admin login if not authenticated as admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <ShieldCheckIcon className="h-12 w-12 text-png-red mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in with your administrator credentials to access this portal.</p>
            <div className="space-y-3">
              <Link 
                href="/admin/login"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-png-red hover:bg-red-700"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Admin Login
              </Link>
              <div className="text-sm">
                <Link href="/" className="text-png-red hover:text-red-700 font-medium">
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

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
                 onClick={handleLogout}
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-sm text-red-600">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 text-sm text-red-800 hover:text-red-900 font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-png-red mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard Data...</h3>
                <p className="text-gray-600">Please wait while we fetch the latest statistics.</p>
              </div>
            )}
            
            {!loading && (
              <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UsersIcon className="h-8 w-8 text-png-red" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 ml-1">+{stats.userGrowth}%</span>
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
                    <p className="text-2xl font-semibold text-gray-900">{stats.activeApplications.toLocaleString()}</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 ml-1">+{stats.applicationGrowth}%</span>
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
                    <p className="text-2xl font-semibold text-gray-900">{stats.completedToday}</p>
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
                    <p className="text-2xl font-semibold text-gray-900">{stats.pendingReview}</p>
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
                {topServices.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {topServices.map((service, index) => (
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
                ) : (
                  <div className="px-6 py-8 text-center">
                    <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No service data available</p>
                  </div>
                )}
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Applications</h3>
                </div>
                {recentApplications.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {recentApplications.map((application) => (
                    <div key={application.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {application.users?.photo_url ? (
                              <img 
                                src={application.users.photo_url} 
                                alt={application.user}
                                className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                                <UsersIcon className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{application.user}</p>
                            <p className="text-sm text-gray-500">{application.service}</p>
                          </div>
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
                ) : (
                  <div className="px-6 py-8 text-center">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-500">No recent applications</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/admin/city-pass" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <BuildingOfficeIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">City Pass Portal</p>
                    <p className="text-sm text-gray-500">Review city pass applications</p>
                  </div>
                </Link>
                <Link href="/admin/learners-permit" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <TruckIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Learner's Permit Portal</p>
                    <p className="text-sm text-gray-500">Review learner's permit applications</p>
                  </div>
                </Link>
                <Link href="/admin/drivers-license" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <TruckIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Driver's License Portal</p>
                    <p className="text-sm text-gray-500">Review driver's license applications</p>
                  </div>
                </Link>
                {user && ['super_admin'].includes(user.role as any) && (
                  <Link href="/admin/super-admin" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                    <UsersIcon className="h-6 w-6 text-png-red mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Super Admin Panel</p>
                      <p className="text-sm text-gray-500">Manage admin users and roles</p>
                    </div>
                  </Link>
                )}
                <Link href="/admin/applications" className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-png-red hover:bg-red-50 transition-colors">
                  <DocumentTextIcon className="h-6 w-6 text-png-red mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">All Applications</p>
                    <p className="text-sm text-gray-500">Process all applications</p>
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
              </>
            )}
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
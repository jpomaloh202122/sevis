import { applicationService } from '@/lib/database'

export interface ApplicationLimitResult {
  canApply: boolean
  reason?: string
  existingApplication?: any
  suggestedActions?: string[]
}

export interface ExistingApplicationSummary {
  id: string
  service_name: string
  status: string
  reference_number?: string
  created_at: string
  application_data?: any
}

/**
 * Application Limits Service
 * Enforces business rules for service applications:
 * - One Public Servant Pass per user
 * - One City Pass per user  
 * - One SEVIS Pass per user
 * - Users can reapply after rejection
 * - Users cannot apply if they have pending/in_progress/completed applications
 */
export class ApplicationLimitsService {
  
  /**
   * Check if user can apply for a specific service
   */
  static async canUserApplyForService(
    userId: string, 
    serviceName: string
  ): Promise<ApplicationLimitResult> {
    try {
      // Get all applications for this user
      const { data: allApplications, error } = await applicationService.getAllApplications()
      
      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      // Filter applications for this user and service
      const userApplications = allApplications?.filter(app => 
        app.user_id === userId && app.service_name === serviceName
      ) || []

      // If no existing applications, user can apply
      if (userApplications.length === 0) {
        return { canApply: true }
      }

      // Check for existing applications with different statuses
      const pendingApps = userApplications.filter(app => app.status === 'pending')
      const inProgressApps = userApplications.filter(app => app.status === 'in_progress')
      const completedApps = userApplications.filter(app => app.status === 'completed')
      const rejectedApps = userApplications.filter(app => app.status === 'rejected')

      // User cannot apply if they have completed applications
      if (completedApps.length > 0) {
        const latestCompleted = completedApps[0]
        return {
          canApply: false,
          reason: `You already have a completed ${serviceName} application.`,
          existingApplication: latestCompleted,
          suggestedActions: [
            'Check your application status in the portal',
            'Contact support if you need assistance with your existing application'
          ]
        }
      }

      // User cannot apply if they have pending or in-progress applications
      if (pendingApps.length > 0 || inProgressApps.length > 0) {
        const existingApp = [...pendingApps, ...inProgressApps][0]
        return {
          canApply: false,
          reason: `You already have a ${existingApp.status} ${serviceName} application.`,
          existingApplication: existingApp,
          suggestedActions: [
            'Wait for your current application to be processed',
            'Check your application status in the portal',
            'Contact support if you need updates on your application'
          ]
        }
      }

      // User can reapply if all previous applications were rejected
      if (rejectedApps.length > 0) {
        return { 
          canApply: true,
          reason: 'You can reapply after your previous application was rejected.',
          existingApplication: rejectedApps[0]
        }
      }

      // Default fallback - should not reach here
      return { canApply: true }
      
    } catch (error) {
      console.error('Error checking application limits:', error)
      throw error
    }
  }

  /**
   * Get existing applications for a user and service
   */
  static async getUserApplicationsForService(
    userId: string,
    serviceName: string
  ): Promise<ExistingApplicationSummary[]> {
    try {
      const { data: allApplications, error } = await applicationService.getAllApplications()
      
      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      const userApplications = allApplications?.filter(app => 
        app.user_id === userId && app.service_name === serviceName
      ) || []

      return userApplications.map(app => ({
        id: app.id,
        service_name: app.service_name,
        status: app.status,
        reference_number: app.reference_number,
        created_at: app.created_at,
        application_data: app.application_data
      }))
      
    } catch (error) {
      console.error('Error getting user applications:', error)
      throw error
    }
  }

  /**
   * Get all applications for a user (useful for dashboard)
   */
  static async getAllUserApplications(userId: string): Promise<ExistingApplicationSummary[]> {
    try {
      const { data: allApplications, error } = await applicationService.getAllApplications()
      
      if (error) {
        throw new Error(`Database error: ${error.message}`)
      }

      const userApplications = allApplications?.filter(app => 
        app.user_id === userId
      ) || []

      return userApplications.map(app => ({
        id: app.id,
        service_name: app.service_name,
        status: app.status,
        reference_number: app.reference_number,
        created_at: app.created_at,
        application_data: app.application_data
      }))
      
    } catch (error) {
      console.error('Error getting all user applications:', error)
      throw error
    }
  }

  /**
   * Check specific service limits with custom business rules
   */
  static async checkServiceSpecificLimits(
    userId: string,
    serviceName: string,
    applicationData?: any
  ): Promise<ApplicationLimitResult> {
    // First do the general limit check
    const generalCheck = await this.canUserApplyForService(userId, serviceName)
    if (!generalCheck.canApply) {
      return generalCheck
    }

    // Service-specific validation
    switch (serviceName) {
      case 'Public Servant Pass':
        return await this.checkPublicServantPassLimits(userId, applicationData)
      
      case 'City Pass':
        return await this.checkCityPassLimits(userId, applicationData)
      
      case 'SEVIS Pass':
        return await this.checkSevisPassLimits(userId, applicationData)
      
      default:
        return generalCheck
    }
  }

  /**
   * Public Servant Pass specific limits
   */
  private static async checkPublicServantPassLimits(
    userId: string,
    applicationData?: any
  ): Promise<ApplicationLimitResult> {
    // Check if Public Servant ID is already used (existing logic)
    if (applicationData?.employmentInfo?.publicServantId) {
      const { data: allApplications } = await applicationService.getAllApplications()
      const existingPSApplication = allApplications?.find((app: any) => 
        app.service_name === 'Public Servant Pass' && 
        app.application_data?.employmentInfo?.publicServantId === applicationData.employmentInfo.publicServantId &&
        app.user_id !== userId // Different user with same PS ID
      )
      
      if (existingPSApplication) {
        return {
          canApply: false,
          reason: 'This Public Servant ID is already registered by another user.',
          suggestedActions: [
            'Verify your Public Servant ID is correct',
            'Contact HR if you believe this is an error',
            'Contact support for assistance'
          ]
        }
      }
    }

    return { canApply: true }
  }

  /**
   * City Pass specific limits
   */
  private static async checkCityPassLimits(
    userId: string,
    applicationData?: any
  ): Promise<ApplicationLimitResult> {
    // Add City Pass specific validation here if needed
    // For now, just the general one-per-user rule applies
    return { canApply: true }
  }

  /**
   * SEVIS Pass specific limits
   */
  private static async checkSevisPassLimits(
    userId: string,
    applicationData?: any
  ): Promise<ApplicationLimitResult> {
    // Add SEVIS Pass specific validation here if needed
    // For now, just the general one-per-user rule applies
    return { canApply: true }
  }
}
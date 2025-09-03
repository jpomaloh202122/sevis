import { supabase } from '@/lib/supabase'
import { applicationService } from '@/lib/database'

// Generate reference number for Public Servant Pass
function generatePSPassReferenceNumber(): string {
  const year = new Date().getFullYear()
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 4).toUpperCase()
  return `PSP-${year}${month}-${timestamp}-${random}`
}

export interface VettingData {
  employmentVerified: boolean
  emailVerified: boolean
  backgroundCheckRequired: boolean
  securityClearanceLevel?: 'basic' | 'confidential' | 'secret'
  vettingNotes?: string
  interviewRequired?: boolean
  recommendedAction: 'approve' | 'reject' | 'request_more_info'
  vettedBy: string
  vettedAt: string
}

export interface PSPassAdminService {
  vetApplication: (applicationId: string, vettingData: VettingData, adminId: string) => Promise<{
    success: boolean
    data?: any
    error?: string
  }>
  approveApplication: (applicationId: string, adminId: string, adminNote?: string) => Promise<{
    success: boolean
    data?: any
    error?: string
    referenceNumber?: string
  }>
  rejectApplication: (applicationId: string, adminId: string, reason: string) => Promise<{
    success: boolean
    data?: any
    error?: string
  }>
  requestMoreInfo: (applicationId: string, adminId: string, requestDetails: string) => Promise<{
    success: boolean
    data?: any
    error?: string
  }>
}

export const psPassAdminService: PSPassAdminService = {
  // Step 1: Vet the application (review and verify details)
  async vetApplication(applicationId: string, vettingData: VettingData, adminId: string) {
    try {
      // Get the current application
      const { data: application, error: appError } = await applicationService.getApplicationById(applicationId)
      if (appError || !application) {
        return { success: false, error: 'Application not found' }
      }

      if (application.service_name !== 'Public Servant Pass') {
        return { success: false, error: 'Not a Public Servant Pass application' }
      }

      // Update application with vetting data
      const updatedApplicationData = {
        ...application.application_data,
        vettingInfo: vettingData,
        processingStatus: {
          stage: 'vetted',
          vettedAt: vettingData.vettedAt,
          vettedBy: vettingData.vettedBy,
          nextAction: vettingData.recommendedAction
        }
      }

      // Update the application status to 'in_progress' and add vetting data
      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'in_progress',
          application_data: updatedApplicationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (error) {
        console.error('Error updating application with vetting data:', error)
        return { success: false, error: 'Failed to update vetting information' }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error vetting application:', error)
      return { success: false, error: 'An unexpected error occurred during vetting' }
    }
  },

  // Step 2: Approve application and generate reference number
  async approveApplication(applicationId: string, adminId: string, adminNote?: string) {
    try {
      // Get the current application
      const { data: application, error: appError } = await applicationService.getApplicationById(applicationId)
      if (appError || !application) {
        return { success: false, error: 'Application not found' }
      }

      if (application.service_name !== 'Public Servant Pass') {
        return { success: false, error: 'Not a Public Servant Pass application' }
      }

      // Check if application has been vetted
      const vettingInfo = application.application_data?.vettingInfo
      if (!vettingInfo || vettingInfo.recommendedAction !== 'approve') {
        return { success: false, error: 'Application must be vetted and recommended for approval first' }
      }

      // Generate reference number
      const referenceNumber = generatePSPassReferenceNumber()

      // Update application with approval and reference number
      const updatedApplicationData = {
        ...application.application_data,
        approvalInfo: {
          approvedAt: new Date().toISOString(),
          approvedBy: adminId,
          referenceNumber,
          adminNote: adminNote || '',
          passStatus: 'approved',
          validFrom: new Date().toISOString(),
          // Valid for 2 years
          validUntil: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString()
        },
        processingStatus: {
          ...application.application_data.processingStatus,
          stage: 'approved',
          approvedAt: new Date().toISOString(),
          approvedBy: adminId
        }
      }

      // Update the application
      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'completed',
          reference_number: referenceNumber,
          application_data: updatedApplicationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (error) {
        console.error('Error approving application:', error)
        return { success: false, error: 'Failed to approve application' }
      }

      return { 
        success: true, 
        data,
        referenceNumber
      }
    } catch (error) {
      console.error('Error approving application:', error)
      return { success: false, error: 'An unexpected error occurred during approval' }
    }
  },

  // Reject application
  async rejectApplication(applicationId: string, adminId: string, reason: string) {
    try {
      const { data: application, error: appError } = await applicationService.getApplicationById(applicationId)
      if (appError || !application) {
        return { success: false, error: 'Application not found' }
      }

      const updatedApplicationData = {
        ...application.application_data,
        rejectionInfo: {
          rejectedAt: new Date().toISOString(),
          rejectedBy: adminId,
          reason,
          canReapply: true
        },
        processingStatus: {
          ...application.application_data.processingStatus,
          stage: 'rejected',
          rejectedAt: new Date().toISOString(),
          rejectedBy: adminId
        }
      }

      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'rejected',
          application_data: updatedApplicationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (error) {
        console.error('Error rejecting application:', error)
        return { success: false, error: 'Failed to reject application' }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error rejecting application:', error)
      return { success: false, error: 'An unexpected error occurred during rejection' }
    }
  },

  // Request more information
  async requestMoreInfo(applicationId: string, adminId: string, requestDetails: string) {
    try {
      const { data: application, error: appError } = await applicationService.getApplicationById(applicationId)
      if (appError || !application) {
        return { success: false, error: 'Application not found' }
      }

      const updatedApplicationData = {
        ...application.application_data,
        infoRequestInfo: {
          requestedAt: new Date().toISOString(),
          requestedBy: adminId,
          details: requestDetails,
          status: 'pending_response'
        },
        processingStatus: {
          ...application.application_data.processingStatus,
          stage: 'awaiting_info',
          infoRequestedAt: new Date().toISOString(),
          infoRequestedBy: adminId
        }
      }

      const { data, error } = await supabase
        .from('applications')
        .update({
          status: 'in_progress',
          application_data: updatedApplicationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select()
        .single()

      if (error) {
        console.error('Error requesting more info:', error)
        return { success: false, error: 'Failed to request more information' }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Error requesting more info:', error)
      return { success: false, error: 'An unexpected error occurred' }
    }
  }
}
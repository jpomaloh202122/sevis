import { supabase } from './supabase'
import type { 
  ComprehensiveService, 
  ServiceCategory, 
  ServiceType, 
  EnhancedApplication,
  ApplicationWorkflow,
  ApplicationDocument,
  ApplicationStatus,
  WorkflowStage,
  DatabaseService
} from './database-types'

// Enhanced database service with comprehensive services support
export const enhancedDatabaseService: DatabaseService = {
  // Comprehensive Services
  async getComprehensiveServices() {
    const { data, error } = await supabase
      .from('comprehensive_services')
      .select('*')
      .eq('is_active', true)
      .order('service_category', { ascending: true })
      .order('priority_level', { ascending: false })
    
    return { data, error }
  },

  async getServicesByCategory(category: ServiceCategory) {
    const { data, error } = await supabase
      .from('comprehensive_services')
      .select('*')
      .eq('service_category', category)
      .eq('is_active', true)
      .order('priority_level', { ascending: false })
    
    return { data, error }
  },

  async getServiceByType(serviceType: ServiceType) {
    const { data, error } = await supabase
      .from('comprehensive_services')
      .select('*')
      .eq('service_type', serviceType)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  },

  // Enhanced Applications with pagination
  async getEnhancedApplications(limit: number = 50, offset: number = 0) {
    const { data, error } = await supabase
      .from('v_application_summary')
      .select('*')
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  async getEnhancedUserApplications(userId: string) {
    const { data, error } = await supabase
      .from('v_application_summary')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
    
    return { data, error }
  },

  async getEnhancedApplicationById(id: string) {
    const { data, error } = await supabase
      .from('v_application_summary')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Application Workflow
  async createWorkflowEntry(entry: Partial<ApplicationWorkflow>) {
    const { data, error } = await supabase
      .from('application_workflow')
      .insert([entry])
      .select()
      .single()
    
    return { data, error }
  },

  async getApplicationWorkflow(applicationId: string) {
    const { data, error } = await supabase
      .from('application_workflow')
      .select(`
        *,
        users:action_by (
          id,
          name,
          email,
          role
        )
      `)
      .eq('application_id', applicationId)
      .order('action_date', { ascending: true })
    
    return { data, error }
  },

  async updateWorkflowStatus(id: string, status: ApplicationStatus, notes?: string) {
    const updateData: any = { status }
    if (notes) updateData.notes = notes
    
    const { data, error } = await supabase
      .from('application_workflow')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Document Management
  async uploadApplicationDocument(document: Partial<ApplicationDocument>) {
    const { data, error } = await supabase
      .from('application_documents')
      .insert([document])
      .select()
      .single()
    
    return { data, error }
  },

  async getApplicationDocuments(applicationId: string) {
    const { data, error } = await supabase
      .from('application_documents')
      .select(`
        *,
        verified_by_user:verified_by (
          id,
          name,
          email,
          role
        )
      `)
      .eq('application_id', applicationId)
      .order('uploaded_at', { ascending: false })
    
    return { data, error }
  },

  async verifyDocument(documentId: string, verifiedBy: string, notes?: string) {
    const updateData: any = {
      is_verified: true,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString()
    }
    if (notes) updateData.verification_notes = notes
    
    const { data, error } = await supabase
      .from('application_documents')
      .update(updateData)
      .eq('id', documentId)
      .select()
      .single()
    
    return { data, error }
  }
}

// Enhanced application service with workflow support
export const enhancedApplicationService = {
  // Create application with initial workflow entry
  async createApplicationWithWorkflow(applicationData: any, userId: string) {
    // Start a transaction
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single()

    if (appError || !application) {
      return { data: null, error: appError }
    }

    // Create initial workflow entry
    const workflowEntry = {
      application_id: application.id,
      status: 'pending' as ApplicationStatus,
      stage: 'submitted' as WorkflowStage,
      action_by: userId,
      notes: 'Application submitted successfully'
    }

    const { error: workflowError } = await enhancedDatabaseService.createWorkflowEntry(workflowEntry)

    if (workflowError) {
      console.error('Error creating workflow entry:', workflowError)
      // Don't fail the application creation for workflow errors
    }

    return { data: application, error: null }
  },

  // Update application status with workflow tracking
  async updateApplicationStatusWithWorkflow(
    applicationId: string, 
    status: ApplicationStatus, 
    stage: WorkflowStage,
    actionBy: string, 
    notes?: string
  ) {
    // Update application status
    const { data: application, error: appError } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single()

    if (appError) {
      return { data: null, error: appError }
    }

    // Create workflow entry
    const workflowEntry = {
      application_id: applicationId,
      status,
      stage,
      action_by: actionBy,
      notes: notes || `Status updated to ${status}`
    }

    const { error: workflowError } = await enhancedDatabaseService.createWorkflowEntry(workflowEntry)

    if (workflowError) {
      console.error('Error creating workflow entry:', workflowError)
    }

    return { data: application, error: null }
  },

  // Get application with full details (workflow + documents)
  async getApplicationWithDetails(applicationId: string) {
    const [
      { data: application, error: appError },
      { data: workflow, error: workflowError },
      { data: documents, error: docsError }
    ] = await Promise.all([
      enhancedDatabaseService.getEnhancedApplicationById(applicationId),
      enhancedDatabaseService.getApplicationWorkflow(applicationId),
      enhancedDatabaseService.getApplicationDocuments(applicationId)
    ])

    if (appError) {
      return { data: null, error: appError }
    }

    return {
      data: {
        application,
        workflow: workflow || [],
        documents: documents || []
      },
      error: null
    }
  }
}

// Service management utilities
export const serviceManagementUtils = {
  // Get services by status
  async getServicesByStatus(status: 'available' | 'coming_soon' | 'internal') {
    const { data, error } = await supabase
      .from('v_available_services')
      .select('*')
      .eq('service_status', status)
      .order('priority_level', { ascending: false })
    
    return { data, error }
  },

  // Get service statistics
  async getServiceStatistics() {
    const { data: services, error } = await supabase
      .from('comprehensive_services')
      .select('service_category, service_status')
      .eq('is_active', true)

    if (error || !services) {
      return { data: null, error }
    }

    const stats = {
      G2C: { available: 0, coming_soon: 0, internal: 0, total: 0 },
      G2B: { available: 0, coming_soon: 0, internal: 0, total: 0 },
      G2G: { available: 0, coming_soon: 0, internal: 0, total: 0 }
    }

    services.forEach(service => {
      const category = service.service_category as ServiceCategory
      const status = service.service_status
      
      if (stats[category]) {
        stats[category][status as keyof typeof stats.G2C]++
        stats[category].total++
      }
    })

    return { data: stats, error: null }
  },

  // Search services
  async searchServices(query: string, category?: ServiceCategory) {
    let queryBuilder = supabase
      .from('v_available_services')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,target_audience.cs.{${query}}`)

    if (category) {
      queryBuilder = queryBuilder.eq('service_category', category)
    }

    const { data, error } = await queryBuilder
      .order('priority_level', { ascending: false })
      .limit(20)

    return { data, error }
  }
}
import { supabase } from './supabase'
import type { Database } from './supabase'

type User = Database['public']['Tables']['users']['Row']
type Application = Database['public']['Tables']['applications']['Row']
type Service = Database['public']['Tables']['services']['Row']

// User operations
export const userService = {
  // Get user by email
  async getUserByEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()
    
    return { data, error }
  },

  // Create new user
  async createUser(userData: {
    email: string
    name: string
    role?: 'user' | 'admin' | 'super_admin' | 'approving_admin' | 'vetting_admin'
    national_id: string
    phone: string
    photo_url?: string
    password_hash?: string
  }) {
    // Users start as verified by default
    const userWithDefaults = {
      ...userData,
      role: userData.role || 'user',
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      phone_verified: false
    }

    const { data, error } = await supabase
      .from('users')
      .insert([userWithDefaults])
      .select()
      .single()
    
    return { data, error }
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Get user by ID
  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Email verification methods
  async createEmailVerification(email: string, token: string) {
    const { data, error } = await supabase
      .from('email_verifications')
      .insert([{ email, token }])
      .select()
      .single()
    
    return { data, error }
  },

  async getEmailVerification(token: string) {
    const { data, error } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('token', token)
      .eq('is_used', false)
      .single()
    
    return { data, error }
  },

  async markEmailVerificationUsed(token: string) {
    const { data, error } = await supabase
      .from('email_verifications')
      .update({ is_used: true })
      .eq('token', token)
      .select()
      .single()
    
    return { data, error }
  },

  async verifyUserEmail(email: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('email', email)
      .select()
      .single()
    
    return { data, error }
  },

  // SMS verification methods
  async createSMSVerification(phoneNumber: string, verificationCode: string) {
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 10) // 10 minutes expiry
    
    const { data, error } = await supabase
      .from('sms_verifications')
      .insert([{ 
        phone_number: phoneNumber, 
        verification_code: verificationCode,
        expires_at: expiresAt.toISOString()
      }])
      .select()
      .single()
    
    return { data, error }
  },

  async getSMSVerification(phoneNumber: string, verificationCode: string) {
    const { data, error } = await supabase
      .from('sms_verifications')
      .select('*')
      .eq('phone_number', phoneNumber)
      .eq('verification_code', verificationCode)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    return { data, error }
  },

  async markSMSVerificationUsed(phoneNumber: string, verificationCode: string) {
    const { data, error } = await supabase
      .from('sms_verifications')
      .update({ is_used: true })
      .eq('phone_number', phoneNumber)
      .eq('verification_code', verificationCode)
      .select()
      .single()
    
    return { data, error }
  },

  async verifyUserPhone(phone: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        phone_verified: true,
        phone_verified_at: new Date().toISOString()
      })
      .eq('phone', phone)
      .select()
      .single()
    
    return { data, error }
  },

  // Get user by phone number
  async getUserByPhone(phone: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()
    
    return { data, error }
  },

  // Get all admin users
  async getAdminUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('role', ['admin', 'super_admin', 'approving_admin', 'vetting_admin'])
      .order('created_at', { ascending: false })
    
    return { data, error }
  },

  // Create admin user
  async createAdminUser(adminData: {
    email: string
    name: string
    role: 'admin' | 'super_admin' | 'approving_admin' | 'vetting_admin'
    national_id: string
    phone: string
    password_hash: string
  }) {
    const userWithDefaults = {
      ...adminData,
      email_verified: true,
      email_verified_at: new Date().toISOString(),
      phone_verified: false,
      photo_url: ''
    }

    const { data, error } = await supabase
      .from('users')
      .insert([userWithDefaults])
      .select()
      .single()
    
    return { data, error }
  },

  // Update user role
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin' | 'approving_admin' | 'vetting_admin') {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Get all users
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}

// Application operations
export const applicationService = {
  // Create new application
  async createApplication(applicationData: {
    user_id: string
    service_name: string
    application_data: any
    reference_number?: string
  }) {
    const { data, error } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single()
    
    return { data, error }
  },

  // Get applications by user ID
  async getUserApplications(userId: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
    
    return { data, error }
  },

  // Get all applications (for admin)
  async getAllApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        users (
          id,
          name,
          email,
          national_id,
          photo_url
        )
      `)
      .order('submitted_at', { ascending: false })
    
    return { data, error }
  },

  // Update application status
  async updateApplicationStatus(id: string, status: 'pending' | 'in_progress' | 'completed' | 'rejected') {
    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Get application by ID
  async getApplicationById(id: string) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        users (
          id,
          name,
          email,
          national_id,
          phone
        )
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Delete application by ID
  async deleteApplication(id: string, userId: string) {
    const { data, error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
      .select()
    
    return { data, error }
  },

  // Update document verification status
  async updateDocumentVerification(applicationId: string, documentVerifications: {
    national_id_verified?: boolean
    address_proof_verified?: boolean
    category_doc_verified?: boolean
    verified_by?: string
    verification_notes?: string
  }) {
    // Update application_data with verification status
    const { data: currentApp, error: fetchError } = await supabase
      .from('applications')
      .select('application_data')
      .eq('id', applicationId)
      .single()

    if (fetchError) return { data: null, error: fetchError }

    const updatedData = {
      ...currentApp.application_data,
      documentVerifications: {
        ...currentApp.application_data.documentVerifications,
        ...documentVerifications,
        verified_at: new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('applications')
      .update({ 
        application_data: updatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single()
    
    return { data, error }
  },

  // Update application status with admin role validation and workflow enforcement
  async updateApplicationStatusWithRole(id: string, status: 'pending' | 'in_progress' | 'completed' | 'rejected', adminId: string, adminRole: string, notes?: string, vettingData?: any) {
    // Get current application to check workflow rules
    const { data: currentApp, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) return { data: null, error: fetchError }

    // Simplified role permissions - any admin can perform any status change
    const adminRoles = ['super_admin', 'approving_admin', 'vetting_admin', 'admin']
    const allowedStatuses = ['pending', 'in_progress', 'completed', 'rejected']
    
    if (!adminRoles.includes(adminRole) || !allowedStatuses.includes(status)) {
      return { data: null, error: { message: `Invalid admin role or status` } }
    }

    // Simplified workflow - no strict enforcement needed since any admin can do everything
    // Optional: You can still add basic status flow validation if needed

    // Prepare application data updates
    let updatedApplicationData = { ...currentApp.application_data }

    // Add vetting information when any admin processes application for vetting
    if (status === 'in_progress') {
      // Add vetting completion data if provided
      if (vettingData) {
        updatedApplicationData = {
          ...updatedApplicationData,
          vetting: {
            ...updatedApplicationData.vetting,
            ...vettingData
          }
        }
        console.log('Added vetting data to application:', vettingData)
      } else {
        // Legacy validation - check if all documents are verified
        const documents = currentApp.application_data?.documents || {}
        const documentVerifications = currentApp.application_data?.documentVerifications || {}
        
        const requiredVerifications = []
        if (documents.nationalIdDoc) requiredVerifications.push('national_id_verified')
        if (documents.addressProof) requiredVerifications.push('address_proof_verified')  
        if (documents.categorySpecificDoc) requiredVerifications.push('category_doc_verified')
        
        // Check that all required documents have been verified
        const unverifiedDocs = []
        for (const docField of requiredVerifications) {
          if (documentVerifications[docField] !== true) {
            const docNames = {
              national_id_verified: 'National ID Document',
              address_proof_verified: 'Proof of Address',
              category_doc_verified: 'Category-Specific Documents'
            }
            unverifiedDocs.push(docNames[docField as keyof typeof docNames])
          }
        }
        
        if (unverifiedDocs.length > 0) {
          return {
            data: null,
            error: { message: `Cannot complete vetting. Please verify all documents first: ${unverifiedDocs.join(', ')}` }
          }
        }
        
        // Add legacy vetting completion data
        updatedApplicationData.vetting = {
          completed: true,
          vetted_by: adminId,
          vetted_at: new Date().toISOString(),
          notes: notes || '',
          all_documents_verified: true,
          verified_documents: requiredVerifications
        }
      }
    }

    // Add approval information when any admin processes application for approval
    if (status === 'completed' || status === 'rejected') {
      updatedApplicationData.approval = {
        processed_by: adminId,
        processed_at: new Date().toISOString(),
        decision: status,
        notes: notes || ''
      }
    }

    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString(),
      application_data: updatedApplicationData
    }

    const { data, error } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  }
}

// Service operations
export const serviceService = {
  // Get all active services
  async getActiveServices() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name')
    
    return { data, error }
  },

  // Get services by category
  async getServicesByCategory(category: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('name')
    
    return { data, error }
  },

  // Get service by ID
  async getServiceById(id: string) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Create new service (admin only)
  async createService(serviceData: {
    name: string
    category: string
    description: string
    requirements: string[]
    processing_time: string
    fee: number
    is_active?: boolean
  }) {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single()
    
    return { data, error }
  }
}

// Statistics operations
export const statsService = {
  // Get dashboard statistics
  async getDashboardStats() {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get total applications
    const { count: totalApplications } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })

    // Get applications by status
    const { data: applicationsByStatus } = await supabase
      .from('applications')
      .select('status')

    // Get recent applications
    const { data: recentApplications } = await supabase
      .from('applications')
      .select(`
        *,
        users (
          name,
          email
        )
      `)
      .order('submitted_at', { ascending: false })
      .limit(10)

    return {
      totalUsers: totalUsers || 0,
      totalApplications: totalApplications || 0,
      applicationsByStatus: applicationsByStatus || [],
      recentApplications: recentApplications || []
    }
  }
} 
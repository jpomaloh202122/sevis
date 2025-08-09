// Admin role simulation utilities
// Since database constraints prevent custom role types, we simulate admin roles using national_id and photo_url fields

export type AdminLevel = 'super_admin' | 'approving_admin' | 'vetting_admin' | 'admin'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  national_id: string
  phone: string
  photo_url?: string | null
  admin_level?: AdminLevel
}

/**
 * Determines the admin level based on user data
 * Uses national_id and photo_url fields to simulate role hierarchy
 */
export function getAdminLevel(user: any): AdminLevel {
  if (!user) return 'admin'

  // Respect explicit DB roles if present
  if (user.role === 'super_admin') return 'super_admin'
  if (user.role === 'approving_admin') return 'approving_admin'
  if (user.role === 'vetting_admin') return 'vetting_admin'
  if (user.role === 'admin') return 'admin'
  
  // Check national_id patterns
  const nationalId = user.national_id ?? user.nationalId
  const photoUrl = user.photo_url ?? user.photoUrl

  if (nationalId?.includes('SUPER-ADMIN') || photoUrl === 'super_admin') {
    return 'super_admin'
  }
  if (nationalId?.includes('APPROVE-ADMIN') || photoUrl === 'approving_admin') {
    return 'approving_admin'
  }
  if (nationalId?.includes('VET-ADMIN') || photoUrl === 'vetting_admin') {
    return 'vetting_admin'
  }
  
  return 'admin'
}

/**
 * Enhances user object with admin_level property
 */
export function enhanceAdminUser(user: any): AdminUser {
  return {
    ...user,
    admin_level: getAdminLevel(user)
  }
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: any): boolean {
  if (!user) return false
  const allowedRoles = ['admin', 'super_admin', 'approving_admin', 'vetting_admin']
  return allowedRoles.includes(user.role)
}

/**
 * Check if user is super admin (can manage other admins)
 */
export function isSuperAdmin(user: any): boolean {
  return isAdmin(user) && getAdminLevel(user) === 'super_admin'
}

/**
 * Check if user can approve applications (any admin can approve)
 */
export function canApprove(user: any, application?: any): boolean {
  // Any admin user can approve applications
  return isAdmin(user)
}

/**
 * Check if user can vet/verify documents (any admin can vet)
 */
export function canVet(user: any): boolean {
  // Any admin user can vet and verify documents
  return isAdmin(user)
}

/**
 * Get user-friendly admin level name
 */
export function getAdminLevelName(level: AdminLevel): string {
  switch (level) {
    case 'super_admin':
      return 'Super Administrator'
    case 'approving_admin':
      return 'Approving Administrator'
    case 'vetting_admin':
      return 'Vetting Administrator'
    default:
      return 'Administrator'
  }
}

/**
 * Get admin level description
 */
export function getAdminLevelDescription(level: AdminLevel): string {
  switch (level) {
    case 'super_admin':
      return 'Full access to all admin functions including user management'
    case 'approving_admin':
      return 'Can approve or reject applications after document verification'
    case 'vetting_admin':
      return 'Can verify documents and prepare applications for approval'
    default:
      return 'Basic administrative access'
  }
}

/**
 * Get admin level color for UI
 */
export function getAdminLevelColor(level: AdminLevel): string {
  switch (level) {
    case 'super_admin':
      return 'bg-purple-100 text-purple-800'
    case 'approving_admin':
      return 'bg-green-100 text-green-800'
    case 'vetting_admin':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * Check if an application has been fully vetted by a vetting admin
 * Requires all documents to be verified AND vetting completion marker
 */
export function hasBeenVetted(application: any): boolean {
  if (!application?.application_data) return false
  
  // Check for vetting completion markers
  const vettingData = application.application_data.vetting || {}
  if (!vettingData.completed || !vettingData.vetted_by) return false
  
  // Check that all required documents have been verified
  const documents = application.application_data.documents || {}
  const documentVerifications = application.application_data.documentVerifications || {}
  
  // Define required documents that must be verified
  const requiredDocuments = []
  if (documents.nationalIdDoc) requiredDocuments.push('national_id_verified')
  if (documents.addressProof) requiredDocuments.push('address_proof_verified')  
  if (documents.categorySpecificDoc) requiredDocuments.push('category_doc_verified')
  
  // All required documents must be verified (true)
  for (const docField of requiredDocuments) {
    if (documentVerifications[docField] !== true) {
      return false
    }
  }
  
  return true
}

/**
 * Get list of unverified documents for an application
 */
export function getUnverifiedDocuments(application: any): string[] {
  if (!application?.application_data) return []
  
  const documents = application.application_data.documents || {}
  const documentVerifications = application.application_data.documentVerifications || {}
  const unverified = []
  
  const documentNames = {
    national_id_verified: 'National ID Document',
    address_proof_verified: 'Proof of Address',
    category_doc_verified: 'Category-Specific Documents'
  }
  
  if (documents.nationalIdDoc && documentVerifications.national_id_verified !== true) {
    unverified.push(documentNames.national_id_verified)
  }
  if (documents.addressProof && documentVerifications.address_proof_verified !== true) {
    unverified.push(documentNames.address_proof_verified)
  }
  if (documents.categorySpecificDoc && documentVerifications.category_doc_verified !== true) {
    unverified.push(documentNames.category_doc_verified)
  }
  
  return unverified
}

/**
 * Check if an application is ready for vetting completion
 * Vetting admins can always submit their review regardless of document verification status
 */
export function isReadyForVettingCompletion(application: any): boolean {
  // Vetting admins can always submit their vetting review
  // They are responsible for verifying documents as part of the vetting process
  return true
}

/**
 * Check if user can perform a specific action on an application
 */
export function canPerformAction(user: any, application: any, action: 'approve' | 'reject' | 'vet'): boolean {
  if (!isAdmin(user) || !application) return false
  
  const appStatus = application.status
  
  switch (action) {
    case 'vet':
      // Any admin can vet pending applications
      return appStatus === 'pending'
    
    case 'approve':
    case 'reject':
      // Any admin can approve/reject applications that are in progress or vetted
      return appStatus === 'in_progress' || appStatus === 'pending'
    
    default:
      return false
  }
}

/**
 * Get workflow status message for UI
 */
export function getWorkflowStatusMessage(application: any, userLevel: AdminLevel): string {
  const status = application.status
  const isVetted = hasBeenVetted(application)
  
  switch (status) {
    case 'pending':
      if (userLevel === 'vetting_admin' || userLevel === 'super_admin') {
        return 'Ready for vetting'
      }
      return 'Awaiting vetting by vetting administrator'
    
    case 'in_progress':
      if (isVetted) {
        if (userLevel === 'approving_admin' || userLevel === 'super_admin') {
          return 'Vetted - Ready for approval decision'
        }
        return 'Vetted - Awaiting approval by approving administrator'
      }
      return 'Currently being vetted'
    
    case 'completed':
      return 'Application approved'
    
    case 'rejected':
      return 'Application rejected'
    
    default:
      return 'Unknown status'
  }
}
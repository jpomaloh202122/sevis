// Updated Database Types for Comprehensive Services
// Generated for the enhanced G2C, G2B, G2G portal

export type ServiceCategory = 'G2C' | 'G2B' | 'G2G'
export type ServiceStatus = 'available' | 'coming_soon' | 'internal' | 'deprecated'
export type PriorityLevel = 'low' | 'medium' | 'high'
export type ApplicationStatus = 'pending' | 'in_progress' | 'completed' | 'rejected'
export type UserRole = 'user' | 'admin' | 'super_admin' | 'approving_admin' | 'vetting_admin'
export type UserProvider = 'database' | 'sevis_pass' | 'digital_id' | 'public_servant_pass'
export type SecurityClearance = 'basic' | 'confidential' | 'secret' | 'top_secret'
export type EmploymentStatus = 'active' | 'suspended' | 'terminated'
export type WorkflowStage = 'submitted' | 'document_verification' | 'review' | 'approval' | 'completed'

export type ServiceType = 
  // G2C Services
  | 'epassport' | 'city_pass' | 'drivers_license' | 'learners_permit'
  | 'ehealth' | 'eeducation' | 'ecensus' | 'elands' | 'digital_id'
  | 'eagriculture' | 'ejustice' | 'ecommon_roll' | 'evoting'
  // G2B Services
  | 'gov_service_portal' | 'sme_startup_portal' | 'ict_cluster_portal'
  | 'investment_portal' | 'business_registration' | 'eprocurement_business'
  // G2G Services
  | 'efinance' | 'ebudget' | 'ecabinet' | 'eparliament' | 'ehr'
  | 'eprocurement_gov' | 'ecustoms' | 'eadmission' | 'epip' | 'public_servant_pass'

export interface ComprehensiveService {
  id: string
  name: string
  service_type: ServiceType
  service_category: ServiceCategory
  service_status: ServiceStatus
  description: string
  detailed_description?: string
  requirements?: string[]
  documents_required?: string[]
  prerequisites?: string[]
  target_audience?: string[]
  processing_time?: string
  estimated_days?: number
  fee: number
  currency: string
  priority_level: PriorityLevel
  is_active: boolean
  launch_date?: string
  last_updated_at: string
  created_at: string
  metadata: Record<string, any>
}

export interface ApplicationWorkflow {
  id: string
  application_id: string
  status: ApplicationStatus
  stage: WorkflowStage
  action_by?: string
  action_date: string
  notes?: string
  metadata: Record<string, any>
  created_at: string
}

export interface ApplicationDocument {
  id: string
  application_id: string
  document_type: string
  document_name: string
  file_path: string
  file_size?: number
  mime_type?: string
  is_verified: boolean
  verified_by?: string
  verified_at?: string
  verification_notes?: string
  uploaded_at: string
  metadata: Record<string, any>
}

export interface EnhancedUser {
  id: string
  email: string
  name: string
  role: UserRole
  national_id?: string
  phone: string
  photo_url?: string
  password_hash?: string
  email_verified?: boolean
  email_verified_at?: string
  phone_verified?: boolean
  phone_verified_at?: string
  verification_method?: 'email' | 'sms'
  provider?: UserProvider
  employee_id?: string
  department?: string
  position?: string
  security_clearance?: SecurityClearance
  verification_level?: string
  government_services_access?: string[]
  employment_status?: EmploymentStatus
  last_verified?: string
  created_at: string
  updated_at: string
}

export interface EnhancedApplication {
  id: string
  user_id: string
  service_name: string
  status: ApplicationStatus
  application_data: any
  submitted_at: string
  updated_at: string
  reference_number: string
  // Computed fields from views
  applicant_name?: string
  applicant_email?: string
  applicant_phone?: string
  service_category?: ServiceCategory
  service_type?: ServiceType
  expected_processing_time?: string
  workflow_steps_count?: number
  documents_count?: number
  verified_documents_count?: number
}

export interface ServiceWithDetails extends ComprehensiveService {
  category_description: string
}

// Form data interfaces for different service types
export interface DriverLicenseFormData {
  licenseType: 'provisional' | 'full'
  licenseClass: string
  licensePeriod: string
  personalInfo: {
    surname: string
    givenNames: string
    residentialAddress: {
      section: string
      lot: string
      street: string
      suburb: string
    }
    postalAddress: {
      address: string
      town: string
      province: string
    }
    phoneDay: string
    mobile: string
    gender: 'Male' | 'Female'
    dateOfBirth: string
    placeOfBirth: {
      village: string
      province: string
      town: string
      country: string
    }
    nationality: string
    height: string
    eyeColour: string
    hairColour: string
    complexion: string
  }
  previousLicense: {
    oldLicenseNumber: string
    dateOfIssue: string
    placeOfIssue: string
  }
  foreignLicense: {
    hasForeignLicense: boolean
    countryOfIssue: string
    licenseNumber: string
    dateOfExpiry: string
    equivalentPNGClass: string
  }
  healthAndHistory: {
    healthAffectsDriving: boolean
    refusedLicense: boolean
    licensesCancelledSuspended: boolean
    convictedDrinkDriving: boolean
    convictedTrafficOffence: boolean
    healthAffectsDrivingDetails: string
    refusedLicenseDetails: string
    licensesCancelledSuspendedDetails: string
    convictedDrinkDrivingDetails: string
    convictedTrafficOffenceDetails: string
  }
  witness: {
    name: string
    address: string
  }
  declarations: {
    informationAccurate: boolean
    understandPenalties: boolean
  }
}

export interface LearnersPermitFormData {
  personalInfo: {
    fullName: string
    dateOfBirth: string
    placeOfBirth: string
    nationalId: string
    phoneNumber: string
    email: string
    address: string
    emergencyContactName: string
    emergencyContactPhone: string
  }
  declarations: {
    termsAccepted: boolean
    informationAccurate: boolean
    medicalFitness: boolean
  }
}

export interface CityPassFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationalId: string
  address: string
  categoryId: string
  categoryName: string
  workplaceSchool?: string
  businessType?: string
  propertyAddress?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
}

export interface PublicServantPassFormData {
  personalInfo: {
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: 'Male' | 'Female' | 'Other'
    phoneNumber: string
  }
  employmentInfo: {
    publicServantId: string
    workEmail: string
    department: string
    position?: string
    employmentStartDate?: string
    directSupervisor?: string
    officeLocation?: string
  }
  securityInfo: {
    hasPoliceClearance: boolean
    policeClearanceNumber: string
    policeClearanceDate: string
    requiresBackgroundCheck: boolean
  }
  contactInfo: {
    workAddress: string
    alternateEmail?: string
    emergencyContactName: string
    emergencyContactPhone: string
    emergencyContactRelationship: string
  }
  declarations: {
    informationAccurate: boolean
    agreesToTerms: boolean
    agreesToSecurityPolicy: boolean
    authorizeBackgroundCheck: boolean
    underststandsPenalties: boolean
  }
}

// Database service interfaces
export interface DatabaseService {
  // Comprehensive services
  getComprehensiveServices(): Promise<{ data: ComprehensiveService[] | null; error: any }>
  getServicesByCategory(category: ServiceCategory): Promise<{ data: ComprehensiveService[] | null; error: any }>
  getServiceByType(serviceType: ServiceType): Promise<{ data: ComprehensiveService | null; error: any }>
  
  // Enhanced applications
  getEnhancedApplications(): Promise<{ data: EnhancedApplication[] | null; error: any }>
  getEnhancedUserApplications(userId: string): Promise<{ data: EnhancedApplication[] | null; error: any }>
  getEnhancedApplicationById(id: string): Promise<{ data: EnhancedApplication | null; error: any }>
  
  // Application workflow
  createWorkflowEntry(entry: Partial<ApplicationWorkflow>): Promise<{ data: ApplicationWorkflow | null; error: any }>
  getApplicationWorkflow(applicationId: string): Promise<{ data: ApplicationWorkflow[] | null; error: any }>
  updateWorkflowStatus(id: string, status: ApplicationStatus, notes?: string): Promise<{ data: ApplicationWorkflow | null; error: any }>
  
  // Document management
  uploadApplicationDocument(document: Partial<ApplicationDocument>): Promise<{ data: ApplicationDocument | null; error: any }>
  getApplicationDocuments(applicationId: string): Promise<{ data: ApplicationDocument[] | null; error: any }>
  verifyDocument(documentId: string, verifiedBy: string, notes?: string): Promise<{ data: ApplicationDocument | null; error: any }>
}
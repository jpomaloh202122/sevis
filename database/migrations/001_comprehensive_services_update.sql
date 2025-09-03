-- Migration: Comprehensive Services Update
-- Date: 2025-01-11
-- Description: Updates database structure for G2C, G2B, G2G services and enhanced application management

-- 1. Update users table to support enhanced admin roles
ALTER TABLE users 
ALTER COLUMN role TYPE VARCHAR(20);

-- Update role constraint to include new admin role types
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('user', 'admin', 'super_admin', 'approving_admin', 'vetting_admin'));

-- 2. Add service_category enum for better categorization
CREATE TYPE service_category AS ENUM ('G2C', 'G2B', 'G2G');

-- 3. Add service_type enum for specific service identification
CREATE TYPE service_type AS ENUM (
  -- G2C Services
  'epassport', 'city_pass', 'drivers_license', 'learners_permit', 
  'ehealth', 'eeducation', 'ecensus', 'elands', 'digital_id', 
  'eagriculture', 'ejustice', 'ecommon_roll', 'evoting',
  -- G2B Services  
  'gov_service_portal', 'sme_startup_portal', 'ict_cluster_portal',
  'investment_portal', 'business_registration', 'eprocurement_business',
  -- G2G Services
  'efinance', 'ebudget', 'ecabinet', 'eparliament', 'ehr',
  'eprocurement_gov', 'ecustoms', 'eadmission', 'epip'
);

-- 4. Add service_status enum
CREATE TYPE service_status AS ENUM ('available', 'coming_soon', 'internal', 'deprecated');

-- 5. Update services table with enhanced structure
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_category service_category;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type service_type;
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_status service_status DEFAULT 'available';
ALTER TABLE services ADD COLUMN IF NOT EXISTS target_audience TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS prerequisites TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS documents_required TEXT[];
ALTER TABLE services ADD COLUMN IF NOT EXISTS estimated_processing_days INTEGER;
ALTER TABLE services ADD COLUMN IF NOT EXISTS priority_level VARCHAR(10) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high'));

-- 6. Create comprehensive_services table for the new service structure
CREATE TABLE IF NOT EXISTS comprehensive_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  service_type service_type NOT NULL,
  service_category service_category NOT NULL,
  service_status service_status NOT NULL DEFAULT 'available',
  description TEXT NOT NULL,
  detailed_description TEXT,
  requirements TEXT[],
  documents_required TEXT[],
  prerequisites TEXT[],
  target_audience TEXT[],
  processing_time VARCHAR(50),
  estimated_days INTEGER,
  fee DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PGK',
  priority_level VARCHAR(10) DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high')),
  is_active BOOLEAN DEFAULT true,
  launch_date DATE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(service_type)
);

-- 7. Insert comprehensive services data
INSERT INTO comprehensive_services (name, service_type, service_category, service_status, description, processing_time, estimated_days, fee, priority_level, target_audience) VALUES
-- G2C Services
('ePassport', 'epassport', 'G2C', 'coming_soon', 'Online application, payment, and status tracking for passports, with notifications for collection.', '4-6 weeks', 30, 150.00, 'high', ARRAY['citizens', 'residents']),
('City Pass', 'city_pass', 'G2C', 'available', 'Digital city access pass for residents and visitors with integrated services.', '1-2 weeks', 10, 50.00, 'high', ARRAY['property_owners', 'students', 'employees', 'business_persons']),
('Driver\'s License', 'drivers_license', 'G2C', 'available', 'Online application for provisional and full driver\'s licenses with document upload.', '4-6 weeks', 28, 300.00, 'high', ARRAY['citizens', 'residents']),
('Learner\'s Permit', 'learners_permit', 'G2C', 'available', 'Apply for learner\'s permits online with medical certificate verification.', '3-4 weeks', 21, 200.00, 'high', ARRAY['citizens', 'residents']),
('eHealth', 'ehealth', 'G2C', 'coming_soon', 'Access to health information, medical reports, appointment booking, and welfare services.', '1-3 days', 2, 0.00, 'high', ARRAY['citizens', 'residents', 'patients']),
('eEducation', 'eeducation', 'G2C', 'coming_soon', 'E-learning platforms, school fee management, statement of results, and enrollment services.', '5-10 days', 7, 25.00, 'high', ARRAY['students', 'parents', 'educators']),
('eCensus', 'ecensus', 'G2C', 'coming_soon', 'Electronic data collection for population statistics, allowing citizens to update personal information.', '1-2 days', 1, 0.00, 'medium', ARRAY['citizens', 'residents']),
('eLands', 'elands', 'G2C', 'coming_soon', 'Online inquiries and payments for state land leases and titles.', '2-4 weeks', 21, 500.00, 'high', ARRAY['citizens', 'businesses', 'developers']),
('Digital ID', 'digital_id', 'G2C', 'coming_soon', 'Secure digital identity issuance and management for accessing services, including biometric onboarding.', '1-2 weeks', 10, 75.00, 'high', ARRAY['citizens', 'residents']),
('eAgriculture', 'eagriculture', 'G2C', 'coming_soon', 'Access to farming information, market prices, and agricultural support resources.', '1-3 days', 2, 0.00, 'medium', ARRAY['farmers', 'agricultural_businesses']),
('eJustice', 'ejustice', 'G2C', 'coming_soon', 'Online access to legal services, case tracking, and justice-related applications using digital ID.', '1-4 weeks', 14, 100.00, 'high', ARRAY['citizens', 'lawyers', 'legal_entities']),
('eCommon Roll', 'ecommon_roll', 'G2C', 'coming_soon', 'Voter registration updates and electoral information management.', '2-3 weeks', 14, 0.00, 'medium', ARRAY['eligible_voters']),

-- G2B Services
('GovService Portal', 'gov_service_portal', 'G2B', 'coming_soon', 'A unified platform for accessing various government services, including forms and applications.', '1-5 days', 3, 0.00, 'high', ARRAY['businesses', 'smes', 'corporations']),
('SME Startup Portal', 'sme_startup_portal', 'G2B', 'coming_soon', 'Online business registration, resources, and tools for small and medium enterprises.', '1-2 weeks', 10, 250.00, 'high', ARRAY['entrepreneurs', 'smes', 'startups']),
('ICT Cluster Portal', 'ict_cluster_portal', 'G2B', 'coming_soon', 'Support for ICT entrepreneurship, innovation hubs, and startup incubation.', '2-3 weeks', 14, 100.00, 'medium', ARRAY['tech_companies', 'ict_startups', 'innovators']),
('Investment Portal', 'investment_portal', 'G2B', 'coming_soon', 'Centralized information on investment opportunities, economic data, and application processes.', '1-6 weeks', 21, 500.00, 'high', ARRAY['investors', 'foreign_businesses', 'developers']),
('Business Registration', 'business_registration', 'G2B', 'coming_soon', 'Online company registration, licensing, and compliance management for businesses.', '2-4 weeks', 21, 300.00, 'high', ARRAY['businesses', 'entrepreneurs', 'corporations']),
('eProcurement (Business)', 'eprocurement_business', 'G2B', 'coming_soon', 'Online tendering, procurement tracking, and supplier management for businesses.', '1-8 weeks', 28, 0.00, 'medium', ARRAY['suppliers', 'contractors', 'businesses']),

-- G2G Services
('eFinance', 'efinance', 'G2G', 'internal', 'Real-time access to financial data and reporting across government entities.', '1-2 days', 1, 0.00, 'high', ARRAY['government_agencies', 'finance_departments']),
('eBudget', 'ebudget', 'G2G', 'internal', 'Online management of budgetary processes, from planning to execution.', '1-4 weeks', 14, 0.00, 'high', ARRAY['government_agencies', 'budget_departments']),
('eCabinet', 'ecabinet', 'G2G', 'internal', 'Digital submission, tracking, and approval of executive council papers.', '1-2 weeks', 7, 0.00, 'high', ARRAY['cabinet_members', 'executive_staff']),
('eParliament', 'eparliament', 'G2G', 'internal', 'Digitization of parliamentary records, sessions, and information sharing.', '1-3 days', 2, 0.00, 'medium', ARRAY['parliamentarians', 'parliamentary_staff']),
('eHR', 'ehr', 'G2G', 'internal', 'Automated human resources management, including payroll and personnel records.', '1-2 weeks', 7, 0.00, 'high', ARRAY['government_hr', 'public_servants']),
('eCustoms', 'ecustoms', 'G2G', 'internal', 'Digital customs declarations and business transactions for trade facilitation.', '1-5 days', 3, 0.00, 'high', ARRAY['customs_officers', 'trade_officials']),
('eAdmission', 'eadmission', 'G2G', 'internal', 'Online admissions processes for higher education institutions.', '2-6 weeks', 28, 0.00, 'medium', ARRAY['education_officials', 'university_staff']),
('ePIP', 'epip', 'G2G', 'internal', 'Submission and monitoring of public investment programs.', '2-8 weeks', 35, 0.00, 'high', ARRAY['project_managers', 'investment_officials']);

-- 8. Create application_workflow table for tracking application progress
CREATE TABLE IF NOT EXISTS application_workflow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  stage VARCHAR(50) NOT NULL, -- 'submitted', 'document_verification', 'review', 'approval', 'completed'
  action_by UUID REFERENCES users(id),
  action_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create application_documents table for better document management
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP WITH TIME ZONE,
  verification_notes TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- 10. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_service_name ON applications(service_name);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_submitted_at ON applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_comprehensive_services_category ON comprehensive_services(service_category);
CREATE INDEX IF NOT EXISTS idx_comprehensive_services_status ON comprehensive_services(service_status);
CREATE INDEX IF NOT EXISTS idx_comprehensive_services_type ON comprehensive_services(service_type);
CREATE INDEX IF NOT EXISTS idx_application_workflow_application_id ON application_workflow(application_id);
CREATE INDEX IF NOT EXISTS idx_application_workflow_status ON application_workflow(status);
CREATE INDEX IF NOT EXISTS idx_application_documents_application_id ON application_documents(application_id);

-- 11. Create views for easier querying
CREATE OR REPLACE VIEW v_available_services AS
SELECT 
  cs.*,
  CASE 
    WHEN cs.service_category = 'G2C' THEN 'Government-to-Citizen'
    WHEN cs.service_category = 'G2B' THEN 'Government-to-Business'  
    WHEN cs.service_category = 'G2G' THEN 'Government-to-Government'
  END AS category_description
FROM comprehensive_services cs
WHERE cs.is_active = true;

CREATE OR REPLACE VIEW v_application_summary AS
SELECT 
  a.*,
  u.name as applicant_name,
  u.email as applicant_email,
  u.phone as applicant_phone,
  cs.service_category,
  cs.service_type,
  cs.processing_time as expected_processing_time,
  (
    SELECT COUNT(*) 
    FROM application_workflow aw 
    WHERE aw.application_id = a.id
  ) as workflow_steps_count,
  (
    SELECT COUNT(*) 
    FROM application_documents ad 
    WHERE ad.application_id = a.id
  ) as documents_count,
  (
    SELECT COUNT(*) 
    FROM application_documents ad 
    WHERE ad.application_id = a.id AND ad.is_verified = true
  ) as verified_documents_count
FROM applications a
JOIN users u ON a.user_id = u.id
LEFT JOIN comprehensive_services cs ON cs.name = a.service_name;

-- 12. Create triggers for automatic timestamping
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_update_timestamp
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER comprehensive_services_update_timestamp
  BEFORE UPDATE ON comprehensive_services
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- 13. Add RLS (Row Level Security) policies
ALTER TABLE comprehensive_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;

-- Public read access to available services
CREATE POLICY "Public read access to available services" ON comprehensive_services
  FOR SELECT TO public USING (service_status = 'available' OR service_status = 'coming_soon');

-- Users can view their own application workflows
CREATE POLICY "Users can view their own application workflows" ON application_workflow
  FOR SELECT TO public USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Users can view their own application documents
CREATE POLICY "Users can view their own application documents" ON application_documents
  FOR SELECT TO public USING (
    application_id IN (
      SELECT id FROM applications WHERE user_id = auth.uid()
    )
  );

-- Admins have full access to workflows and documents
CREATE POLICY "Admins have full access to workflows" ON application_workflow
  FOR ALL TO public USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'approving_admin', 'vetting_admin')
    )
  );

CREATE POLICY "Admins have full access to documents" ON application_documents
  FOR ALL TO public USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'approving_admin', 'vetting_admin')
    )
  );
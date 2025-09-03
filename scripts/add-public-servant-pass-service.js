/**
 * Script to add Public Servant Pass service to the comprehensive services database
 * Run this script to initialize the service in the database
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const publicServantPassService = {
  id: 'ps-pass-001',
  name: 'Public Servant Pass',
  service_type: 'public_servant_pass',
  service_category: 'G2G',
  service_status: 'available',
  description: 'Digital identity and authentication system for Papua New Guinea government employees',
  detailed_description: `The Public Servant Pass is a comprehensive Government-to-Government (G2G) digital identity and authentication system designed specifically for Papua New Guinea government employees. This service provides:

• Secure multi-factor authentication with biometric verification
• Inter-agency collaboration and access control
• Security clearance-based service access
• Real-time employment status verification
• Single Sign-On (SSO) for government systems
• Integration with department HR systems

The system supports all security clearance levels from Basic to Top Secret and enables seamless collaboration across government departments while maintaining the highest security standards.`,
  requirements: [
    'Active government employment status',
    'Valid Public Servant ID number (format: PS-DEPT-YYYY-NNNN)',
    'Government work email address (*.gov.pg domain)',
    'Department verification and authorization',
    'Background check (if required for security clearance)'
  ],
  documents_required: [
    'Government Employee ID Card',
    'Work Email Verification',
    'Department Authorization Letter (if required)',
    'Security Clearance Certificate (if applicable)',
    'Background Check Report (if required)'
  ],
  prerequisites: [
    'Must be an active government employee',
    'Must have a valid Public Servant ID',
    'Must have department approval for G2G access',
    'Must pass employment verification'
  ],
  target_audience: [
    'Papua New Guinea government employees',
    'Public servants with active employment status',
    'Government contractors with G2G access needs',
    'Inter-agency collaboration teams'
  ],
  processing_time: '14-30 business days (depending on security clearance requirements)',
  estimated_days: 21,
  fee: 0,
  currency: 'PGK',
  priority_level: 'high',
  is_active: true,
  launch_date: new Date().toISOString().split('T')[0],
  last_updated_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  metadata: {
    security_levels: ['basic', 'confidential', 'secret', 'top_secret'],
    supported_departments: [
      'Ministry of Finance',
      'Department of Health',
      'Department of Education',
      'Royal PNG Constabulary',
      'Department of Foreign Affairs',
      'PNG Defence Force',
      'Department of Justice',
      'Department of Works',
      'Department of Lands',
      'Department of Commerce'
    ],
    g2g_services: [
      'efinance',
      'ebudget',
      'ecabinet',
      'eparliament',
      'ehr',
      'eprocurement_gov',
      'ecustoms',
      'eadmission',
      'epip'
    ],
    features: [
      'Multi-factor authentication',
      'Biometric verification',
      'Security clearance integration',
      'Inter-agency SSO',
      'Real-time status updates',
      'Department integration'
    ],
    contact_info: {
      primary_contact: 'Personnel Management Division',
      email: 'pmd@gov.pg',
      phone: '+675 321 4567',
      technical_support: 'support@sevisportal.com'
    }
  }
}

async function addPublicServantPassService() {
  try {
    console.log('Adding Public Servant Pass service to comprehensive services...')

    // Check if service already exists
    const { data: existing, error: checkError } = await supabase
      .from('comprehensive_services')
      .select('id')
      .eq('service_type', 'public_servant_pass')
      .single()

    if (existing) {
      console.log('Public Servant Pass service already exists. Updating...')
      
      const { data, error } = await supabase
        .from('comprehensive_services')
        .update({
          ...publicServantPassService,
          last_updated_at: new Date().toISOString()
        })
        .eq('service_type', 'public_servant_pass')
        .select()
        .single()

      if (error) {
        console.error('Error updating service:', error)
        return false
      }

      console.log('✅ Public Servant Pass service updated successfully!')
      console.log('Service details:', {
        id: data.id,
        name: data.name,
        category: data.service_category,
        status: data.service_status
      })
    } else {
      // Insert new service
      const { data, error } = await supabase
        .from('comprehensive_services')
        .insert([publicServantPassService])
        .select()
        .single()

      if (error) {
        console.error('Error adding service:', error)
        return false
      }

      console.log('✅ Public Servant Pass service added successfully!')
      console.log('Service details:', {
        id: data.id,
        name: data.name,
        category: data.service_category,
        status: data.service_status,
        processing_time: data.processing_time
      })
    }

    return true
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}

// Run the script
if (require.main === module) {
  addPublicServantPassService().then(success => {
    if (success) {
      console.log('\n🎉 Public Servant Pass service is now available in the G2G services catalog!')
      console.log('📍 Access it at: /services/g2g/public-servant-pass')
    } else {
      console.log('\n❌ Failed to add Public Servant Pass service')
      process.exit(1)
    }
  })
}

module.exports = { addPublicServantPassService }
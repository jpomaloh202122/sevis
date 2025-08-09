// Debug script to test admin level detection
// This would be run in browser console to test admin level detection

function testAdminLevelDetection() {
  // Test user objects that match the created admin accounts
  const testUsers = [
    {
      id: '1',
      name: 'Super Administrator',
      email: 'superadmin@sevis.gov',
      role: 'admin',
      national_id: 'SUPER-ADMIN-123456',
      phone: '+675-123-0001',
      photo_url: null
    },
    {
      id: '2', 
      name: 'Approving Administrator',
      email: 'adminapproval@sevis.gov',
      role: 'admin',
      national_id: 'APPROVE-ADMIN-123457',
      phone: '+675-123-0002',
      photo_url: null
    },
    {
      id: '3',
      name: 'Vetting Administrator', 
      email: 'adminvet@sevis.gov',
      role: 'admin',
      national_id: 'VET-ADMIN-123458',
      phone: '+675-123-0003',
      photo_url: null
    }
  ]

  // Test admin level detection
  testUsers.forEach(user => {
    console.log(`User: ${user.name}`)
    console.log(`National ID: ${user.national_id}`)
    console.log(`Admin Level: ${getAdminLevel(user)}`)
    console.log(`Can Vet: ${canVet(user)}`)
    console.log(`Can Approve: ${canApprove(user)}`)
    console.log('---')
  })

  // Test with a sample pending application
  const sampleApplication = {
    id: 'test-app-1',
    status: 'pending',
    application_data: {
      documents: {
        nationalIdDoc: true,
        addressProof: true,
        categorySpecificDoc: true
      },
      documentVerifications: {}
    }
  }

  console.log('Testing canPerformAction with pending application:')
  testUsers.forEach(user => {
    console.log(`${user.name} can vet: ${canPerformAction(user, sampleApplication, 'vet')}`)
    console.log(`${user.name} can approve: ${canPerformAction(user, sampleApplication, 'approve')}`)
  })
}

// Instructions: Copy and paste this into browser console on the admin page
// Then call: testAdminLevelDetection()
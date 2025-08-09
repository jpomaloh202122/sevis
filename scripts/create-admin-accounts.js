const bcrypt = require('bcryptjs')

// This script generates the admin accounts data with hashed passwords
// Run this to get the SQL INSERT statements or data for manual creation

async function createAdminAccounts() {
  const password = 'Admin123!' // Common password for all demo accounts
  const saltRounds = 12
  
  try {
    const passwordHash = await bcrypt.hash(password, saltRounds)
    
    const adminAccounts = [
      {
        name: 'Super Administrator',
        email: 'superadmin@sevis.gov',
        role: 'super_admin',
        phone: '+675-555-0001',
        national_id: 'SA-001-2024',
        password_hash: passwordHash
      },
      {
        name: 'Approval Administrator',
        email: 'adminapproval@sevis.gov', 
        role: 'approving_admin',
        phone: '+675-555-0002',
        national_id: 'AA-002-2024',
        password_hash: passwordHash
      },
      {
        name: 'Vetting Administrator',
        email: 'adminvet@sevis.gov',
        role: 'vetting_admin', 
        phone: '+675-555-0003',
        national_id: 'VA-003-2024',
        password_hash: passwordHash
      }
    ]

    console.log('=== ADMIN ACCOUNTS DATA ===')
    console.log('Password for all accounts:', password)
    console.log('Hashed password:', passwordHash)
    console.log('\n=== ACCOUNTS TO CREATE ===')
    
    adminAccounts.forEach((account, index) => {
      console.log(`\n${index + 1}. ${account.name}`)
      console.log(`   Email: ${account.email}`)
      console.log(`   Role: ${account.role}`)
      console.log(`   Phone: ${account.phone}`)
      console.log(`   National ID: ${account.national_id}`)
    })

    console.log('\n=== SQL INSERT STATEMENTS ===')
    
    adminAccounts.forEach(account => {
      console.log(`
INSERT INTO users (
  name, email, role, phone, national_id, password_hash,
  email_verified, email_verified_at, phone_verified, photo_url, created_at
) VALUES (
  '${account.name}',
  '${account.email}',
  '${account.role}',
  '${account.phone}',
  '${account.national_id}',
  '${account.password_hash}',
  true,
  '${new Date().toISOString()}',
  false,
  '',
  '${new Date().toISOString()}'
);`)
    })

    console.log('\n=== JAVASCRIPT OBJECTS FOR API CALLS ===')
    console.log(JSON.stringify(adminAccounts, null, 2))
    
    return adminAccounts

  } catch (error) {
    console.error('Error creating admin accounts:', error)
  }
}

// Run the function
createAdminAccounts()

module.exports = { createAdminAccounts }
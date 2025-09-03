require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function debugRegistration() {
  console.log('🔍 Debugging registration process...');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test data
  const testEmail = 'debug-test@example.com';
  const testData = {
    firstName: 'Debug',
    lastName: 'Test',
    email: testEmail,
    phone: '+675123456',
    nationalId: '',
    password: 'TestPass123!'
  };
  
  try {
    console.log('📊 Step 1: Check current pending registrations...');
    const { data: existing } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', testEmail);
    
    console.log('Existing pending registrations:', existing?.length || 0);
    
    // Clean up any existing test data
    if (existing && existing.length > 0) {
      console.log('🧹 Cleaning up existing test data...');
      await supabase
        .from('pending_registrations')
        .delete()
        .eq('email', testEmail);
    }
    
    console.log('\n📊 Step 2: Generate verification code...');
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated code:', verificationCode);
    
    console.log('\n📊 Step 3: Hash password...');
    const passwordHash = await bcrypt.hash(testData.password, 12);
    console.log('Password hashed successfully');
    
    console.log('\n📊 Step 4: Calculate expiration...');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);
    console.log('Expires at:', expiresAt.toISOString());
    
    console.log('\n📊 Step 5: Insert pending registration...');
    const insertData = {
      email: testData.email,
      name: `${testData.firstName} ${testData.lastName}`,
      phone: testData.phone,
      national_id: testData.nationalId || null,
      password_hash: passwordHash,
      verification_code: verificationCode,
      expires_at: expiresAt.toISOString()
    };
    
    console.log('Inserting data:', {
      email: insertData.email,
      name: insertData.name,
      phone: insertData.phone,
      verification_code: insertData.verification_code,
      expires_at: insertData.expires_at
    });
    
    const { data: insertResult, error: insertError } = await supabase
      .from('pending_registrations')
      .insert([insertData])
      .select();
    
    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      return;
    }
    
    console.log('✅ Insert successful:', insertResult);
    
    console.log('\n📊 Step 6: Verify data in database...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', testEmail);
    
    if (verifyError) {
      console.error('❌ Verification failed:', verifyError);
    } else {
      console.log('✅ Data verified in DB:', verifyData);
      
      if (verifyData && verifyData.length > 0) {
        const record = verifyData[0];
        console.log('\n🔍 Database Record Analysis:');
        console.log('- ID:', record.id);
        console.log('- Email:', record.email);
        console.log('- Name:', record.name);
        console.log('- Phone:', record.phone);
        console.log('- Verification Code:', record.verification_code || 'MISSING!');
        console.log('- Expires At:', record.expires_at);
        console.log('- Created At:', record.created_at);
        
        if (!record.verification_code) {
          console.log('🚨 ISSUE FOUND: verification_code is missing from database!');
          console.log('This means the table schema is incomplete.');
        }
      }
    }
    
    console.log('\n📊 Step 7: Test email sending with the code...');
    const apiKey = process.env.RESEND_API_KEY;
    
    if (!apiKey) {
      console.log('❌ No RESEND_API_KEY found');
    } else {
      console.log('✅ RESEND_API_KEY found');
      
      const emailData = {
        from: 'SEVIS Portal <noreply@sevispng.com>',
        to: ['pomalohjoshua@gmail.com'],
        subject: 'Debug: Registration Verification Code',
        html: `
          <h1>Debug Test Email</h1>
          <p>Verification Code: <strong style="font-size: 24px; color: red;">${verificationCode}</strong></p>
          <p>This is a debug email to test the registration flow.</p>
        `
      };
      
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (emailResponse.ok) {
        const result = await emailResponse.json();
        console.log('✅ Debug email sent successfully');
        console.log('📧 Message ID:', result.id);
      } else {
        const error = await emailResponse.text();
        console.log('❌ Email failed:', error);
      }
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('pending_registrations')
      .delete()
      .eq('email', testEmail);
    
    console.log('✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugRegistration();
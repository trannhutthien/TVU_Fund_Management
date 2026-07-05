/**
 * Test Script: School Bank Accounts Endpoint
 * 
 * Tests the new GET /api/bank-accounts/school endpoint
 * to verify it returns school bank accounts correctly
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testSchoolBankAccounts() {
  console.log('🧪 Testing GET /api/bank-accounts/school endpoint...\n');

  try {
    const response = await fetch(`${BASE_URL}/bank-accounts/school`);
    const data = await response.json();

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ SUCCESS: Endpoint returned successfully');
      console.log(`📋 Found ${data.data?.length || 0} school bank account(s)`);
      
      if (data.data && data.data.length > 0) {
        console.log('\n🏦 School Bank Accounts:');
        data.data.forEach((acc, idx) => {
          console.log(`\n  Account #${idx + 1}:`);
          console.log(`    - Bank: ${acc.tenNganHang}`);
          console.log(`    - Account Number: ${acc.soTaiKhoan}`);
          console.log(`    - Account Holder: ${acc.chuTaiKhoan}`);
          console.log(`    - Branch: ${acc.chiNhanh || 'N/A'}`);
          console.log(`    - Status: ${acc.trangThai}`);
        });
      } else {
        console.log('\n⚠️  No school bank accounts found in database');
        console.log('   Please ensure migration was run and seed data exists');
      }
    } else {
      console.log('\n❌ FAILED: API returned success: false');
      console.log('   Message:', data.message);
    }
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('   Make sure the server is running on port 5000');
  }
}

// Run the test
testSchoolBankAccounts();

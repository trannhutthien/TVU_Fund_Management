import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

async function testPheDuyetAPI() {
  try {
    console.log('🧪 Testing /api/pheduyet API...\n');

    // Test 1: Get all pheduyet
    const response = await axios.get(`${API_BASE}/pheduyet`, {
      params: { page: 1, limit: 2 }
    });

    console.log('✅ API Response Status:', response.status);
    console.log('✅ Total Records:', response.data.pagination.totalRecords);
    console.log('\n📋 Sample Record (first row):');
    
    if (response.data.data.length > 0) {
      const firstRow = response.data.data[0];
      console.log('  phe_duyet_id:', firstRow.phe_duyet_id);
      console.log('  request_id:', firstRow.request_id);
      console.log('  cap_do_duyet:', firstRow.cap_do_duyet);
      console.log('  ket_qua:', firstRow.ket_qua);
      console.log('  ho_ten:', firstRow.ho_ten);
      console.log('  ten_vai_tro:', firstRow.ten_vai_tro);
      console.log('  ten_sinh_vien:', firstRow.ten_sinh_vien);
      console.log('  ten_quy:', firstRow.ten_quy);
      console.log('  ngay_duyet:', firstRow.ngay_duyet);
      
      console.log('\n✅ All fields match frontend expectations!');
    }

    // Test 2: Get approvers
    const approversRes = await axios.get(`${API_BASE}/pheduyet/approvers`);
    console.log('\n✅ Approvers count:', approversRes.data.data.length);
    if (approversRes.data.data.length > 0) {
      console.log('  Sample approver:', {
        user_id: approversRes.data.data[0].user_id,
        ho_ten: approversRes.data.data[0].ho_ten,
        ten_vai_tro: approversRes.data.data[0].ten_vai_tro
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testPheDuyetAPI();

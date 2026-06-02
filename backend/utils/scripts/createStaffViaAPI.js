/**
 * Script tạo tài khoản staff (Admin, Kế toán, Cán bộ Quỹ) qua API
 * 
 * Cách chạy:
 * 1. Đảm bảo server đang chạy: npm start
 * 2. Chạy script: node utils/createStaffViaAPI.js
 * 
 * Lưu ý: Script này cần một tài khoản Admin hoặc Cán bộ Quỹ (role 1 hoặc 3) 
 * để có quyền tạo user mới. Nếu chưa có, dùng script seedStaffUsers.js để tạo trực tiếp vào DB.
 */

import axios from 'axios';

// Cấu hình
const API_BASE_URL = 'http://localhost:5001/api';

// Danh sách staff cần tạo
const staffUsers = [
  {
    maSoDinhDanh: 'ADMIN001',
    hoTen: 'Nguyễn Văn Admin',
    email: 'admin@tvu.edu.vn',
    matKhau: '123456',
    roleId: 1,
    khoaphong: 'Phòng Quản trị',
    soDienThoai: '0901234567',
    trangThai: 'HOAT_DONG'
  },
  {
    maSoDinhDanh: 'KT001',
    hoTen: 'Trần Thị Kế Toán',
    email: 'ketoan@tvu.edu.vn',
    matKhau: '123456',
    roleId: 2,
    khoaphong: 'Phòng Tài chính',
    soDienThoai: '0902345678',
    trangThai: 'HOAT_DONG'
  },
  {
    maSoDinhDanh: 'CB001',
    hoTen: 'Lê Văn Cán Bộ',
    email: 'canbo@tvu.edu.vn',
    matKhau: '123456',
    roleId: 3,
    khoaphong: 'Phòng Công tác sinh viên',
    soDienThoai: '0903456789',
    trangThai: 'HOAT_DONG'
  }
];

/**
 * Tạo một user qua API
 */
async function createUser(userData, accessToken) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users`,
      userData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { success: true, data: response.data };
  } catch (error) {
    if (error.response) {
      return { 
        success: false, 
        error: error.response.data.message || 'Lỗi không xác định' 
      };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Đăng nhập để lấy access token
 * Yêu cầu: Phải có ít nhất 1 tài khoản Admin hoặc Cán bộ Quỹ trong DB
 */
async function login(email, password) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      matKhau: password
    });
    
    return { 
      success: true, 
      accessToken: response.data.accessToken,
      user: response.data.user
    };
  } catch (error) {
    if (error.response) {
      return { 
        success: false, 
        error: error.response.data.message || 'Lỗi đăng nhập' 
      };
    }
    return { success: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Bắt đầu tạo tài khoản staff qua API...\n');

  // Bước 1: Đăng nhập với tài khoản có quyền (Admin hoặc Cán bộ Quỹ)
  console.log('📝 Nhập thông tin đăng nhập của tài khoản có quyền tạo user (Admin hoặc Cán bộ Quỹ):');
  console.log('   Nếu chưa có tài khoản nào, hãy chạy: npm run seed:staff\n');
  
  // Thử đăng nhập với admin@tvu.edu.vn (nếu đã tồn tại)
  const loginResult = await login('admin@tvu.edu.vn', '123456');
  
  if (!loginResult.success) {
    console.error('❌ Không thể đăng nhập:', loginResult.error);
    console.log('\n💡 Giải pháp:');
    console.log('   1. Chạy: npm run seed:staff (tạo user trực tiếp vào DB)');
    console.log('   2. Hoặc tạo thủ công 1 tài khoản Admin trong database');
    console.log('   3. Sau đó chạy lại script này\n');
    process.exit(1);
  }

  console.log(`✅ Đăng nhập thành công với: ${loginResult.user.email}`);
  console.log(`   Vai trò: ${loginResult.user.tenVaiTro || `Role ${loginResult.user.vaiTro}`}\n`);

  const accessToken = loginResult.accessToken;

  // Bước 2: Tạo từng user
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const userData of staffUsers) {
    console.log(`📌 Đang tạo: ${userData.hoTen} (${userData.email})...`);
    
    const result = await createUser(userData, accessToken);
    
    if (result.success) {
      console.log(`   ✅ Thành công! User ID: ${result.data.user.id}`);
      successCount++;
    } else {
      if (result.error.includes('Email đã được sử dụng')) {
        console.log(`   ⚠️  Đã tồn tại, bỏ qua`);
        skipCount++;
      } else {
        console.log(`   ❌ Lỗi: ${result.error}`);
        errorCount++;
      }
    }
  }

  // Tổng kết
  console.log('\n' + '='.repeat(60));
  console.log('📊 KẾT QUẢ:');
  console.log(`   ✅ Tạo thành công: ${successCount} tài khoản`);
  console.log(`   ⚠️  Đã tồn tại: ${skipCount} tài khoản`);
  console.log(`   ❌ Lỗi: ${errorCount} tài khoản`);
  console.log('='.repeat(60));

  if (successCount > 0 || skipCount > 0) {
    console.log('\n🎉 HOÀN TẤT! Thông tin đăng nhập:');
    console.log('\n┌─────────────────────────────────────────────────────┐');
    console.log('│  ADMIN                                              │');
    console.log('│  Email: admin@tvu.edu.vn                            │');
    console.log('│  Mật khẩu: 123456                                   │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│  KẾ TOÁN                                            │');
    console.log('│  Email: ketoan@tvu.edu.vn                           │');
    console.log('│  Mật khẩu: 123456                                   │');
    console.log('├─────────────────────────────────────────────────────┤');
    console.log('│  CÁN BỘ QUỸ                                         │');
    console.log('│  Email: canbo@tvu.edu.vn                            │');
    console.log('│  Mật khẩu: 123456                                   │');
    console.log('└─────────────────────────────────────────────────────┘\n');
  }
}

// Chạy script
main().catch(error => {
  console.error('❌ Lỗi không mong muốn:', error.message);
  process.exit(1);
});

/**
 * Migration Script: Tạo user accounts cho các nhà tài trợ id 2, 3, 4
 * 
 * Mục đích: Tạo tài khoản người dùng cho các nhà tài trợ đã tồn tại
 * Mật khẩu: 12345678 (đã hash bằng bcrypt)
 * 
 * Chạy: node backend/database/migrations/create_users_for_donors_2_3_4.js
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

const SALT_ROUNDS = 10;
const DEFAULT_PASSWORD = '12345678';

// Database connection config
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'quy_hoc_bong',
  port: process.env.DB_PORT || 3306,
};

async function createUsersForDonors() {
  let connection;

  try {
    console.log('=== BẮT ĐẦU TẠO USER ACCOUNTS CHO NHÀ TÀI TRỢ ID 2, 3, 4 ===\n');
    
    // Kết nối database
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Kết nối database thành công\n');

    // Lấy thông tin 3 nhà tài trợ
    const [donors] = await connection.execute(
      `SELECT nhataitro_id, tennhataitro, email, sodienthoai, loainhataitro, nguoidung_id
       FROM nhataitro 
       WHERE nhataitro_id IN (2, 3, 4)
       ORDER BY nhataitro_id`
    );

    if (donors.length === 0) {
      console.log('⚠ Không tìm thấy nhà tài trợ nào với id 2, 3, 4');
      return;
    }

    console.log('Tìm thấy các nhà tài trợ:');
    donors.forEach(d => {
      console.log(`  - ID ${d.nhataitro_id}: ${d.tennhataitro} (${d.email || 'không có email'})`);
      console.log(`    nguoidung_id hiện tại: ${d.nguoidung_id || 'NULL'}`);
    });
    console.log('');

    // Hash mật khẩu một lần duy nhất
    console.log(`Đang hash mật khẩu "${DEFAULT_PASSWORD}"...`);
    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
    console.log(`✓ Hash completed: ${hashedPassword}\n`);

    // Xử lý từng nhà tài trợ
    let createdCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const donor of donors) {
      console.log(`--- Xử lý nhà tài trợ ID ${donor.nhataitro_id}: ${donor.tennhataitro} ---`);

      // Kiểm tra nếu đã có nguoidung_id
      if (donor.nguoidung_id) {
        console.log(`⚠ Nhà tài trợ đã có nguoidung_id = ${donor.nguoidung_id}, bỏ qua`);
        skippedCount++;
        console.log('');
        continue;
      }

      // Kiểm tra email
      if (!donor.email) {
        console.log(`⚠ Nhà tài trợ không có email, không thể tạo tài khoản`);
        skippedCount++;
        console.log('');
        continue;
      }

      try {
        // Kiểm tra email đã tồn tại trong bảng nguoidung chưa
        const [existingUsers] = await connection.execute(
          'SELECT nguoidung_id, email, loaitaikhoan FROM nguoidung WHERE email = ?',
          [donor.email]
        );

        if (existingUsers.length > 0) {
          const existingUser = existingUsers[0];
          console.log(`ℹ Email đã tồn tại trong bảng nguoidung (ID: ${existingUser.nguoidung_id})`);
          
          // Liên kết nhà tài trợ với user đã tồn tại
          await connection.execute(
            'UPDATE nhataitro SET nguoidung_id = ? WHERE nhataitro_id = ?',
            [existingUser.nguoidung_id, donor.nhataitro_id]
          );
          
          console.log(`✓ Đã liên kết nhà tài trợ với user ID ${existingUser.nguoidung_id}`);
          updatedCount++;
        } else {
          // Tạo user mới (bảng nguoidung không có tendangnhap, chỉ dùng email)
          // vaitro_id = 4, loaitaikhoan = 'Sinh vien'
          const [result] = await connection.execute(
            `INSERT INTO nguoidung (email, matkhau, hoten, sodienthoai, vaitro_id, loaitaikhoan, trangthai)
             VALUES (?, ?, ?, ?, 4, 'Sinh vien', 'Hoat dong')`,
            [donor.email, hashedPassword, donor.tennhataitro, donor.sodienthoai]
          );

          const newUserId = result.insertId;
          console.log(`✓ Tạo user mới thành công (ID: ${newUserId})`);
          console.log(`  - Email (dùng để đăng nhập): ${donor.email}`);
          console.log(`  - Mật khẩu: ${DEFAULT_PASSWORD}`);
          console.log(`  - Vai trò ID: 4`);
          console.log(`  - Loại tài khoản: Sinh vien`);

          // Cập nhật nguoidung_id vào bảng nhataitro
          await connection.execute(
            'UPDATE nhataitro SET nguoidung_id = ? WHERE nhataitro_id = ?',
            [newUserId, donor.nhataitro_id]
          );

          console.log(`✓ Đã liên kết nhà tài trợ với user ID ${newUserId}`);
          createdCount++;
        }
      } catch (err) {
        console.error(`✗ Lỗi khi xử lý nhà tài trợ ID ${donor.nhataitro_id}:`, err.message);
        skippedCount++;
      }

      console.log('');
    }

    // Tóm tắt kết quả
    console.log('=== KẾT QUẢ ===');
    console.log(`✓ Đã tạo mới: ${createdCount} user accounts`);
    console.log(`✓ Đã liên kết với user có sẵn: ${updatedCount}`);
    console.log(`⚠ Bỏ qua: ${skippedCount}`);
    console.log(`📝 Tổng số nhà tài trợ xử lý: ${donors.length}`);
    
    if (createdCount > 0) {
      console.log(`\n🔑 Thông tin đăng nhập:`);
      console.log(`   Mật khẩu cho tất cả: ${DEFAULT_PASSWORD}`);
      console.log(`   Đăng nhập bằng: EMAIL (không có username riêng)`);
    }

  } catch (error) {
    console.error('\n✗ LỖI:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Đã đóng kết nối database');
    }
  }
}

// Chạy migration
createUsersForDonors()
  .then(() => {
    console.log('\n=== HOÀN THÀNH ===\n');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n✗ Script thất bại:', err);
    process.exit(1);
  });

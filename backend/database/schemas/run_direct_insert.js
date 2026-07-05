/**
 * Script insert trực tiếp tài khoản ngân hàng
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import pool from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runInsert() {
  let connection;
  
  try {
    console.log('🏦 Đang thêm tài khoản ngân hàng nhà trường...\n');
    
    connection = await pool.getConnection();
    
    // Insert Agribank
    console.log('📝 Thêm tài khoản Agribank...');
    await connection.query(`
      INSERT IGNORE INTO taikhoannganhang (
        sotaikhoan, 
        nganhang, 
        chinhanh, 
        chutaikhoan, 
        loaitaikhoan, 
        trangthai
      ) VALUES (
        '1860205086886',
        'AGRIBANK',
        'Chi nhánh Trà Vinh',
        'TRUONG DAI HOC TRA VINH',
        'Nha truong',
        'Hoat dong'
      )
    `);
    console.log('✅ Agribank added');
    
    // Insert Vietinbank
    console.log('📝 Thêm tài khoản Vietinbank...');
    await connection.query(`
      INSERT IGNORE INTO taikhoannganhang (
        sotaikhoan, 
        nganhang, 
        chinhanh, 
        chutaikhoan, 
        loaitaikhoan, 
        trangthai
      ) VALUES (
        '109004285888',
        'VIETINBANK',
        'Chi nhánh Trà Vinh',
        'TRUONG DAI HOC TRA VINH',
        'Nha truong',
        'Hoat dong'
      )
    `);
    console.log('✅ Vietinbank added\n');
    
    // Hiển thị kết quả
    const [rows] = await connection.query(`
      SELECT 
        taikhoannganhang_id,
        sotaikhoan,
        nganhang,
        chinhanh,
        chutaikhoan,
        loaitaikhoan,
        trangthai
      FROM taikhoannganhang
      WHERE loaitaikhoan = 'Nha truong'
      ORDER BY ngaytao DESC
    `);
    
    console.log('📊 Tổng số tài khoản nhà trường:', rows.length);
    console.table(rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

runInsert();

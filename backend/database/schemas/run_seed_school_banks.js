/**
 * Script để chạy seed data cho school bank accounts
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import pool from '../../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runSeed() {
  let connection;
  
  try {
    console.log('🌱 Đang seed thêm tài khoản ngân hàng nhà trường...\n');
    
    // Đọc file SQL
    const sqlPath = join(__dirname, 'seed_more_school_bank_accounts.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');
    
    // Tách các statements (bỏ qua comments và USE statement)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => 
        stmt.length > 0 && 
        !stmt.startsWith('--') && 
        !stmt.startsWith('/*') &&
        !stmt.toUpperCase().startsWith('USE')
      );
    
    connection = await pool.getConnection();
    
    // Chạy từng statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        console.log(`📝 Đang thực thi statement ${i + 1}/${statements.length}...`);
        await connection.query(stmt);
      }
    }
    
    console.log('\n✅ Seed data thành công!\n');
    
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
    
    console.log('📊 Danh sách tài khoản nhà trường:');
    console.table(rows);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed data:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

runSeed();

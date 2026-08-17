/**
 * Script kiểm tra các records yeucauhotro để tìm dữ liệu test
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

import pool from '../../config/db.js';

async function checkYeuCauHoTro() {
  try {
    console.log('🔍 Tìm kiếm các records yeucauhotro...\n');
    
    // Tìm tất cả yeucauhotro
    const [rows] = await pool.query(`
      SELECT 
        yeucauhotro_id,
        nguoidung_id,
        tieu_de,
        trangthai,
        loaihotro,
        sotiendenghi,
        ngaynop,
        ngaycapnhat
      FROM yeucauhotro
      ORDER BY yeucauhotro_id DESC
      LIMIT 20
    `);
    
    console.log(`Tìm thấy ${rows.length} records gần nhất:\n`);
    console.table(rows);
    
    // Tìm các record có vẻ là test data (ví dụ: có từ "test" trong tieu_de)
    const [testRows] = await pool.query(`
      SELECT 
        yeucauhotro_id,
        nguoidung_id,
        tieu_de,
        trangthai,
        loaihotro
      FROM yeucauhotro
      WHERE tieu_de LIKE '%test%' 
         OR tieu_de LIKE '%Test%'
         OR lydo LIKE '%test%'
         OR lydo LIKE '%Test%'
      ORDER BY yeucauhotro_id DESC
      LIMIT 10
    `);
    
    if (testRows.length > 0) {
      console.log('\n📋 Các records có vẻ là test data:');
      console.table(testRows);
    } else {
      console.log('\n✅ Không tìm thấy records có từ "test" trong tieu_de hoặc lydo');
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await pool.end();
  }
}

checkYeuCauHoTro();

/**
 * Script kiểm tra thông tin user ID 22
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

import pool from '../../config/db.js';

async function checkUser22() {
  try {
    console.log('🔍 Kiểm tra thông tin user ID 22...\n');
    
    const [rows] = await pool.query(`
      SELECT 
        nguoidung_id,
        masodinhdanh,
        hoten,
        email,
        lop,
        donvihoc_id,
        loaitaikhoan,
        trangthai
      FROM nguoidung
      WHERE nguoidung_id = 22
    `);
    
    if (rows.length === 0) {
      console.log('❌ Không tìm thấy user ID 22');
      return;
    }
    
    console.log('✅ Thông tin user ID 22:');
    console.table(rows);
    
    // Kiểm tra donvihoc
    if (rows[0].donvihoc_id) {
      const [dvRows] = await pool.query(`
        SELECT donvihoc_id, tenkhoa, madonvi
        FROM donvihoc
        WHERE donvihoc_id = ?
      `, [rows[0].donvihoc_id]);
      
      console.log('\n📋 Thông tin đơn vị học:');
      console.table(dvRows);
    }
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await pool.end();
  }
}

checkUser22();

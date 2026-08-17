/**
 * Script kiểm tra dữ liệu trong bảng donvihoc
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

import pool from '../../config/db.js';

async function checkDonViHoc() {
  try {
    console.log('🔍 Kiểm tra dữ liệu bảng donvihoc...\n');
    
    // Kiểm tra tất cả records
    const [allRows] = await pool.query(`
      SELECT 
        donvihoc_id,
        madonvi,
        tenkhoa,
        trangthai
      FROM donvihoc
      ORDER BY donvihoc_id ASC
    `);
    
    console.log(`📊 Tổng số records trong bảng donvihoc: ${allRows.length}\n`);
    
    if (allRows.length > 0) {
      console.log('Tất cả records:');
      console.table(allRows);
    }
    
    // Kiểm tra records có trangthai = 'Hoat dong'
    const [activeRows] = await pool.query(`
      SELECT 
        donvihoc_id,
        madonvi,
        tenkhoa,
        trangthai
      FROM donvihoc
      WHERE trangthai = 'Hoat dong' AND tenkhoa IS NOT NULL AND tenkhoa != ''
      ORDER BY tenkhoa ASC
    `);
    
    console.log(`\n✅ Số records có trangthai = 'Hoat dong': ${activeRows.length}\n`);
    
    if (activeRows.length > 0) {
      console.log('Records hoạt động:');
      console.table(activeRows);
    } else {
      console.log('⚠️ Không có record nào có trangthai = "Hoat dong"');
    }
    
    // Kiểm tra các giá trị trangthai khác nhau
    const [statuses] = await pool.query(`
      SELECT DISTINCT trangthai, COUNT(*) as count
      FROM donvihoc
      GROUP BY trangthai
    `);
    
    console.log('\n📈 Thống kê theo trạng thái:');
    console.table(statuses);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await pool.end();
  }
}

checkDonViHoc();

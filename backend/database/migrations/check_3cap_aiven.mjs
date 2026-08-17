import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env từ backend folder
dotenv.config({ path: join(__dirname, '../../.env') });

const runCheck = async () => {
  let connection;
  
  try {
    console.log('\n🔍 KIỂM TRA SCHEMA MÔ HÌNH 3 CẤP TRÊN AIVEN\n');
    
    // Kết nối Aiven từ DATABASE_URL
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL không tồn tại trong .env');
    }
    console.log('🔗 Kết nối:', dbUrl.substring(0, 50) + '...');
    
    connection = await mysql.createConnection(dbUrl);
    console.log('✅ Kết nối Aiven MySQL thành công\n');
    
    // 1. Kiểm tra cột capdo và loaihotro trong bảng quy
    console.log('=== 1. BẢNG QUY - CẤU TRÚC CỘT MỚI ===');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, COLUMN_DEFAULT, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'quy'
        AND COLUMN_NAME IN ('capdo', 'loaihotro', 'loaidieuhanh')
      ORDER BY ORDINAL_POSITION
    `);
    
    console.table(columns);
    
    // Kiểm tra enum loaidieuhanh
    const loaidieuhanhCol = columns.find(c => c.COLUMN_NAME === 'loaidieuhanh');
    if (loaidieuhanhCol) {
      console.log('\n📋 Enum loaidieuhanh:', loaidieuhanhCol.COLUMN_TYPE);
      const has3Values = loaidieuhanhCol.COLUMN_TYPE.includes('Tap trung - Thanh phan');
      console.log(has3Values ? '✅ Có "Tap trung - Thanh phan"' : '❌ Thiếu "Tap trung - Thanh phan"');
    }
    
    // 2. Kiểm tra bảng dexuatchuongtrinh
    console.log('\n=== 2. BẢNG DEXUATCHUONGTRINH ===');
    const [tableExists] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'dexuatchuongtrinh'
    `);
    
    if (tableExists.length > 0) {
      console.log('✅ Bảng dexuatchuongtrinh tồn tại');
      
      const [dxctColumns] = await connection.query(`
        SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'dexuatchuongtrinh'
        ORDER BY ORDINAL_POSITION
      `);
      console.log('\n📋 Cấu trúc bảng:');
      console.table(dxctColumns);
    } else {
      console.log('❌ Bảng dexuatchuongtrinh CHƯA tồn tại');
    }
    
    // 3. Phân tích dữ liệu quỹ theo cấp độ
    console.log('\n=== 3. PHÂN TÍCH DỮ LIỆU QUỸ THEO CẤP ===');
    const [quyStats] = await connection.query(`
      SELECT 
        capdo,
        loaidieuhanh,
        COUNT(*) as so_luong,
        SUM(sodu) as tong_sodu,
        GROUP_CONCAT(DISTINCT loaiquy_id) as loaiquy_ids
      FROM quy
      GROUP BY capdo, loaidieuhanh
      ORDER BY capdo
    `);
    console.table(quyStats);
    
    // 4. Kiểm tra quan hệ cha-con
    console.log('\n=== 4. KIỂM TRA CÂY PHẢ HỆ ===');
    const [tree] = await connection.query(`
      SELECT 
        q1.quy_id as cap1_id,
        q1.tenquy as cap1_ten,
        q2.quy_id as cap2_id,
        q2.tenquy as cap2_ten,
        COUNT(q3.quy_id) as so_quy_cap3
      FROM quy q1
      LEFT JOIN quy q2 ON q2.quy_cha_id = q1.quy_id AND q2.capdo = 2
      LEFT JOIN quy q3 ON q3.quy_cha_id = q2.quy_id AND q3.capdo = 3
      WHERE q1.capdo = 1
      GROUP BY q1.quy_id, q1.tenquy, q2.quy_id, q2.tenquy
      ORDER BY q1.quy_id, q2.quy_id
    `);
    console.table(tree);
    
    // 5. Kiểm tra quỹ orphan (không có cha hợp lệ)
    console.log('\n=== 5. KIỂM TRA ORPHAN FUNDS ===');
    const [orphans] = await connection.query(`
      SELECT quy_id, tenquy, capdo, quy_cha_id
      FROM quy
      WHERE capdo IN (2, 3)
        AND (quy_cha_id IS NULL 
             OR quy_cha_id NOT IN (SELECT quy_id FROM quy))
    `);
    
    if (orphans.length === 0) {
      console.log('✅ Không có orphan fund');
    } else {
      console.log('❌ Tìm thấy orphan funds:');
      console.table(orphans);
    }
    
    // 6. Summary
    console.log('\n=== 🎯 TÓM TẮT TRẠNG THÁI SPRINT A ===');
    const hasCaodo = columns.some(c => c.COLUMN_NAME === 'capdo');
    const hasLoaihotro = columns.some(c => c.COLUMN_NAME === 'loaihotro');
    const hasThanhphan = loaidieuhanhCol && loaidieuhanhCol.COLUMN_TYPE.includes('Tap trung - Thanh phan');
    const hasDexuat = tableExists.length > 0;
    
    console.log(`
✅ Cột capdo: ${hasCaodo ? 'Đã có' : 'CHƯA có'}
✅ Cột loaihotro: ${hasLoaihotro ? 'Đã có' : 'CHƯA có'}
✅ Enum Thanh phan: ${hasThanhphan ? 'Đã có' : 'CHƯA có'}
✅ Bảng dexuatchuongtrinh: ${hasDexuat ? 'Đã có' : 'CHƯA có'}

📊 SPRINT A: ${hasCaodo && hasLoaihotro && hasThanhphan && hasDexuat ? '✅ HOÀN TẤT' : '❌ CHƯA XONG'}
    `);
    
  } catch (error) {
    console.error('\n❌ LỖI:');
    console.error(error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Đã đóng kết nối');
    }
  }
};

runCheck();

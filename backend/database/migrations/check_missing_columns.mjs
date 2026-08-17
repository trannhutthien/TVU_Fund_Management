/**
 * Script kiểm tra chi tiết các cột trong bảng giaodich và nguoidung
 */

import pool from '../../config/db.js';

async function checkMissingColumns() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔍 Kiểm tra chi tiết bảng GIAODICH và NGUOIDUNG\n');

    // 1. Kiểm tra tất cả cột trong bảng giaodich
    console.log('📋 Bảng GIAODICH - Tất cả các cột:');
    const [giaoDichCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'giaodich'
      ORDER BY ORDINAL_POSITION
    `);
    
    giaoDichCols.forEach((col, idx) => {
      console.log(`   ${idx + 1}. ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${col.COLUMN_COMMENT ? `- ${col.COLUMN_COMMENT}` : ''}`);
    });

    // 2. Kiểm tra tất cả cột trong bảng nguoidung
    console.log('\n📋 Bảng NGUOIDUNG - Tất cả các cột:');
    const [nguoiDungCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'nguoidung'
      ORDER BY ORDINAL_POSITION
    `);
    
    nguoiDungCols.forEach((col, idx) => {
      console.log(`   ${idx + 1}. ${col.COLUMN_NAME} (${col.COLUMN_TYPE}) ${col.COLUMN_COMMENT ? `- ${col.COLUMN_COMMENT}` : ''}`);
    });

    // 3. Kiểm tra enum trangthai trong dexuatchuongtrinh
    console.log('\n📋 Enum TRANGTHAI trong DEXUATCHUONGTRINH:');
    const [statusCol] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'dexuatchuongtrinh'
        AND COLUMN_NAME = 'trangthai'
    `);
    
    if (statusCol.length > 0) {
      console.log(`   ${statusCol[0].COLUMN_TYPE}`);
    }

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

checkMissingColumns().catch(err => {
  console.error(err);
  process.exit(1);
});

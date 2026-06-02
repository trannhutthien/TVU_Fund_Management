import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testInsertTransaction() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Test INSERT giao dịch THU với NULL values
    const [result] = await connection.execute(`
      INSERT INTO giaodich (
        yeucauhotro_id, quy_id, nguoinhan_id, sotien, hinhthuc, trangthai, 
        chungtu, ghichu, nguoithuchien_id, ngaygiaodich
      ) VALUES (NULL, ?, NULL, ?, 'Chuyen khoan', 'Thanh cong', NULL, ?, ?, CURRENT_TIMESTAMP)
    `, [3, 20000000, 'Test duyệt khoản tài trợ #1', 1]);
    
    console.log('✅ Tạo giao dịch thành công!');
    console.log('Giao dịch ID:', result.insertId);
    
    // Rollback (xóa giao dịch test)
    await connection.execute('DELETE FROM giaodich WHERE giaodich_id = ?', [result.insertId]);
    console.log('✅ Đã xóa giao dịch test');
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error('SQL State:', error.sqlState);
    console.error('SQL:', error.sql);
  } finally {
    await connection.end();
  }
}

testInsertTransaction();

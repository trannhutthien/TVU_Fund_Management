import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testApproveDonation() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Check donations waiting for approval
    const [donations] = await connection.query(`
      SELECT khoantaitro_id, nhataitro_id, quy_id, sotien, trangthai 
      FROM khoantaitro 
      WHERE trangthai = 'Cho duyet' 
      LIMIT 3
    `);
    
    console.log('✅ Khoản tài trợ chờ duyệt:');
    console.log(JSON.stringify(donations, null, 2));
    
    // Check giaodich table structure
    const [columns] = await connection.query('DESCRIBE giaodich');
    console.log('\n✅ Cấu trúc bảng giaodich:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    await connection.end();
  }
}

testApproveDonation();

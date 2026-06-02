import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testBankAccounts() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  console.log('=== KIEM TRA THONG TIN TAI KHOAN NGAN HANG ===\n');

  const [funds] = await connection.execute('SELECT quy_id, tenquy FROM quy LIMIT 3');
  
  for (const fund of funds) {
    console.log(`Quy: ${fund.tenquy} (ID: ${fund.quy_id})`);
    
    const [accounts] = await connection.execute(
      'SELECT * FROM taikhoannganhang WHERE quy_id = ? AND trangthai = ?',
      [fund.quy_id, 'Hoat dong']
    );
    
    if (accounts.length > 0) {
      accounts.forEach(acc => {
        console.log(`  + Tai khoan: ${acc.sotaikhoan}`);
        console.log(`    Ngan hang: ${acc.nganhang}`);
        console.log(`    Chi nhanh: ${acc.chinhanh || 'N/A'}`);
        console.log(`    Chu TK: ${acc.chutaikhoan}`);
      });
    } else {
      console.log('  - Chua co tai khoan ngan hang');
    }
    console.log('');
  }

  await connection.end();
}

testBankAccounts().catch(console.error);

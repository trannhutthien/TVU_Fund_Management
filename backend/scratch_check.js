import mysql from 'mysql2/promise';

async function main() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'tvu_fund_management'
  });

  try {
    const [funds] = await connection.execute('SELECT * FROM quy');
    const [apps] = await connection.execute('SELECT * FROM yeucauhotro');

    console.log('=== FUNDS ===');
    funds.forEach(f => {
      console.log(`Quy: ${f.ten_quy}, ID: ${f.quy_id}, So Du: ${f.so_du}, Ngay Tao: ${f.created_at}, Ngay Cap Nhat: ${f.updated_at}, Trang Thai: ${f.trang_thai}`);
    });

    console.log('\n=== APPS ===');
    apps.forEach(a => {
      console.log(`App ID: ${a.request_id}, Quy ID: ${a.quy_id}, So Tien Yeu Cau: ${a.so_tien_yeu_cau}, Ngay Nop: ${a.ngay_nop}, Trang Thai: ${a.trang_thai}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

main();

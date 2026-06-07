import mysql from 'mysql2/promise';

async function seed() {
  const conn = await mysql.createConnection({
    host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_aSpzodktBU9qxNVmx7o',
    port: 23536,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });

  // Insert transactions (Thu - income)
  await conn.query(`INSERT INTO giaodich (quy_id, sotien, hinhthuc, magiaodich, trangthai, ghichu, nguoithuchien_id, ngaygiaodich) VALUES
    (1, 100000000, 'Chuyen khoan', 'GD001', 'Thanh cong', 'Quy gop dong vien', 5, '2025-09-01'),
    (1, 50000000, 'Tien mat', 'GD002', 'Thanh cong', 'Ung ho ky thuat so', 6, '2025-10-15'),
    (2, 80000000, 'Chuyen khoan', 'GD003', 'Thanh cong', 'Tai tro hoc bong', 7, '2025-11-01'),
    (3, 60000000, 'Chuyen khoan', 'GD004', 'Thanh cong', 'Nghien cuu khoa hoc', 8, '2025-12-01'),
    (4, 40000000, 'Tien mat', 'GD005', 'Thanh cong', 'Hoat dong tinh nguyen', 5, '2026-01-15'),
    (5, 30000000, 'Chuyen khoan', 'GD006', 'Thanh cong', 'Tro cap hoc phi', 6, '2026-02-01')
  `);
  console.log('Inserted 6 transactions (Thu)');

  // Insert transactions (Chi - expense)
  await conn.query(`INSERT INTO giaodich (quy_id, yeucauhotro_id, nguoinhan_id, sotien, hinhthuc, magiaodich, trangthai, ghichu, nguoithuchien_id, ngaygiaodich) VALUES
    (2, 1, 1, 5000000, 'Chuyen khoan', 'GD007', 'Thanh cong', 'Ho tro hoc bong SV 1', 5, '2025-11-10'),
    (3, 2, 2, 3000000, 'Chuyen khoan', 'GD008', 'Thanh cong', 'Ho tro du an khoa hoc', 5, '2025-12-05'),
    (4, 3, 3, 2000000, 'Tien mat', 'GD009', 'Thanh cong', 'Ho tro hoat dong TN', 5, '2026-01-20'),
    (5, 4, 4, 4000000, 'Chuyen khoan', 'GD010', 'Thanh cong', 'Tro cap hoc phi SV 2', 5, '2026-02-10'),
    (2, 5, 5, 6000000, 'Chuyen khoan', 'GD011', 'Thanh cong', 'Ho tro SV co hoan canh kho', 5, '2026-03-01')
  `);
  console.log('Inserted 5 transactions (Chi)');

  await conn.end();
  console.log('DONE');
}
seed().catch(e => console.error('ERR:', e.message));

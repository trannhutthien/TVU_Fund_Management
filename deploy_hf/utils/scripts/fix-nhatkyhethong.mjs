import mysql from 'mysql2/promise';

async function fix() {
  const conn = await mysql.createConnection({
    host: 'mysql-735ef23-trannhutthien012345-f859.b.aivencloud.com',
    user: 'avnadmin',
    password: 'AVNS_aSpzodktBU9qxNVmx7o',
    port: 23536,
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
  });

  await conn.query(`CREATE TABLE IF NOT EXISTS nhatkyhethong (
    nhatky_id INT AUTO_INCREMENT PRIMARY KEY,
    nguoidung_id INT NULL,
    hanhdong VARCHAR(100),
    loaidoituong VARCHAR(50),
    doituong_id INT NULL,
    mota TEXT NULL,
    dulieucu JSON NULL,
    dulieumoi JSON NULL,
    ipaddress VARCHAR(50) NULL,
    ngaytao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  console.log('Created nhatkyhethong');

  await conn.end();
}
fix().catch(e => console.error('ERR:', e.message));

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const url = new URL(process.env.DATABASE_URL);
const pool = mysql.createPool({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  port: parseInt(url.port) || 3306,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 5,
  connectTimeout: 30000,
});

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('=== MIGRATION: thu_hoi_lan_nop + giaodich ENUM ===\n');

    // 1. Tao bang thuhoilannop (dung quy tac dat ten: viet lien, khong gach duoi)
    console.log('1. Tao bang thuhoilannop...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS thuhoilannop (
        lan_nop_id INT(11) NOT NULL AUTO_INCREMENT,
        dieukhoanthuhoi_id INT(11) NOT NULL,
        sotien DECIMAL(15,2) NOT NULL,
        minhchungtrano VARCHAR(500) NULL,
        ghichu TEXT NULL,
        trangthaixacnhan ENUM('Cho xac nhan','Da xac nhan','Bi tu choi') DEFAULT 'Cho xac nhan',
        ghichuxacnhan TEXT NULL,
        nguoiduyet_id INT(11) NULL,
        ngayxacnhan TIMESTAMP NULL,
        ngaytao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (lan_nop_id),
        KEY idx_dkth (dieukhoanthuhoi_id),
        CONSTRAINT fk_lannop_dkth
          FOREIGN KEY (dieukhoanthuhoi_id)
          REFERENCES dieukhoanthuhoi(dieukhoanthuhoi_id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Lich su nop tien thu hoi (moi lan nop = 1 dong)'
    `);
    console.log('   OK');

    // 2. Them 'Thu hoi von' vao giaodich.loaigiaodich
    console.log('2. Them "Thu hoi von" vao giaodich.loaigiaodich...');
    await connection.query(`
      ALTER TABLE giaodich
        MODIFY COLUMN loaigiaodich ENUM('Thu','Chi','Thu hoi no','Thu hoi von')
        NOT NULL DEFAULT 'Thu'
        COMMENT 'Thu=nhan tai tro, Chi=giai ngan, Thu hoi no=thu hoi von vay, Thu hoi von=thu hoi tai tro co thu hoi'
    `);
    console.log('   OK');

    // Verify
    const [[t1]] = await connection.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'thuhoilannop'
    `);
    console.log('\nVerify: thuhoilannop exists =', t1 ? 'YES' : 'NO');

    const [[t2]] = await connection.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'giaodich' AND COLUMN_NAME = 'loaigiaodich'
    `);
    console.log('Verify: giaodich.loaigiaodich =', t2.COLUMN_TYPE);

    console.log('\nDone!');
  } catch (error) {
    console.error('Loi:', error.message);
  } finally {
    connection.release();
    pool.end();
  }
}

migrate();

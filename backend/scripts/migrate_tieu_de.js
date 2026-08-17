import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL;
const url = new URL(databaseUrl);
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
    // Kiem tra cot da ton tai chua
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'yeucauhotro' AND COLUMN_NAME = 'tieu_de'
    `);

    if (cols.length === 0) {
      await connection.query(`
        ALTER TABLE yeucauhotro
        ADD COLUMN tieu_de VARCHAR(200) DEFAULT NULL AFTER nguoidung_id
      `);
      console.log('Da them cot tieu_de vao yeucauhotro.');
    } else {
      console.log('Cot tieu_de da ton tai, tiep tuc cap nhat du lieu...');
    }

    const [updated1] = await connection.query(`
      UPDATE yeucauhotro
      SET tieu_de = SUBSTRING_INDEX(SUBSTRING_INDEX(lydo, '] -', 1), '[', -1),
          lydo = TRIM(SUBSTRING(lydo, LOCATE('] -', lydo) + 3))
      WHERE tieu_de IS NULL AND lydo LIKE '[%] - %'
    `);
    console.log(`Tach format [title] - content: ${updated1.affectedRows} dong.`);

    const [updated2] = await connection.query(`
      UPDATE yeucauhotro
      SET tieu_de = LEFT(lydo, 200)
      WHERE tieu_de IS NULL AND lydo IS NOT NULL
    `);
    console.log(`Fallback lay 200 ky tu: ${updated2.affectedRows} dong.`);

    const [rows] = await connection.query(`SELECT yeucauhotro_id, tieu_de, LEFT(lydo, 80) AS lydo FROM yeucauhotro ORDER BY yeucauhotro_id DESC LIMIT 5`);
    console.log('\nKet qua cuoi cung:');
    rows.forEach(r => console.log(`  ID ${r.yeucauhotro_id} | tieu_de: ${r.tieu_de} | lydo: ${r.lydo}`));

  } catch (error) {
    console.error('Loi migration:', error.message);
  } finally {
    connection.release();
    pool.end();
  }
}

migrate();

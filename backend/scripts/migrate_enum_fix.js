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
    console.log('=== FIX ENUM trangthai yeucauhotro ===\n');

    const [[row]] = await connection.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'yeucauhotro' AND COLUMN_NAME = 'trangthai'
    `);
    console.log('ENUM hien tai:', row.COLUMN_TYPE);

    const allValues = [
      'Cho duyet cap 1','Da duyet cap 1','Tu choi cap 1',
      'Cho duyet cap 2','Da duyet cap 2','Tu choi cap 2',
      'Cho duyet cap 3','Da duyet cap 3','Tu choi cap 3',
      'Cho giai ngan','Da giai ngan',
      'Cho nghiem thu','Da nghiem thu','Nghiem thu khong dat',
      'Tu choi',
      'Cho giai ngan dot 1','Da giai ngan dot 1',
      'Cho nghiem thu dot 1','Da nghiem thu dot 1',
      'Cho giai ngan dot 2',
      'Dang thu hoi no',
      'Hoan thanh'
    ];

    const enumStr = allValues.map(v => `'${v}'`).join(',');
    await connection.query(`
      ALTER TABLE yeucauhotro
      MODIFY COLUMN trangthai ENUM(${enumStr})
      NOT NULL DEFAULT 'Cho duyet cap 1'
    `);

    const [[row2]] = await connection.query(`
      SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'yeucauhotro' AND COLUMN_NAME = 'trangthai'
    `);
    console.log('ENUM sau fix:', row2.COLUMN_TYPE);
    console.log('\nDone!');
  } catch (error) {
    console.error('Loi:', error.message);
  } finally {
    connection.release();
    pool.end();
  }
}

migrate();

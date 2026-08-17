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

async function safeQuery(conn, sql, params = []) {
  try {
    await conn.query(sql, params);
    return true;
  } catch (err) {
    if (err.message.includes('Duplicate column') || err.message.includes('already exists')) {
      console.log(`  Da co, bo qua.`);
      return false;
    }
    throw err;
  }
}

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ═══════════════════════════════════════════════════════════════════════
    // 1. hopdongvayvon — them 5 cot moi
    // ═══════════════════════════════════════════════════════════════════════
    console.log('1. Them cot vao hopdongvayvon...');
    await safeQuery(connection, `ALTER TABLE hopdongvayvon ADD COLUMN sotien_dot1 DECIMAL(15,2) DEFAULT NULL AFTER sotienvon`);
    await safeQuery(connection, `ALTER TABLE hopdongvayvon ADD COLUMN sotien_dot2 DECIMAL(15,2) DEFAULT NULL AFTER sotien_dot1`);
    await safeQuery(connection, `ALTER TABLE hopdongvayvon ADD COLUMN ngay_giai_ngan_dot1 DATETIME DEFAULT NULL AFTER ngaydaohan`);
    await safeQuery(connection, `ALTER TABLE hopdongvayvon ADD COLUMN ngay_giai_ngan_dot2 DATETIME DEFAULT NULL AFTER ngay_giai_ngan_dot1`);
    await safeQuery(connection, `ALTER TABLE hopdongvayvon ADD COLUMN lan_nghiem_thu_dat INT DEFAULT 0 AFTER ngay_giai_ngan_dot2`);

    // Cap nhat du lieu cu: tach sotienvon thanh 50/50
    console.log('  Cap nhat du lieu cu...');
    await connection.query(`
      UPDATE hopdongvayvon
      SET sotien_dot1 = sotienvon * 0.5,
          sotien_dot2 = sotienvon * 0.5
      WHERE sotien_dot1 IS NULL AND sotienvon IS NOT NULL
    `);

    // ═══════════════════════════════════════════════════════════════════════
    // 2. yeucauhotro — them 4 gia tri enum moi
    // ═══════════════════════════════════════════════════════════════════════
    console.log('2. Cap nhat enum trangthai yeucauhotro...');
    await connection.query(`
      ALTER TABLE yeucauhotro MODIFY COLUMN trangthai enum(
        'Cho duyet cap 1','Da duyet cap 1','Tu choi cap 1',
        'Cho duyet cap 2','Da duyet cap 2','Tu choi cap 2',
        'Cho duyet cap 3','Da duyet cap 3','Tu choi cap 3',
        'Cho giai ngan','Da giai ngan',
        'Cho nghiem thu','Da nghiem thu','Nghiem thu khong dat',
        'Tu choi',
        'Cho giai ngan dot 1','Da giai ngan dot 1',
        'Cho nghiem thu dot 1','Da nghiem thu dot 1',
        'Cho giai ngan dot 2'
      ) DEFAULT 'Cho duyet cap 1'
    `);

    // ═══════════════════════════════════════════════════════════════════════
    // 3. nghiemthu — them cot dotgiaingan
    // ═══════════════════════════════════════════════════════════════════════
    console.log('3. Them cot dotgiaingan vao nghiemthu...');
    await safeQuery(connection, `ALTER TABLE nghiemthu ADD COLUMN dotgiaingan INT DEFAULT 1 AFTER lanthu`);

    // Cap nhat du lieu cu: nghiem thu cu thuoc dot 1
    await connection.query(`UPDATE nghiemthu SET dotgiaingan = 1 WHERE dotgiaingan IS NULL`);

    await connection.commit();
    console.log('\nHoan thanh migration giai ngan 2 pha!');
  } catch (error) {
    await connection.rollback();
    console.error('Loi migration:', error.message);
  } finally {
    connection.release();
    pool.end();
  }
}

migrate();

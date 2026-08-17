/**
 * Migration: Don gian hoa bang guest
 * - DROP guest_yeucauhotro (25+ cot)
 * - DROP guest_khoantaitro (20+ cot)
 * - CREATE guest_tracking (9 cot) — thay the ca 2 bang tren
 *
 * Chay: node scripts/migrate_guest_tracking.js
 */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const parseDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const url = new URL(databaseUrl);
    const sslMode = url.searchParams.get('ssl-mode');
    return {
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.replace('/', ''),
      port: parseInt(url.port) || 3306,
      ssl: sslMode ? { rejectUnauthorized: false } : undefined,
    };
  }
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tvu_fund_management',
    port: process.env.DB_PORT || 3306,
  };
};

const run = async () => {
  const conn = await mysql.createConnection(parseDatabaseConfig());
  console.log('Connected to DB');

  try {
    // 1. Kiem tra bang cu co ton tai khong
    const [tables] = await conn.query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME IN ('guest_yeucauhotro', 'guest_khoantaitro', 'guest_tracking')
    `);
    const existing = tables.map(t => t.TABLE_NAME);
    console.log('Existing tables:', existing);

    // 2. DROP bang cu neu co
    if (existing.includes('guest_khoantaitro')) {
      await conn.query('DROP TABLE guest_khoantaitro');
      console.log('Dropped guest_khoantaitro');
    }
    if (existing.includes('guest_yeucauhotro')) {
      await conn.query('DROP TABLE guest_yeucauhotro');
      console.log('Dropped guest_yeucauhotro');
    }

    // 3. DROP bang guest_tracking neu da co (de tao lai)
    if (existing.includes('guest_tracking')) {
      await conn.query('DROP TABLE guest_tracking');
      console.log('Dropped guest_tracking (existing)');
    }

    // 4. CREATE guest_tracking
    await conn.query(`
      CREATE TABLE guest_tracking (
        tracking_uuid  VARCHAR(36) PRIMARY KEY,
        hoten          VARCHAR(100) NOT NULL,
        email          VARCHAR(100) NOT NULL,
        loai           ENUM('yeucauhotro', 'khoantaitro') NOT NULL,
        quy_id         INT NOT NULL,
        sotien         DECIMAL(15,2) NOT NULL,
        otp_hash       VARCHAR(64) DEFAULT NULL,
        doituong_id    INT DEFAULT NULL,
        nguoidung_id   INT DEFAULT NULL,
        trangthai      VARCHAR(30) DEFAULT 'CHO_XAC_MINH',
        ngaytao        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_trangthai (trangthai),
        INDEX idx_otp_hash (otp_hash)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created guest_tracking');

    console.log('\nMigration completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await conn.end();
  }
};

run();

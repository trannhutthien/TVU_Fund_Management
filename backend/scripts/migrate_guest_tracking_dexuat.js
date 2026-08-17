/**
 * Migration: Them cot dexuatchuongtrinh_id vao guest_tracking
 * - Cho phep link guest voi de xuat chuong trinh (Case 4 public)
 *
 * Chay: node scripts/migrate_guest_tracking_dexuat.js
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
    // 1. Kiem tra cot da ton tai chua
    const [columns] = await conn.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'guest_tracking' 
        AND COLUMN_NAME = 'dexuatchuongtrinh_id'
    `);

    if (columns.length > 0) {
      console.log('Column dexuatchuongtrinh_id already exists. Skipping.');
      return;
    }

    // 2. Them cot dexuatchuongtrinh_id
    await conn.execute(`
      ALTER TABLE guest_tracking 
      ADD COLUMN dexuatchuongtrinh_id INT(11) DEFAULT NULL 
      AFTER nguoidung_id
    `);
    console.log('Added column dexuatchuongtrinh_id');

    // 3. Them foreign key (optional, de data integrity)
    try {
      await conn.execute(`
        ALTER TABLE guest_tracking 
        ADD CONSTRAINT fk_guest_tracking_dexuat 
        FOREIGN KEY (dexuatchuongtrinh_id) REFERENCES dexuatchuongtrinh(dexuatchuongtrinh_id)
          ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('Added foreign key fk_guest_tracking_dexuat');
    } catch (fkErr) {
      // Foreign key co the da ton tai hoac co van de data
      console.log('Foreign key constraint skipped:', fkErr.message);
    }

    // 4. Them index cho viec query
    try {
      await conn.execute(`
        CREATE INDEX idx_guest_tracking_dexuat 
        ON guest_tracking(dexuatchuongtrinh_id)
      `);
      console.log('Added index idx_guest_tracking_dexuat');
    } catch (idxErr) {
      console.log('Index skipped:', idxErr.message);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await conn.end();
  }
};

run();

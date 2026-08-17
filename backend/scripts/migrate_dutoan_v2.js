import pool from '../config/db.js';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    // Step 1: Add lydodeXuat column
    console.log('Step 1: Adding lydodeXuat column...');
    await connection.query(`
      ALTER TABLE dutoanhangnam
      ADD COLUMN lydodeXuat TEXT NULL COMMENT 'Ly do de xuat du toan' AFTER ghichu
    `);
    console.log('OK');

    // Step 2: Add fileMinhChung column
    console.log('Step 2: Adding fileMinhChung column...');
    await connection.query(`
      ALTER TABLE dutoanhangnam
      ADD COLUMN fileMinhChung VARCHAR(500) NULL COMMENT 'File minh chung de xuat' AFTER lydodeXuat
    `);
    console.log('OK');

    // Step 3: Create chitiet_dutoan table
    console.log('Step 3: Creating chitiet_dutoan table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chitiet_dutoan (
        chitiet_dutoan_id INT(11) NOT NULL AUTO_INCREMENT,
        dutoanhangnam_id INT(11) NOT NULL COMMENT 'FK to parent record (capduyet=1)',
        khoanchi VARCHAR(200) NOT NULL COMMENT 'Ten khoan chi',
        sotiendutoan DECIMAL(15,2) NOT NULL COMMENT 'So tien du toan cho khoan nay',
        ghichu TEXT NULL,
        PRIMARY KEY (chitiet_dutoan_id),
        KEY idx_dutoanhangnam_id (dutoanhangnam_id),
        CONSTRAINT fk_chitiet_dutoan_parent
          FOREIGN KEY (dutoanhangnam_id)
          REFERENCES dutoanhangnam(dutoanhangnam_id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Chi tiet du toan chi bo may hoat dong theo khoan'
    `);
    console.log('OK');

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('Error code:', error.code);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();

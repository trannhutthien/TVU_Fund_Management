import pool from '../../config/db.js';

/**
 * Migration: Add sotientaitro column to dexuatchuongtrinh table
 * Date: 2026-08-19
 * Purpose: Lưu tổng số tiền tài trợ của đề xuất chương trình
 * (soluongsuat * sotienmoisuat) để hiển thị trực tiếp không cần tính toán.
 */

async function addSotienTaitroColumn() {
  const connection = await pool.getConnection();

  try {
    console.log('Starting migration: Add sotientaitro column to dexuatchuongtrinh...');

    // 1. Check if table exists
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'dexuatchuongtrinh'
    `);

    if (tables.length === 0) {
      console.log('❌ Table dexuatchuongtrinh does not exist. Skipping migration.');
      return;
    }

    // 2. Check if column already exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'dexuatchuongtrinh'
        AND COLUMN_NAME = 'sotientaitro'
    `);

    if (columns.length > 0) {
      console.log('✅ Column sotientaitro already exists. Skipping migration.');
      return;
    }

    // 3. Add the column after sotienmoisuat
    await connection.query(`
      ALTER TABLE dexuatchuongtrinh
      ADD COLUMN sotientaitro decimal(15,2) NOT NULL DEFAULT 0
      AFTER sotienmoisuat
    `);
    console.log('✅ Column sotientaitro added successfully');

    // 4. Backfill existing rows with computed total (soluongsuat * sotienmoisuat)
    await connection.query(`
      UPDATE dexuatchuongtrinh
      SET sotientaitro = soluongsuat * sotienmoisuat
      WHERE sotientaitro = 0
    `);
    console.log('✅ Existing rows backfilled with soluongsuat * sotienmoisuat');

    await connection.commit();
    console.log('✅ Migration completed successfully: sotientaitro column added');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

addSotienTaitroColumn()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
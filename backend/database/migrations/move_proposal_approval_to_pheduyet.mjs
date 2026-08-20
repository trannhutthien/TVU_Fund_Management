import pool from '../../config/db.js';

/**
 * Migration: Chuyển luồng duyệt đề xuất chương trình sang bảng pheduyet
 * Date: 2026-08-19
 * Purpose:
 *   1. Thêm cột dexuatchuongtrinh_id vào bảng pheduyet (liên kết đề xuất chương trình)
 *   2. Cho phép yeucauhotro_id NULL (để pheduyet dùng chung cho đề xuất chương trình)
 *   3. Xóa 10 cột duyệt khỏi dexuatchuongtrinh:
 *      nguoiduyet_id, ngayduyet, canbo_duyet_id, ngay_canbo_duyet, ghi_chu_canbo,
 *      ketoan_xacnhan_id, ngay_ketoan_xacnhan, admin_duyet_id, ngay_admin_duyet, ghi_chu_admin
 */

async function migrate() {
  const connection = await pool.getConnection();

  try {
    console.log('Starting migration: Proposal approval -> pheduyet...\n');

    // ========================================================================
    // STEP 1: Thêm dexuatchuongtrinh_id vào pheduyet
    // ========================================================================
    console.log('STEP 1: Adding dexuatchuongtrinh_id to pheduyet...');
    const [pdCols] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'pheduyet'
         AND COLUMN_NAME = 'dexuatchuongtrinh_id'`
    );
    if (pdCols.length === 0) {
      await connection.query(
        `ALTER TABLE pheduyet
         ADD COLUMN dexuatchuongtrinh_id int NULL AFTER pheduyet_id`
      );
      await connection.query(
        `ALTER TABLE pheduyet
         ADD INDEX idx_pheduyet_dexuat (dexuatchuongtrinh_id)`
      );
      await connection.query(
        `ALTER TABLE pheduyet
         ADD CONSTRAINT fk_pheduyet_dexuat
           FOREIGN KEY (dexuatchuongtrinh_id)
           REFERENCES dexuatchuongtrinh (dexuatchuongtrinh_id)
           ON DELETE CASCADE ON UPDATE CASCADE`
      );
      console.log('✅ Added dexuatchuongtrinh_id + FK to pheduyet');
    } else {
      console.log('⚪ dexuatchuongtrinh_id already exists. Skipping.');
    }

    // ========================================================================
    // STEP 2: Cho phép yeucauhotro_id NULL (đúng schema backup_from_aiven.sql)
    // ========================================================================
    console.log('\nSTEP 2: Making pheduyet.yeucauhotro_id nullable...');
    const [pdNull] = await connection.query(
      `SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'pheduyet'
         AND COLUMN_NAME = 'yeucauhotro_id'`
    );
    if (pdNull.length > 0 && pdNull[0].IS_NULLABLE === 'NO') {
      await connection.query(
        `ALTER TABLE pheduyet MODIFY COLUMN yeucauhotro_id int NULL`
      );
      console.log('✅ Made yeucauhotro_id nullable');
    } else {
      console.log('⚪ yeucauhotro_id already nullable or missing. Skipping.');
    }

    // ========================================================================
    // STEP 3: Xóa 10 cột duyệt khỏi dexuatchuongtrinh
    // ========================================================================
    console.log('\nSTEP 3: Dropping 10 approval columns from dexuatchuongtrinh...');
    const dropCols = [
      'nguoiduyet_id',
      'ngayduyet',
      'canbo_duyet_id',
      'ngay_canbo_duyet',
      'ghi_chu_canbo',
      'ketoan_xacnhan_id',
      'ngay_ketoan_xacnhan',
      'admin_duyet_id',
      'ngay_admin_duyet',
      'ghi_chu_admin'
    ];

    // Drop FKs first
    const fkRows = await connection.query(
      `SELECT CONSTRAINT_NAME, COLUMN_NAME
       FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'dexuatchuongtrinh'
         AND REFERENCED_TABLE_NAME IS NOT NULL
         AND COLUMN_NAME IN ('nguoiduyet_id','canbo_duyet_id','ketoan_xacnhan_id','admin_duyet_id')`
    );
    for (const fk of fkRows[0] || []) {
      await connection.query(
        `ALTER TABLE dexuatchuongtrinh DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``
      );
      console.log(`  - Dropped FK ${fk.CONSTRAINT_NAME} (${fk.COLUMN_NAME})`);
    }

    for (const col of dropCols) {
      const exists = await connection.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'dexuatchuongtrinh'
           AND COLUMN_NAME = ?`,
        [col]
      );
      if (exists[0].length > 0) {
        await connection.query(
          `ALTER TABLE dexuatchuongtrinh DROP COLUMN \`${col}\``
        );
        console.log(`  - Dropped ${col}`);
      } else {
        console.log(`  - ${col} not found, skip`);
      }
    }
    console.log('✅ Dropped approval columns');

    await connection.commit();
    console.log('\n✅ Migration completed successfully');
  } catch (error) {
    await connection.rollback();
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

migrate()
  .then(() => {
    pool.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    pool.end();
    process.exit(1);
  });
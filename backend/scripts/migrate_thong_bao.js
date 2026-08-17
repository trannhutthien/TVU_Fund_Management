import pool from '../config/db.js';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log('Creating thong_bao table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS thong_bao (
        thong_bao_id INT(11) NOT NULL AUTO_INCREMENT,
        nguoidung_id INT(11) NOT NULL COMMENT 'Nguoi nhan thong bao',
        loaithongbao ENUM('thanhtoan','nhacno','quahan','hethong') NOT NULL DEFAULT 'hethong',
        tieude VARCHAR(255) NOT NULL,
        noidung TEXT NOT NULL,
        daDoc TINYINT(1) NOT NULL DEFAULT 0,
        duongdan VARCHAR(500) NULL COMMENT 'Link den trang lien quan',
        ngaytao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (thong_bao_id),
        KEY idx_nguoidung (nguoidung_id),
        KEY idx_dadoc (daDoc),
        KEY idx_ngaytao (ngaytao),
        CONSTRAINT fk_thongbao_nguoidung
          FOREIGN KEY (nguoidung_id)
          REFERENCES nguoidung(nguoidung_id)
          ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      COMMENT='Thong bao trong he thong (chuong + email)'
    `);
    console.log('OK');

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();

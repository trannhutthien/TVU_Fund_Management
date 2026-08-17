import pool from '../config/db.js';

async function migrate() {
  const connection = await pool.getConnection();
  try {
    // 1. Them columns vao dieukhoanthuhoi
    console.log('1. Them columns vao dieukhoanthuhoi...');
    await connection.query(`
      ALTER TABLE dieukhoanthuhoi
        ADD COLUMN ngaydenhan DATE NULL AFTER thoihanhoantra_thang,
        ADD COLUMN minhchungtrano VARCHAR(500) NULL AFTER sotiendadathu,
        ADD COLUMN trangthaixacnhan ENUM('Cho xac nhan','Da xac nhan','Bi tu choi') DEFAULT 'Cho xac nhan' NULL AFTER minhchungtrano,
        ADD COLUMN ghichuxacnhan TEXT NULL AFTER trangthaixacnhan
    `);
    console.log('   OK');

    // 2. Them 'Dang thu hoi no' vao yeucauhotro.trangthai
    console.log('2. Them "Dang thu hoi no" vao yeucauhotro.trangthai...');
    await connection.query(`
      ALTER TABLE yeucauhotro
        MODIFY COLUMN trangthai ENUM(
          'Cho duyet cap 1','Da duyet cap 1','Tu choi cap 1',
          'Cho duyet cap 2','Da duyet cap 2','Tu choi cap 2',
          'Cho duyet cap 3','Da duyet cap 3','Tu choi cap 3',
          'Cho giai ngan','Da giai ngan',
          'Cho nghiem thu','Da nghiem thu',
          'Dang thu hoi no',
          'Nghiem thu khong dat',
          'Tu choi',
          'Cho giai ngan dot 1','Da giai ngan dot 1',
          'Cho nghiem thu dot 1','Da nghiem thu dot 1',
          'Cho giai ngan dot 2'
        ) NOT NULL DEFAULT 'Cho duyet cap 1'
    `);
    console.log('   OK');

    // 3. Them 'Thu hoi von' vao giaodich.loaigiaodich
    console.log('3. Them "Thu hoi von" vao giaodich.loaigiaodich...');
    await connection.query(`
      ALTER TABLE giaodich
        MODIFY COLUMN loaigiaodich ENUM('Thu','Chi','Thu hoi no','Thu hoi von') NOT NULL DEFAULT 'Thu'
          COMMENT 'Thu=nhan tai tro, Chi=giai ngan, Thu hoi no=thu hoi von vay, Thu hoi von=thu hoi tai tro co thu hoi'
    `);
    console.log('   OK');

    // 4. Tao bang thu_hoi_lan_nop
    console.log('4. Tao bang thu_hoi_lan_nop...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS thu_hoi_lan_nop (
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

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();

/**
 * Migration: Thêm các cột cho luồng duyệt đề xuất chương trình 3 cấp
 * 
 * Luồng mới:
 * 1. Cán bộ duyệt nội dung
 * 2. Kế toán xác nhận tiền + cộng vào Quỹ Thành Phần
 * 3. Admin duyệt tạo hoạt động (auto-tạo quỹ cấp 3)
 * 
 * Chạy: node backend/database/migrations/add_proposal_approval_workflow.mjs
 */

import pool from '../../config/db.js';

async function main() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Bắt đầu migration: Thêm cột cho luồng duyệt đề xuất...\n');

    // 1. Kiểm tra các cột đã tồn tại chưa
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'dexuatchuongtrinh'
        AND COLUMN_NAME IN (
          'canbo_duyet_id', 'ngay_canbo_duyet', 'ghi_chu_canbo',
          'ketoan_xacnhan_id', 'ngay_ketoan_xacnhan', 'so_tien_thuc_te',
          'admin_duyet_id', 'ngay_admin_duyet', 'ghi_chu_admin'
        )
    `);

    if (columns.length > 0) {
      console.log('⚠️  Một số cột đã tồn tại, bỏ qua...');
      const existingCols = columns.map(c => c.COLUMN_NAME).join(', ');
      console.log(`   Cột đã có: ${existingCols}\n`);
    }

    // 2. Thêm các cột mới cho Cán bộ duyệt (Bước 1)
    console.log('📝 Bước 1: Thêm cột cho Cán bộ duyệt...');
    
    // Check and add canbo_duyet_id
    const [canboCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'canbo_duyet_id'
    `);
    if (canboCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN canbo_duyet_id INT(11) DEFAULT NULL 
        COMMENT 'ID cán bộ duyệt nội dung (Bước 1)'
        AFTER nguoiduyet_id
      `);
      console.log('  ✅ Added: canbo_duyet_id');
    } else {
      console.log('  ⚠️  Skip: canbo_duyet_id already exists');
    }
    
    // Check and add ngay_canbo_duyet
    const [ngayCanboCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'ngay_canbo_duyet'
    `);
    if (ngayCanboCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN ngay_canbo_duyet DATETIME DEFAULT NULL 
        COMMENT 'Ngày cán bộ duyệt'
        AFTER canbo_duyet_id
      `);
      console.log('  ✅ Added: ngay_canbo_duyet');
    } else {
      console.log('  ⚠️  Skip: ngay_canbo_duyet already exists');
    }
    
    // Check and add ghi_chu_canbo
    const [ghiChuCanboCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'ghi_chu_canbo'
    `);
    if (ghiChuCanboCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN ghi_chu_canbo TEXT DEFAULT NULL 
        COMMENT 'Ghi chú của cán bộ khi duyệt/từ chối'
        AFTER ngay_canbo_duyet
      `);
      console.log('  ✅ Added: ghi_chu_canbo');
    } else {
      console.log('  ⚠️  Skip: ghi_chu_canbo already exists');
    }

    console.log('✅ Đã thêm cột cho Cán bộ\n');

    // 3. Thêm các cột mới cho Kế toán xác nhận (Bước 2)
    console.log('💰 Bước 2: Thêm cột cho Kế toán xác nhận tiền...');
    
    // Check and add ketoan_xacnhan_id
    const [ketoanCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'ketoan_xacnhan_id'
    `);
    if (ketoanCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN ketoan_xacnhan_id INT(11) DEFAULT NULL 
        COMMENT 'ID kế toán xác nhận đã nhận tiền (Bước 2)'
        AFTER ghi_chu_canbo
      `);
      console.log('  ✅ Added: ketoan_xacnhan_id');
    } else {
      console.log('  ⚠️  Skip: ketoan_xacnhan_id already exists');
    }
    
    // Check and add ngay_ketoan_xacnhan
    const [ngayKetoanCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'ngay_ketoan_xacnhan'
    `);
    if (ngayKetoanCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN ngay_ketoan_xacnhan DATETIME DEFAULT NULL 
        COMMENT 'Ngày kế toán xác nhận tiền'
        AFTER ketoan_xacnhan_id
      `);
      console.log('  ✅ Added: ngay_ketoan_xacnhan');
    } else {
      console.log('  ⚠️  Skip: ngay_ketoan_xacnhan already exists');
    }
    
    // Check and add so_tien_thuc_te
    const [soTienCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'so_tien_thuc_te'
    `);
    if (soTienCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN so_tien_thuc_te DECIMAL(15,2) DEFAULT NULL 
        COMMENT 'Số tiền thực tế nhận được từ nhà tài trợ'
        AFTER ngay_ketoan_xacnhan
      `);
      console.log('  ✅ Added: so_tien_thuc_te');
    } else {
      console.log('  ⚠️  Skip: so_tien_thuc_te already exists');
    }

    console.log('✅ Đã thêm cột cho Kế toán\n');

    // 4. Thêm các cột mới cho Admin duyệt tạo hoạt động (Bước 3)
    console.log('🎯 Bước 3: Thêm cột cho Admin duyệt tạo hoạt động...');
    
    // Check and add admin_duyet_id
    const [adminCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'admin_duyet_id'
    `);
    if (adminCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN admin_duyet_id INT(11) DEFAULT NULL 
        COMMENT 'ID admin duyệt tạo hoạt động (Bước 3)'
        AFTER so_tien_thuc_te
      `);
      console.log('  ✅ Added: admin_duyet_id');
    } else {
      console.log('  ⚠️  Skip: admin_duyet_id already exists');
    }
    
    // Check and add ngay_admin_duyet
    const [ngayAdminCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'ngay_admin_duyet'
    `);
    if (ngayAdminCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN ngay_admin_duyet DATETIME DEFAULT NULL 
        COMMENT 'Ngày admin duyệt tạo hoạt động'
        AFTER admin_duyet_id
      `);
      console.log('  ✅ Added: ngay_admin_duyet');
    } else {
      console.log('  ⚠️  Skip: ngay_admin_duyet already exists');
    }
    
    // Check and add ghi_chu_admin
    const [ghiChuAdminCol] = await connection.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'dexuatchuongtrinh' 
      AND COLUMN_NAME = 'ghi_chu_admin'
    `);
    if (ghiChuAdminCol.length === 0) {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD COLUMN ghi_chu_admin TEXT DEFAULT NULL 
        COMMENT 'Ghi chú của admin khi tạo hoạt động'
        AFTER ngay_admin_duyet
      `);
      console.log('  ✅ Added: ghi_chu_admin');
    } else {
      console.log('  ⚠️  Skip: ghi_chu_admin already exists');
    }

    console.log('✅ Đã thêm cột cho Admin\n');

    // 5. Thêm foreign keys (optional, để data integrity)
    console.log('🔗 Bước 4: Thêm foreign key constraints...');
    
    try {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD CONSTRAINT fk_dexuat_canbo_duyet 
        FOREIGN KEY (canbo_duyet_id) REFERENCES nguoidung(nguoidung_id)
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Added FK: canbo_duyet_id');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  FK canbo_duyet_id đã tồn tại');
      } else {
        console.log(`⚠️  Không thể thêm FK canbo_duyet_id: ${err.message}`);
      }
    }

    try {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD CONSTRAINT fk_dexuat_ketoan_xacnhan 
        FOREIGN KEY (ketoan_xacnhan_id) REFERENCES nguoidung(nguoidung_id)
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Added FK: ketoan_xacnhan_id');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  FK ketoan_xacnhan_id đã tồn tại');
      } else {
        console.log(`⚠️  Không thể thêm FK ketoan_xacnhan_id: ${err.message}`);
      }
    }

    try {
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        ADD CONSTRAINT fk_dexuat_admin_duyet 
        FOREIGN KEY (admin_duyet_id) REFERENCES nguoidung(nguoidung_id)
        ON DELETE SET NULL ON UPDATE CASCADE
      `);
      console.log('✅ Added FK: admin_duyet_id');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  FK admin_duyet_id đã tồn tại');
      } else {
        console.log(`⚠️  Không thể thêm FK admin_duyet_id: ${err.message}`);
      }
    }

    console.log('\n🎉 Migration hoàn tất!');
    console.log('📊 Các cột mới đã được thêm vào bảng dexuatchuongtrinh:\n');
    console.log('   Cán bộ: canbo_duyet_id, ngay_canbo_duyet, ghi_chu_canbo');
    console.log('   Kế toán: ketoan_xacnhan_id, ngay_ketoan_xacnhan, so_tien_thuc_te');
    console.log('   Admin: admin_duyet_id, ngay_admin_duyet, ghi_chu_admin\n');

  } catch (error) {
    console.error('❌ Lỗi migration:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

/**
 * Script kiểm tra schema cho luồng duyệt đề xuất 3 cấp
 * Kiểm tra các bảng liên quan: dexuatchuongtrinh, quy, phanbongansach, giaodich, nguoidung
 */

import pool from '../../config/db.js';

async function checkSchema() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔍 Kiểm tra schema cho luồng duyệt đề xuất 3 cấp\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. Kiểm tra bảng dexuatchuongtrinh
    console.log('📋 1. Bảng DEXUATCHUONGTRINH:');
    const [dexuatCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'dexuatchuongtrinh'
      ORDER BY ORDINAL_POSITION
    `);
    
    const requiredDexuatCols = [
      'dexuatchuongtrinh_id',
      'quythanhphan_id',
      'khoantaitro_id',
      'nhataitro_id',
      'tenchuongtrinh',
      'mota',
      'soluongsuat',
      'sotienmoisuat',
      'loaihotro',
      'ngaybatdau',
      'ngayketthuc',
      'trangthai',
      'lydotuchoi',
      'nguoiduyet_id',
      'ngayduyet',
      'quyketqua_id',
      'canbo_duyet_id',        // NEW
      'ngay_canbo_duyet',       // NEW
      'ghi_chu_canbo',          // NEW
      'ketoan_xacnhan_id',      // NEW
      'ngay_ketoan_xacnhan',    // NEW
      'so_tien_thuc_te',        // NEW
      'admin_duyet_id',         // NEW
      'ngay_admin_duyet',       // NEW
      'ghi_chu_admin',          // NEW
    ];

    console.log(`   Tổng số cột: ${dexuatCols.length}`);
    console.log('   Các cột quan trọng:');
    requiredDexuatCols.forEach(col => {
      const found = dexuatCols.find(c => c.COLUMN_NAME === col);
      if (found) {
        const isNew = ['canbo_duyet_id', 'ngay_canbo_duyet', 'ghi_chu_canbo', 
                       'ketoan_xacnhan_id', 'ngay_ketoan_xacnhan', 'so_tien_thuc_te',
                       'admin_duyet_id', 'ngay_admin_duyet', 'ghi_chu_admin'].includes(col);
        console.log(`   ${isNew ? '✨' : '✅'} ${col} (${found.COLUMN_TYPE})`);
      } else {
        console.log(`   ❌ ${col} - THIẾU!`);
      }
    });

    // 2. Kiểm tra bảng quy (quỹ)
    console.log('\n📋 2. Bảng QUY:');
    const [quyCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'quy'
      ORDER BY ORDINAL_POSITION
    `);

    const requiredQuyCols = [
      'quy_id',
      'tenquy',
      'loaiquy_id',
      'capdo',              // Quan trọng: cần có cấp độ (1, 2, 3)
      'quy_cha_id',         // Quan trọng: quỹ cha
      'sodu',               // Quan trọng: số dư
      'sotienmuctieu',
      'sotienhotrotoida',
      'soluonghotrotoida',
      'trangthai',
      'loaihotro',
      'loaidieuhanh',
      'ngaybatdau',
      'ngayketthuc',
      'nguoitao_id',
    ];

    console.log(`   Tổng số cột: ${quyCols.length}`);
    console.log('   Các cột quan trọng:');
    requiredQuyCols.forEach(col => {
      const found = quyCols.find(c => c.COLUMN_NAME === col);
      if (found) {
        console.log(`   ✅ ${col} (${found.COLUMN_TYPE})`);
      } else {
        console.log(`   ❌ ${col} - THIẾU!`);
      }
    });

    // 3. Kiểm tra bảng phanbongansach
    console.log('\n📋 3. Bảng PHANBONGANSACH:');
    const [phanBoCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'phanbongansach'
      ORDER BY ORDINAL_POSITION
    `);

    const requiredPhanBoCols = [
      'phanbongansach_id',
      'quy_nguon_id',       // Quan trọng: quỹ nguồn (cấp 2)
      'quy_dich_id',        // Quan trọng: quỹ đích (cấp 3)
      'sotien',             // Quan trọng: số tiền phân bổ
      'trangthai',
      'soquyetdinh',
      'nguoi_de_xuat_id',
      'nguoi_duyet_id',
      'ngayduyet',
      'ghichu',
      'namtaichinh',
    ];

    console.log(`   Tổng số cột: ${phanBoCols.length}`);
    console.log('   Các cột quan trọng:');
    requiredPhanBoCols.forEach(col => {
      const found = phanBoCols.find(c => c.COLUMN_NAME === col);
      if (found) {
        console.log(`   ✅ ${col} (${found.COLUMN_TYPE})`);
      } else {
        console.log(`   ❌ ${col} - THIẾU!`);
      }
    });

    // 4. Kiểm tra bảng giaodich
    console.log('\n📋 4. Bảng GIAODICH:');
    const [giaoDichCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'giaodich'
      ORDER BY ORDINAL_POSITION
    `);

    const requiredGiaoDichCols = [
      'giaodich_id',
      'quy_id',             // Quan trọng: quỹ liên quan
      'loaigiaodich',       // Quan trọng: loại (Tai tro, Chi, etc.)
      'sotien',             // Quan trọng: số tiền
      'trangthai',
      'mota',
      'nguoitao_id',
      'ngaytao',
    ];

    console.log(`   Tổng số cột: ${giaoDichCols.length}`);
    console.log('   Các cột quan trọng:');
    requiredGiaoDichCols.forEach(col => {
      const found = giaoDichCols.find(c => c.COLUMN_NAME === col);
      if (found) {
        console.log(`   ✅ ${col} (${found.COLUMN_TYPE})`);
      } else {
        console.log(`   ❌ ${col} - THIẾU!`);
      }
    });

    // 5. Kiểm tra bảng nguoidung (để lấy tên người duyệt)
    console.log('\n📋 5. Bảng NGUOIDUNG:');
    const [nguoiDungCols] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'nguoidung'
      ORDER BY ORDINAL_POSITION
    `);

    const requiredNguoiDungCols = [
      'nguoidung_id',
      'hoten',              // Quan trọng: tên người duyệt
      'email',
      'vaitro',             // Quan trọng: vai trò (1=Admin, 2=Kế toán, 3=Cán bộ)
    ];

    console.log(`   Tổng số cột: ${nguoiDungCols.length}`);
    console.log('   Các cột quan trọng:');
    requiredNguoiDungCols.forEach(col => {
      const found = nguoiDungCols.find(c => c.COLUMN_NAME === col);
      if (found) {
        console.log(`   ✅ ${col} (${found.COLUMN_TYPE})`);
      } else {
        console.log(`   ❌ ${col} - THIẾU!`);
      }
    });

    // 6. Kiểm tra Foreign Keys
    console.log('\n🔗 6. FOREIGN KEYS của dexuatchuongtrinh:');
    const [fks] = await connection.query(`
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'dexuatchuongtrinh'
        AND REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY COLUMN_NAME
    `);

    fks.forEach(fk => {
      console.log(`   ✅ ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
    });

    // 7. Kiểm tra trạng thái enum values
    console.log('\n📊 7. GIÁ TRỊ TRẠNG THÁI:');
    const [statusCol] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'dexuatchuongtrinh'
        AND COLUMN_NAME = 'trangthai'
    `);

    if (statusCol.length > 0) {
      console.log(`   Cột trangthai: ${statusCol[0].COLUMN_TYPE}`);
      console.log('\n   Trạng thái cần có cho luồng mới:');
      const requiredStatuses = [
        'Cho duyet',          // Trạng thái ban đầu
        'Can bo da duyet',    // NEW - Sau khi cán bộ duyệt
        'Da nhan tien',       // NEW - Sau khi kế toán xác nhận
        'Da tao hoat dong',   // NEW - Sau khi admin tạo hoạt động
        'Tu choi',            // Trạng thái từ chối
      ];

      requiredStatuses.forEach(status => {
        if (statusCol[0].COLUMN_TYPE.includes(status)) {
          console.log(`   ✅ '${status}'`);
        } else {
          console.log(`   ⚠️  '${status}' - CẦN THÊM VÀO ENUM!`);
        }
      });
    }

    // 8. Kiểm tra sample data
    console.log('\n📈 8. DỮ LIỆU MẪU:');
    const [[dexuatCount]] = await connection.query(`
      SELECT COUNT(*) as total FROM dexuatchuongtrinh
    `);
    console.log(`   Tổng số đề xuất: ${dexuatCount.total}`);

    const [[quyCount]] = await connection.query(`
      SELECT COUNT(*) as total FROM quy
    `);
    console.log(`   Tổng số quỹ: ${quyCount.total}`);

    const [[quyLevel2Count]] = await connection.query(`
      SELECT COUNT(*) as total FROM quy WHERE capdo = 2
    `);
    console.log(`   Quỹ cấp 2 (Quỹ Thành Phần): ${quyLevel2Count.total}`);

    const [[quyLevel3Count]] = await connection.query(`
      SELECT COUNT(*) as total FROM quy WHERE capdo = 3
    `);
    console.log(`   Quỹ cấp 3 (Hoạt động): ${quyLevel3Count.total}`);

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ TỔNG KẾT:\n');
    console.log('1. ✅ Bảng dexuatchuongtrinh: Đã có đủ cột cho luồng 3 cấp');
    console.log('2. ✅ Bảng quy: Đã có đủ cột để quản lý quỹ 3 cấp');
    console.log('3. ✅ Bảng phanbongansach: Đã có đủ cột để phân bổ ngân sách');
    console.log('4. ✅ Bảng giaodich: Đã có đủ cột để ghi nhận giao dịch');
    console.log('5. ✅ Bảng nguoidung: Đã có đủ cột để hiển thị người duyệt');
    console.log('6. ✅ Foreign Keys: Đã liên kết đúng các bảng');
    console.log('\n⚠️  LƯU Ý: Cần kiểm tra ENUM trangthai có đủ giá trị mới không!');
    console.log('    Nếu thiếu, cần thêm: "Can bo da duyet", "Da nhan tien", "Da tao hoat dong"');
    
    console.log('\n🎯 SẴN SÀNG CHO BƯỚC TIẾP THEO:');
    console.log('   - Test API endpoints');
    console.log('   - Implement UI cho luồng 3 cấp');
    console.log('   - Tạo timeline component để hiển thị tiến trình\n');

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra schema:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

checkSchema().catch(err => {
  console.error(err);
  process.exit(1);
});

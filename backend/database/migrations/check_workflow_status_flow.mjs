/**
 * Script kiểm tra luồng trạng thái và tính nhất quán của workflow
 * Kiểm tra các enum status, loại giao dịch, vai trò
 */

import pool from '../../config/db.js';

async function checkWorkflowFlow() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔍 KIỂM TRA LUỒNG HOẠT ĐỘNG VÀ TRẠNG THÁI\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // ═══════════════════════════════════════════════════════════════════════
    // 1. KIỂM TRA ENUM TRANGTHAI - DEXUATCHUONGTRINH
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📊 1. ENUM TRẠNG THÁI - Bảng DEXUATCHUONGTRINH:\n');
    
    const [dexuatStatus] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'dexuatchuongtrinh'
        AND COLUMN_NAME = 'trangthai'
    `);
    
    console.log('   Hiện tại:', dexuatStatus[0].COLUMN_TYPE);
    console.log('\n   Luồng cần có:');
    console.log('   1️⃣  Cho duyet          → Trạng thái ban đầu khi nhà tài trợ tạo đề xuất');
    console.log('   2️⃣  Can bo da duyet    → Cán bộ đã duyệt nội dung (BƯỚC 1)');
    console.log('   3️⃣  Da nhan tien       → Kế toán xác nhận đã nhận tiền (BƯỚC 2)');
    console.log('   4️⃣  Da tao hoat dong   → Admin đã tạo hoạt động/quỹ cấp 3 (BƯỚC 3)');
    console.log('   ❌ Tu choi            → Cán bộ từ chối ở BƯỚC 1\n');

    const currentStatuses = dexuatStatus[0].COLUMN_TYPE.match(/'[^']+'/g) || [];
    const requiredStatuses = ["'Cho duyet'", "'Can bo da duyet'", "'Da nhan tien'", "'Da tao hoat dong'", "'Tu choi'"];
    
    console.log('   Kiểm tra:');
    requiredStatuses.forEach(status => {
      if (currentStatuses.includes(status)) {
        console.log(`   ✅ ${status}`);
      } else {
        console.log(`   ❌ ${status} - THIẾU!`);
      }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // 2. KIỂM TRA VAI TRÒ NGƯỜI DÙNG
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📊 2. VAI TRÒ NGƯỜI DÙNG:\n');
    
    // Check nếu có bảng vaitro riêng
    const [vaitroTable] = await connection.query(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'vaitro'
    `);

    if (vaitroTable[0].count > 0) {
      console.log('   ✅ Có bảng VAITRO riêng');
      const [vaitros] = await connection.query(`
        SELECT vaitro_id, tenvaitro, mota
        FROM vaitro
        ORDER BY vaitro_id
      `);
      
      console.log('\n   Danh sách vai trò:');
      vaitros.forEach(vt => {
        console.log(`   ${vt.vaitro_id}. ${vt.tenvaitro}${vt.mota ? ` - ${vt.mota}` : ''}`);
      });

      console.log('\n   Vai trò cần có cho luồng:');
      console.log('   ✅ Admin (vaitro_id = 1)     → Duyệt BƯỚC 3: Tạo hoạt động');
      console.log('   ✅ Kế toán (vaitro_id = 2)   → Duyệt BƯỚC 2: Xác nhận tiền');
      console.log('   ✅ Cán bộ (vaitro_id = 3)    → Duyệt BƯỚC 1: Kiểm tra nội dung');
      console.log('   ✅ Nhà tài trợ (vaitro_id = 4) → Tạo đề xuất');
    } else {
      console.log('   ⚠️  Không có bảng vaitro riêng');
      console.log('   → Vai trò có thể được lưu trực tiếp trong cột vaitro_id của nguoidung');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. KIỂM TRA LOẠI GIAO DỊCH
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📊 3. LOẠI GIAO DỊCH - Bảng GIAODICH:\n');
    
    const [giaoDichType] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'giaodich'
        AND COLUMN_NAME = 'loaigiaodich'
    `);
    
    console.log('   Hiện tại:', giaoDichType[0].COLUMN_TYPE);
    console.log('\n   Luồng cần:');
    console.log('   ✅ Thu              → Dùng khi KẾ TOÁN xác nhận nhận tiền (BƯỚC 2)');
    console.log('   ❓ Tai tro          → Có cần thêm không?');
    console.log('   ❓ Phan bo          → Có cần thêm không?');
    
    const currentGiaoDichTypes = giaoDichType[0].COLUMN_TYPE.match(/'[^']+'/g) || [];
    if (currentGiaoDichTypes.includes("'Thu'")) {
      console.log('\n   ✅ Có loại "Thu" - Đủ để ghi nhận tiền tài trợ');
    } else {
      console.log('\n   ❌ Thiếu loại "Thu" hoặc "Tai tro" - CẦN THÊM!');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. KIỂM TRA TRẠNG THÁI QUỸ
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📊 4. TRẠNG THÁI QUỸ - Bảng QUY:\n');
    
    const [quyStatus] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'quy'
        AND COLUMN_NAME = 'trangthai'
    `);
    
    console.log('   Hiện tại:', quyStatus[0].COLUMN_TYPE);
    console.log('\n   Cần có:');
    console.log('   ✅ Dang hoat dong   → Quỹ đang hoạt động (dùng khi ADMIN tạo quỹ mới ở BƯỚC 3)');
    console.log('   ✅ Tam dung         → Quỹ tạm dừng');
    console.log('   ✅ Da dong          → Quỹ đã đóng');

    // ═══════════════════════════════════════════════════════════════════════
    // 5. KIỂM TRA TRẠNG THÁI PHÂN BỔ NGÂN SÁCH
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📊 5. TRẠNG THÁI PHÂN BỔ - Bảng PHANBONGANSACH:\n');
    
    const [phanBoStatus] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'phanbongansach'
        AND COLUMN_NAME = 'trangthai'
    `);
    
    console.log('   Hiện tại:', phanBoStatus[0].COLUMN_TYPE);
    console.log('\n   Cần có:');
    console.log('   ✅ Da duyet         → Dùng khi ADMIN tạo hoạt động (auto phê duyệt phân bổ ở BƯỚC 3)');

    // ═══════════════════════════════════════════════════════════════════════
    // 6. MAPPING MODEL VỚI DATABASE
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📊 6. MAPPING CODE VỚI DATABASE:\n');
    
    console.log('   Model DeXuatChuongTrinhModel.js:');
    console.log('   ✅ confirmMoneyByKeToan() sử dụng:');
    console.log('      - giaodich.loaigiaodich = "Tai tro"');
    console.log('      - giaodich.ghichu (thay vì mota) ✓');
    console.log('      - giaodich.nguoithuchien_id (code đang dùng nguoitao_id) ❌');
    console.log('      - giaodich.ngaygiaodich (code đang không set) ⚠️');
    
    console.log('\n   ✅ createActivityByAdmin() sử dụng:');
    console.log('      - quy.trangthai = "Dang hoat dong" ✓');
    console.log('      - quy.loaidieuhanh = "Tap trung - Muc chi" ✓');
    console.log('      - quy.capdo = 3 ✓');
    console.log('      - phanbongansach.trangthai = "Da duyet" ✓');

    // ═══════════════════════════════════════════════════════════════════════
    // 7. CHECK CẤU TRÚC 3 CẤP QUỸ
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n📊 7. CẤU TRÚC QUỸ 3 CẤP:\n');
    
    const [quyStructure] = await connection.query(`
      SELECT 
        capdo,
        COUNT(*) as total,
        SUM(sodu) as tong_so_du
      FROM quy
      GROUP BY capdo
      ORDER BY capdo
    `);
    
    console.log('   Phân bổ quỹ theo cấp:');
    quyStructure.forEach(q => {
      const capDoLabel = q.capdo === 1 ? 'Quỹ Bé Chung (Cấp 1)' : 
                         q.capdo === 2 ? 'Quỹ Thành Phần (Cấp 2)' : 
                         q.capdo === 3 ? 'Hoạt Động/Chương trình (Cấp 3)' : 
                         `Cấp ${q.capdo}`;
      console.log(`   ${capDoLabel}: ${q.total} quỹ, Tổng số dư: ${parseFloat(q.tong_so_du || 0).toLocaleString('vi-VN')} đ`);
    });

    console.log('\n   Luồng tiền trong hệ thống:');
    console.log('   1. Nhà tài trợ → Đề xuất tài trợ vào QUỸ THÀNH PHẦN (Cấp 2)');
    console.log('   2. Kế toán xác nhận → Tiền CỘNG vào QUỸ THÀNH PHẦN (Cấp 2)');
    console.log('   3. Admin tạo hoạt động → Tiền TRỪ từ QUỸ THÀNH PHẦN (Cấp 2)');
    console.log('   4. Admin tạo hoạt động → Tiền CỘNG vào HOẠT ĐỘNG (Cấp 3)');

    // ═══════════════════════════════════════════════════════════════════════
    // 8. SUMMARY - VẤN ĐỀ CẦN SỬA
    // ═══════════════════════════════════════════════════════════════════════
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🔧 VẤN ĐỀ CẦN SỬA:\n');
    
    const issues = [];
    
    // Check trangthai enum
    if (!currentStatuses.includes("'Can bo da duyet'") || 
        !currentStatuses.includes("'Da nhan tien'") || 
        !currentStatuses.includes("'Da tao hoat dong'")) {
      issues.push({
        priority: 'HIGH',
        issue: 'Thiếu enum trangthai trong dexuatchuongtrinh',
        action: 'Cần thêm: "Can bo da duyet", "Da nhan tien", "Da tao hoat dong"'
      });
    }

    // Check loaigiaodich
    if (!currentGiaoDichTypes.includes("'Tai tro'")) {
      issues.push({
        priority: 'HIGH',
        issue: 'Thiếu loại giao dịch "Tai tro" trong bảng giaodich',
        action: 'Hoặc sử dụng loại "Thu" thay thế (cần sửa code Model)'
      });
    }

    // Check Model code
    issues.push({
      priority: 'MEDIUM',
      issue: 'Model code sử dụng nguoitao_id nhưng DB có nguoithuchien_id',
      action: 'Cần sửa DeXuatChuongTrinhModel.js: nguoitao_id → nguoithuchien_id'
    });

    if (issues.length === 0) {
      console.log('✅ Không có vấn đề! Schema đã sẵn sàng cho luồng 3 cấp.');
    } else {
      issues.forEach((issue, idx) => {
        console.log(`${idx + 1}. [${issue.priority}] ${issue.issue}`);
        console.log(`   → ${issue.action}\n`);
      });
    }

    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

checkWorkflowFlow().catch(err => {
  console.error(err);
  process.exit(1);
});

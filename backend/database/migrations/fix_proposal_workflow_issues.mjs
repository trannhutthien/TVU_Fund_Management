/**
 * Migration: Sửa các vấn đề cho luồng duyệt 3 cấp
 * 
 * 1. Thêm enum trangthai mới cho dexuatchuongtrinh
 * 2. (Model sẽ sửa riêng - không cần migration)
 */

import pool from '../../config/db.js';

async function fixIssues() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔧 Sửa các vấn đề cho luồng duyệt 3 cấp\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // ═══════════════════════════════════════════════════════════════════════
    // 1. Thêm enum trangthai mới cho dexuatchuongtrinh
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📝 1. Thêm enum trangthai mới vào dexuatchuongtrinh...\n');

    // Lấy enum hiện tại
    const [currentEnum] = await connection.query(`
      SELECT COLUMN_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'dexuatchuongtrinh'
        AND COLUMN_NAME = 'trangthai'
    `);

    console.log(`   Enum hiện tại: ${currentEnum[0].COLUMN_TYPE}`);

    // Check xem đã có các giá trị mới chưa
    const enumStr = currentEnum[0].COLUMN_TYPE;
    const hasCanBoDuyet = enumStr.includes('Can bo da duyet');
    const hasDaNhanTien = enumStr.includes('Da nhan tien');
    const hasDaTaoHoatDong = enumStr.includes('Da tao hoat dong');

    if (hasCanBoDuyet && hasDaNhanTien && hasDaTaoHoatDong) {
      console.log('   ✅ Enum đã có đủ giá trị mới, bỏ qua...\n');
    } else {
      console.log('   🔄 Cập nhật enum trangthai...');
      
      // Thêm các giá trị mới vào enum
      // Note: MySQL không hỗ trợ ADD sau một giá trị cụ thể, phải MODIFY toàn bộ cột
      await connection.query(`
        ALTER TABLE dexuatchuongtrinh 
        MODIFY COLUMN trangthai ENUM(
          'Cho duyet',
          'Can bo da duyet',
          'Da nhan tien', 
          'Da tao hoat dong',
          'Da duyet',
          'Tu choi'
        ) DEFAULT 'Cho duyet'
      `);
      
      console.log('   ✅ Đã thêm enum: "Can bo da duyet", "Da nhan tien", "Da tao hoat dong"');
      console.log('   ✅ Giữ nguyên: "Cho duyet", "Da duyet", "Tu choi" (backward compatibility)\n');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. Hiển thị mapping luồng trạng thái
    // ═══════════════════════════════════════════════════════════════════════
    console.log('📊 2. MAPPING LUỒNG TRẠNG THÁI:\n');
    console.log('   LUỒNG MỚI (3 cấp duyệt):');
    console.log('   ┌─────────────────────────────────────────────────────────┐');
    console.log('   │ Cho duyet → Can bo da duyet → Da nhan tien →            │');
    console.log('   │             ↓ (từ chối)      Da tao hoat dong           │');
    console.log('   │          Tu choi                                         │');
    console.log('   └─────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('   LUỒNG CŨ (backward compatibility):');
    console.log('   ┌─────────────────────────────────────────────────────────┐');
    console.log('   │ Cho duyet → Da duyet                                     │');
    console.log('   │          ↓ Tu choi                                       │');
    console.log('   └─────────────────────────────────────────────────────────┘');
    console.log('');

    // ═══════════════════════════════════════════════════════════════════════
    // 3. Summary
    // ═══════════════════════════════════════════════════════════════════════
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ HOÀN THÀNH!\n');
    console.log('Database đã sẵn sàng:');
    console.log('   ✅ Enum trangthai đã có đủ giá trị cho luồng 3 cấp');
    console.log('   ✅ Tương thích ngược với luồng cũ (Da duyet)\n');
    
    console.log('⚠️  CẦN SỬA TRONG CODE (không phải migration):');
    console.log('   1. File: backend/models/donations/DeXuatChuongTrinhModel.js');
    console.log('      → confirmMoneyByKeToan(): Đổi loaigiaodich từ "Tai tro" → "Thu"');
    console.log('      → confirmMoneyByKeToan(): Đổi nguoitao_id → nguoithuchien_id');
    console.log('      → confirmMoneyByKeToan(): Thêm ngaygiaodich = CURRENT_TIMESTAMP');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

fixIssues().catch(err => {
  console.error(err);
  process.exit(1);
});

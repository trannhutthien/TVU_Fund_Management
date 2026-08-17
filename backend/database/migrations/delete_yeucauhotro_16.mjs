/**
 * Script xóa dữ liệu test yeucauhotro_16 và tất cả records liên quan
 * Chạy script: node backend/database/migrations/delete_yeucauhotro_16.mjs
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load .env từ thư mục backend
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });

import pool from '../../config/db.js';

const YEUCAUHOTRO_ID = 16;

async function deleteYeuCauHoTro16() {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    console.log('🔍 Bắt đầu xóa dữ liệu test:', YEUCAUHOTRO_ID);
    
    // 1. Kiểm tra yeucauhotro tồn tại
    const [ycRows] = await connection.execute(
      'SELECT yeucauhotro_id, nguoidung_id, tieu_de FROM yeucauhotro WHERE yeucauhotro_id = ?',
      [YEUCAUHOTRO_ID]
    );
    
    if (ycRows.length === 0) {
      console.log('❌ Không tìm thấy yeucauhotro với ID:', YEUCAUHOTRO_ID);
      await connection.rollback();
      return;
    }
    
    console.log('✅ Tìm thấy yeucauhotro:', {
      id: ycRows[0].yeucauhotro_id,
      nguoidung_id: ycRows[0].nguoidung_id,
      tieu_de: ycRows[0].tieu_de
    });
    
    // 2. Lấy hopdongvayvon_id nếu có (để xóa lichtrano)
    const [hdRows] = await connection.execute(
      'SELECT hopdongvayvon_id FROM hopdongvayvon WHERE yeucauhotro_id = ?',
      [YEUCAUHOTRO_ID]
    );
    
    let hopdongvayvonId = null;
    if (hdRows.length > 0) {
      hopdongvayvonId = hdRows[0].hopdongvayvon_id;
      console.log('📋 Tìm thấy hopdongvayvon_id:', hopdongvayvonId);
    }
    
    // 3. Xóa lichtrano (nếu có hopdongvayvon)
    if (hopdongvayvonId) {
      const [deleteLichTraNo] = await connection.execute(
        'DELETE FROM lichtrano WHERE hopdongvayvon_id = ?',
        [hopdongvayvonId]
      );
      console.log(`🗑️  Đã xóa ${deleteLichTraNo.affectedRows} record từ lichtrano`);
    }
    
    // 4. Xóa hopdongvayvon
    const [deleteHopDong] = await connection.execute(
      'DELETE FROM hopdongvayvon WHERE yeucauhotro_id = ?',
      [YEUCAUHOTRO_ID]
    );
    console.log(`🗑️  Đã xóa ${deleteHopDong.affectedRows} record từ hopdongvayvon`);
    
    // 5. Xóa dieukhoanthuhoi
    const [deleteDieuKhoan] = await connection.execute(
      'DELETE FROM dieukhoanthuhoi WHERE yeucauhotro_id = ?',
      [YEUCAUHOTRO_ID]
    );
    console.log(`🗑️  Đã xóa ${deleteDieuKhoan.affectedRows} record từ dieukhoanthuhoi`);
    
    // 6. Xóa nghiemthu
    const [deleteNghiemThu] = await connection.execute(
      'DELETE FROM nghiemthu WHERE yeucauhotro_id = ?',
      [YEUCAUHOTRO_ID]
    );
    console.log(`🗑️  Đã xóa ${deleteNghiemThu.affectedRows} record từ nghiemthu`);
    
    // 7. Xóa pheduyet
    const [deletePheDuyet] = await connection.execute(
      'DELETE FROM pheduyet WHERE yeucauhotro_id = ?',
      [YEUCAUHOTRO_ID]
    );
    console.log(`🗑️  Đã xóa ${deletePheDuyet.affectedRows} record từ pheduyet`);
    
    // 8. Xóa giaodich
    const [deleteGiaoDich] = await connection.execute(
      'DELETE FROM giaodich WHERE yeucauhotro_id = ?',
      [YEUCAUHOTRO_ID]
    );
    console.log(`🗑️  Đã xóa ${deleteGiaoDich.affectedRows} record từ giaodich`);
    
    // 9. Xóa guest_tracking (nếu có)
    const [deleteGuestTracking] = await connection.execute(
      "DELETE FROM guest_tracking WHERE loai = 'yeucauhotro' AND doituong_id = ?",
      [YEUCAUHOTRO_ID]
    );
    console.log(`🗑️  Đã xóa ${deleteGuestTracking.affectedRows} record từ guest_tracking`);
    
    // 10. Xóa yeucauhotro chính
    const [deleteYeuCau] = await connection.execute(
      'DELETE FROM yeucauhotro WHERE yeucauhotro_id = ?',
      [YEUCAUHOTRO_ID]
    );
    console.log(`🗑️  Đã xóa ${deleteYeuCau.affectedRows} record từ yeucauhotro`);
    
    // Commit transaction
    await connection.commit();
    console.log('✅ Hoàn thành! Đã xóa tất cả dữ liệu test liên quan đến', YEUCAUHOTRO_ID);
    
  } catch (error) {
    await connection.rollback();
    console.error('❌ Lỗi khi xóa dữ liệu:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Chạy script
deleteYeuCauHoTro16()
  .then(() => {
    console.log('✅ Script hoàn thành');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  });

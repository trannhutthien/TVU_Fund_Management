import pool from '../../config/db.js';

console.log('\n🔍 KIỂM TRA SCHEMA VÀ DỮ LIỆU MÔ HÌNH 3 CẤP\n');

try {
  // 1. Kiểm tra bảng quy
  console.log('=== 1. BẢNG QUY - CẤU TRÚC ===');
  const [quyColumns] = await pool.query('DESCRIBE quy');
  console.table(quyColumns);
  
  // 2. Kiểm tra bảng loaiquy
  console.log('\n=== 2. BẢNG LOAIQUY - CẤU TRÚC ===');
  const [loaiquyColumns] = await pool.query('DESCRIBE loaiquy');
  console.table(loaiquyColumns);
  
  // 3. Kiểm tra bảng dexuathotro
  console.log('\n=== 3. BẢNG DEXUATHOTRO - CẤU TRÚC ===');
  try {
    const [dexuatColumns] = await pool.query('DESCRIBE dexuathotro');
    console.table(dexuatColumns);
  } catch (err) {
    console.log('❌ Bảng dexuathotro CHƯA TỒN TẠI hoặc có lỗi:', err.message);
  }
  
  // 4. Dữ liệu loaiquy
  console.log('\n=== 4. DỮ LIỆU LOAIQUY ===');
  const [loaiquyData] = await pool.query('SELECT * FROM loaiquy ORDER BY loaiquy_id');
  console.table(loaiquyData);
  
  // 5. Dữ liệu quy theo 3 cấp
  console.log('\n=== 5. DỮ LIỆU QUY (3 CẤP) ===');
  const [quyData] = await pool.query(`
    SELECT 
      quy_id,
      tenquy,
      loaiquy_id,
      quy_cha_id,
      loaidieuhanh,
      capdo,
      sodu,
      trangthai
    FROM quy 
    ORDER BY capdo, loaiquy_id, quy_id
  `);
  console.table(quyData);
  
  // 6. Thống kê theo cấp
  console.log('\n=== 6. THỐNG KÊ THEO CẤP ===');
  const [stats] = await pool.query(`
    SELECT 
      capdo,
      COUNT(*) as so_luong,
      SUM(sodu) as tong_sodu
    FROM quy 
    GROUP BY capdo 
    ORDER BY capdo
  `);
  console.table(stats);
  
  // 7. Kiểm tra cấu trúc cây (orphan check)
  console.log('\n=== 7. KIỂM TRA ORPHAN (Quỹ không có cha hợp lệ) ===');
  const [orphans] = await pool.query(`
    SELECT 
      quy_id,
      tenquy,
      quy_cha_id,
      capdo
    FROM quy 
    WHERE quy_cha_id IS NOT NULL 
      AND quy_cha_id NOT IN (SELECT quy_id FROM quy)
  `);
  if (orphans.length === 0) {
    console.log('✅ Không có quỹ orphan - Cấu trúc cây hợp lệ');
  } else {
    console.log('❌ CÓ QUỸ ORPHAN:');
    console.table(orphans);
  }
  
  // 8. Kiểm tra cột capdo có đúng với loaidieuhanh không
  console.log('\n=== 8. KIỂM TRA CONSISTENCY: capdo vs loaidieuhanh ===');
  const [inconsistent] = await pool.query(`
    SELECT 
      quy_id,
      tenquy,
      loaidieuhanh,
      capdo,
      CASE 
        WHEN loaidieuhanh = 'Tap trung - Be chung' AND capdo = 1 THEN '✅'
        WHEN loaidieuhanh = 'Tap trung - Thanh phan' AND capdo = 2 THEN '✅'
        WHEN loaidieuhanh = 'Tap trung - Muc chi' AND capdo = 3 THEN '✅'
        ELSE '❌'
      END as dung
    FROM quy
  `);
  console.table(inconsistent);
  
  console.log('\n✅ KIỂM TRA HOÀN TẤT\n');
  
} catch (error) {
  console.error('\n❌ LỖI:', error.message);
  console.error(error);
} finally {
  await pool.end();
}

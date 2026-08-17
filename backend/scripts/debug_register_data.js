import pool from '../config/db.js';

/**
 * Script để debug dữ liệu đăng ký
 */
async function debugRegisterData() {
  try {
    console.log('🔍 Debug dữ liệu đăng ký user...\n');

    // Lấy 20 user mới nhất
    const [users] = await pool.query(
      `SELECT 
        nguoidung_id,
        hoten,
        email,
        loaitaikhoan,
        sodienthoai,
        donvicongtac,
        tinhtrangcongtac,
        DATE_FORMAT(ngaytao, '%Y-%m-%d %H:%i:%s') as ngaytao,
        DATE_FORMAT(ngaycapnhat, '%Y-%m-%d %H:%i:%s') as ngaycapnhat
      FROM nguoidung 
      ORDER BY ngaytao DESC
      LIMIT 20`
    );

    console.log(`📊 ${users.length} user gần nhất:\n`);
    console.log('═'.repeat(120));

    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ID: ${user.nguoidung_id} | Loại: ${user.loaitaikhoan}`);
      console.log(`   Họ tên: ${user.hoten}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   SĐT: ${user.sodienthoai || '(không có)'}`);
      console.log(`   Đơn vị công tác: ${user.donvicongtac || '❌ NULL'}`);
      console.log(`   Tình trạng: ${user.tinhtrangcongtac || '❌ NULL'}`);
      console.log(`   Ngày tạo: ${user.ngaytao}`);
      console.log(`   Ngày cập nhật: ${user.ngaycapnhat}`);
    });

    console.log('\n' + '═'.repeat(120));

    // Thống kê
    console.log('\n📈 Thống kê:\n');

    const [stats] = await pool.query(
      `SELECT 
        loaitaikhoan,
        COUNT(*) as total,
        SUM(CASE WHEN donvicongtac IS NULL THEN 1 ELSE 0 END) as null_donvi,
        SUM(CASE WHEN tinhtrangcongtac IS NULL THEN 1 ELSE 0 END) as null_tinhtrang
      FROM nguoidung
      WHERE loaitaikhoan IN ('Can bo', 'Nha khoa hoc')
      GROUP BY loaitaikhoan`
    );

    stats.forEach(stat => {
      console.log(`   ${stat.loaitaikhoan}:`);
      console.log(`      Tổng số: ${stat.total}`);
      console.log(`      Thiếu đơn vị công tác: ${stat.null_donvi} (${(stat.null_donvi / stat.total * 100).toFixed(1)}%)`);
      console.log(`      Thiếu tình trạng: ${stat.null_tinhtrang} (${(stat.null_tinhtrang / stat.total * 100).toFixed(1)}%)`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    process.exit(0);
  }
}

debugRegisterData();

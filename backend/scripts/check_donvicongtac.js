import pool from '../config/db.js';

/**
 * Script để kiểm tra và hiển thị dữ liệu donvicongtac trong bảng nguoidung
 */
async function checkDonViCongTac() {
  try {
    console.log('🔍 Kiểm tra dữ liệu donvicongtac trong bảng nguoidung...\n');

    // Lấy danh sách user có loaitaikhoan = 'Nha khoa hoc'
    const [users] = await pool.query(
      `SELECT 
        nguoidung_id, 
        hoten, 
        email, 
        loaitaikhoan,
        donvicongtac,
        tinhtrangcongtac
      FROM nguoidung 
      WHERE loaitaikhoan = 'Nha khoa hoc'
      ORDER BY nguoidung_id DESC
      LIMIT 20`
    );

    if (users.length === 0) {
      console.log('❌ Không tìm thấy user nào có loaitaikhoan = "Nha khoa hoc"');
      return;
    }

    console.log(`✅ Tìm thấy ${users.length} user(s) có loại tài khoản "Nhà khoa học":\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.nguoidung_id}`);
      console.log(`   Họ tên: ${user.hoten}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Đơn vị công tác: ${user.donvicongtac || '(Chưa có dữ liệu)'}`);
      console.log(`   Tình trạng: ${user.tinhtrangcongtac || '(Chưa có dữ liệu)'}`);
      console.log('');
    });

    // Đếm số user có donvicongtac NULL
    const [countNull] = await pool.query(
      `SELECT COUNT(*) as count 
      FROM nguoidung 
      WHERE loaitaikhoan = 'Nha khoa hoc' 
      AND (donvicongtac IS NULL OR donvicongtac = '')`
    );

    console.log(`⚠️  Có ${countNull[0].count} user chưa có thông tin đơn vị công tác`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    process.exit(0);
  }
}

checkDonViCongTac();

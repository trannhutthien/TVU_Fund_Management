import pool from '../config/db.js';
import readline from 'readline';

/**
 * Script để cập nhật donvicongtac cho user cụ thể
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateDonViCongTac() {
  try {
    console.log('🔧 Cập nhật thông tin Đơn vị công tác / Nghiên cứu\n');

    // Nhập email
    const email = await question('Nhập email của user cần cập nhật: ');

    // Kiểm tra user tồn tại
    const [users] = await pool.query(
      'SELECT nguoidung_id, hoten, email, loaitaikhoan, donvicongtac FROM nguoidung WHERE email = ?',
      [email.trim()]
    );

    if (users.length === 0) {
      console.log('❌ Không tìm thấy user với email này');
      rl.close();
      process.exit(0);
      return;
    }

    const user = users[0];
    console.log(`\n✅ Tìm thấy user:`);
    console.log(`   ID: ${user.nguoidung_id}`);
    console.log(`   Họ tên: ${user.hoten}`);
    console.log(`   Loại tài khoản: ${user.loaitaikhoan}`);
    console.log(`   Đơn vị công tác hiện tại: ${user.donvicongtac || '(Chưa có)'}\n`);

    // Nhập đơn vị công tác mới
    const donViMoi = await question('Nhập Đơn vị công tác/Nghiên cứu mới: ');

    if (!donViMoi.trim()) {
      console.log('❌ Đơn vị công tác không được để trống');
      rl.close();
      process.exit(0);
      return;
    }

    // Nhập tình trạng công tác
    const tinhTrang = await question('Nhập Tình trạng công tác (1=Đang công tác, 2=Đã nghỉ hưu): ');
    const tinhTrangValue = tinhTrang.trim() === '2' ? 'Da nghi huu' : 'Dang cong tac';

    // Xác nhận
    const confirm = await question(`\n⚠️  Xác nhận cập nhật? (y/n): `);

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Đã hủy');
      rl.close();
      process.exit(0);
      return;
    }

    // Thực hiện cập nhật
    await pool.query(
      'UPDATE nguoidung SET donvicongtac = ?, tinhtrangcongtac = ? WHERE nguoidung_id = ?',
      [donViMoi.trim(), tinhTrangValue, user.nguoidung_id]
    );

    console.log('\n✅ Cập nhật thành công!');
    console.log(`   Đơn vị công tác: ${donViMoi.trim()}`);
    console.log(`   Tình trạng: ${tinhTrangValue}`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

updateDonViCongTac();

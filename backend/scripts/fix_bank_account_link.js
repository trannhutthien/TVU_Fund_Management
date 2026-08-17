import pool from '../config/db.js';
import readline from 'readline';

/**
 * Script để sửa liên kết giữa nguoidung và taikhoannganhang
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function fixBankAccountLink() {
  try {
    console.log('🔧 Sửa liên kết giữa nguoidung và taikhoannganhang\n');

    // 1. Tìm các tài khoản ngân hàng của user không được link
    const [orphanAccounts] = await pool.query(
      `SELECT 
        tk.taikhoannganhang_id,
        tk.sotaikhoan,
        tk.nganhang,
        tk.chutaikhoan,
        tk.ngaytao
      FROM taikhoannganhang tk
      WHERE tk.quy_id IS NULL
      AND NOT EXISTS (
        SELECT 1 FROM nguoidung n 
        WHERE n.taikhoannganhang_id = tk.taikhoannganhang_id
      )
      ORDER BY tk.ngaytao DESC`
    );

    if (orphanAccounts.length === 0) {
      console.log('✅ Không có tài khoản ngân hàng nào bị mất liên kết');
      rl.close();
      process.exit(0);
      return;
    }

    console.log(`❌ Tìm thấy ${orphanAccounts.length} tài khoản ngân hàng bị mất liên kết:\n`);
    
    orphanAccounts.forEach((acc, index) => {
      console.log(`${index + 1}. TK ID: ${acc.taikhoannganhang_id}`);
      console.log(`   Số TK: ${acc.sotaikhoan}`);
      console.log(`   Ngân hàng: ${acc.nganhang}`);
      console.log(`   Chủ TK: ${acc.chutaikhoan}`);
      console.log(`   Ngày tạo: ${acc.ngaytao}`);
      console.log('');
    });

    // 2. Hỏi user muốn sửa tài khoản nào
    const choice = await question('Nhập số thứ tự tài khoản cần sửa (hoặc 0 để thoát): ');
    const choiceNum = parseInt(choice);

    if (choiceNum === 0 || choiceNum < 1 || choiceNum > orphanAccounts.length) {
      console.log('❌ Đã hủy');
      rl.close();
      process.exit(0);
      return;
    }

    const selectedAccount = orphanAccounts[choiceNum - 1];
    console.log(`\n✅ Đã chọn tài khoản: ${selectedAccount.sotaikhoan} - ${selectedAccount.chutaikhoan}\n`);

    // 3. Tìm user có tên trùng với chủ tài khoản
    const [matchingUsers] = await pool.query(
      `SELECT 
        nguoidung_id,
        hoten,
        email,
        loaitaikhoan,
        taikhoannganhang_id
      FROM nguoidung
      WHERE UPPER(REPLACE(hoten, ' ', '')) = UPPER(REPLACE(?, ' ', ''))
      OR email LIKE ?`,
      [selectedAccount.chutaikhoan, `%${selectedAccount.chutaikhoan.split(' ')[0]}%`]
    );

    if (matchingUsers.length === 0) {
      console.log('❌ Không tìm thấy user nào phù hợp');
      
      // Cho phép nhập email thủ công
      const email = await question('\nNhập email của user cần liên kết (hoặc Enter để bỏ qua): ');
      
      if (!email.trim()) {
        console.log('❌ Đã hủy');
        rl.close();
        process.exit(0);
        return;
      }

      const [userByEmail] = await pool.query(
        'SELECT nguoidung_id, hoten, email, taikhoannganhang_id FROM nguoidung WHERE email = ?',
        [email.trim()]
      );

      if (userByEmail.length === 0) {
        console.log('❌ Không tìm thấy user với email này');
        rl.close();
        process.exit(0);
        return;
      }

      matchingUsers.push(userByEmail[0]);
    }

    console.log(`\n🔍 Tìm thấy ${matchingUsers.length} user phù hợp:\n`);
    
    matchingUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.hoten} (${user.email})`);
      console.log(`   Loại TK: ${user.loaitaikhoan}`);
      console.log(`   Có TK ngân hàng: ${user.taikhoannganhang_id ? 'Có (ID: ' + user.taikhoannganhang_id + ')' : 'Chưa'}`);
      console.log('');
    });

    // 4. Chọn user
    const userChoice = await question('Nhập số thứ tự user cần liên kết (hoặc 0 để thoát): ');
    const userChoiceNum = parseInt(userChoice);

    if (userChoiceNum === 0 || userChoiceNum < 1 || userChoiceNum > matchingUsers.length) {
      console.log('❌ Đã hủy');
      rl.close();
      process.exit(0);
      return;
    }

    const selectedUser = matchingUsers[userChoiceNum - 1];

    // 5. Xác nhận
    console.log(`\n⚠️  Bạn sắp liên kết:`);
    console.log(`   User: ${selectedUser.hoten} (${selectedUser.email})`);
    console.log(`   TK: ${selectedAccount.sotaikhoan} - ${selectedAccount.nganhang}`);
    
    if (selectedUser.taikhoannganhang_id) {
      console.log(`\n   ⚠️  WARNING: User này đã có tài khoản ngân hàng (ID: ${selectedUser.taikhoannganhang_id})`);
      console.log(`   Liên kết mới sẽ GHI ĐÈ liên kết cũ!`);
    }

    const confirm = await question('\n⚠️  Xác nhận liên kết? (y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('❌ Đã hủy');
      rl.close();
      process.exit(0);
      return;
    }

    // 6. Thực hiện UPDATE
    await pool.query(
      'UPDATE nguoidung SET taikhoannganhang_id = ? WHERE nguoidung_id = ?',
      [selectedAccount.taikhoannganhang_id, selectedUser.nguoidung_id]
    );

    console.log('\n✅ Liên kết thành công!');
    console.log(`   User: ${selectedUser.hoten}`);
    console.log(`   TK ID: ${selectedAccount.taikhoannganhang_id}`);

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    rl.close();
    process.exit(0);
  }
}

fixBankAccountLink();

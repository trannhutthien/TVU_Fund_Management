import pool from '../config/db.js';

/**
 * Script để kiểm tra liên kết giữa nguoidung và taikhoannganhang
 */
async function checkBankAccountLink() {
  try {
    console.log('🔍 Kiểm tra liên kết giữa nguoidung và taikhoannganhang...\n');

    // 1. Kiểm tra các tài khoản ngân hàng của user (quy_id IS NULL)
    const [userBankAccounts] = await pool.query(
      `SELECT 
        taikhoannganhang_id,
        sotaikhoan,
        nganhang,
        chutaikhoan,
        ngaytao
      FROM taikhoannganhang 
      WHERE quy_id IS NULL
      ORDER BY ngaytao DESC
      LIMIT 20`
    );

    console.log(`📊 Tìm thấy ${userBankAccounts.length} tài khoản ngân hàng của user:\n`);
    
    for (const acc of userBankAccounts) {
      console.log(`   TK ID: ${acc.taikhoannganhang_id}`);
      console.log(`   Số TK: ${acc.sotaikhoan}`);
      console.log(`   Ngân hàng: ${acc.nganhang}`);
      console.log(`   Chủ TK: ${acc.chutaikhoan}`);
      
      // Tìm xem có user nào link tới TK này không
      const [linkedUsers] = await pool.query(
        `SELECT nguoidung_id, hoten, email 
        FROM nguoidung 
        WHERE taikhoannganhang_id = ?`,
        [acc.taikhoannganhang_id]
      );
      
      if (linkedUsers.length > 0) {
        console.log(`   ✅ Linked to user: ${linkedUsers[0].hoten} (${linkedUsers[0].email})`);
      } else {
        console.log(`   ❌ KHÔNG CÓ USER NÀO LINK TỚI TK NÀY!`);
      }
      console.log('');
    }

    // 2. Kiểm tra các user có taikhoannganhang_id nhưng không tồn tại trong bảng taikhoannganhang
    console.log('\n🔍 Kiểm tra các user có taikhoannganhang_id không hợp lệ...\n');
    
    const [invalidLinks] = await pool.query(
      `SELECT 
        n.nguoidung_id,
        n.hoten,
        n.email,
        n.taikhoannganhang_id
      FROM nguoidung n
      WHERE n.taikhoannganhang_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM taikhoannganhang tk 
        WHERE tk.taikhoannganhang_id = n.taikhoannganhang_id
      )`
    );

    if (invalidLinks.length > 0) {
      console.log(`❌ Tìm thấy ${invalidLinks.length} user có taikhoannganhang_id không hợp lệ:`);
      invalidLinks.forEach(user => {
        console.log(`   - ${user.hoten} (${user.email}): taikhoannganhang_id = ${user.taikhoannganhang_id}`);
      });
    } else {
      console.log('✅ Không có user nào có taikhoannganhang_id không hợp lệ');
    }

    // 3. Kiểm tra user không có tài khoản ngân hàng
    console.log('\n🔍 Kiểm tra các user chưa có tài khoản ngân hàng...\n');
    
    const [usersWithoutBank] = await pool.query(
      `SELECT 
        nguoidung_id,
        hoten,
        email,
        loaitaikhoan
      FROM nguoidung
      WHERE taikhoannganhang_id IS NULL
      AND loaitaikhoan IN ('Sinh vien', 'Can bo', 'Nha khoa hoc')
      ORDER BY ngaytao DESC
      LIMIT 10`
    );

    if (usersWithoutBank.length > 0) {
      console.log(`⚠️  Tìm thấy ${usersWithoutBank.length} user chưa có tài khoản ngân hàng:`);
      usersWithoutBank.forEach(user => {
        console.log(`   - ${user.hoten} (${user.email}) - ${user.loaitaikhoan}`);
      });
    } else {
      console.log('✅ Tất cả user đều đã có tài khoản ngân hàng');
    }

  } catch (error) {
    console.error('❌ Lỗi:', error.message);
  } finally {
    process.exit(0);
  }
}

checkBankAccountLink();

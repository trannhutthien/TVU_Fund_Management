import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const migratePasswords = async () => {
  try {
    // 1. Lấy danh sách tất cả người dùng từ bảng NguoiDung
    // Lưu ý: Tên bảng và cột phải khớp với SQL của bạn (NguoiDung, mat_khau, user_id)
    const [users] = await pool.execute("SELECT user_id, mat_khau FROM nguoidung");

    console.log(`🔍 Tìm thấy ${users.length} người dùng. Đang kiểm tra mật khẩu...`);

    let updatedCount = 0;

    for (const user of users) {
      // Kiểm tra xem mật khẩu đã được hash chưa
      // Thông thường mật khẩu bcrypt luôn bắt đầu bằng $2a$ hoặc $2b$ và dài 60 ký tự
      const isAlreadyHashed = user.mat_khau.startsWith('$2') && user.mat_khau.length >= 60;

      if (!isAlreadyHashed) {
        console.log(`--- Đang xử lý ID: ${user.user_id} (Mật khẩu cũ: ${user.mat_khau}) ---`);

        // 2. Hash mật khẩu cũ
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.mat_khau, salt);

        // 3. Cập nhật lại vào Database
        await pool.execute(
          "UPDATE nguoidung SET mat_khau = ? WHERE user_id = ?",
          [hashedPassword, user.user_id]
        );
        updatedCount++;
      }
    }

    console.log(`\n✅ Hoàn tất! Đã cập nhật hash cho ${updatedCount} người dùng.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình cập nhật:", error.message);
    process.exit(1);
  }
};

migratePasswords();
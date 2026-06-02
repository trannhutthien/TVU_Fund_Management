import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script tạo staff users (Admin, Kế toán, Cán bộ Quỹ) trực tiếp vào database
 * Mật khẩu mặc định: 123456
 * 
 * Cách chạy: npm run seed:staff
 * Hoặc: node utils/seedStaffUsers.js
 */
const seedStaffUsers = async () => {
  let connection;
  
  try {
    console.log("🚀 Bắt đầu tạo staff users...\n");

    // Lấy connection từ pool
    connection = await pool.getConnection();

    // Hash mật khẩu: 123456
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const staffUsers = [
      {
        ma_so_dinh_danh: "ADMIN001",
        ho_ten: "Nguyễn Văn Admin",
        email: "admin@tvu.edu.vn",
        role_id: 1,
        khoa_phong: "Phòng Quản Trị",
        so_dien_thoai: "0901234567",
      },
      {
        ma_so_dinh_danh: "KT001",
        ho_ten: "Trần Thị Kế Toán",
        email: "ketoan@tvu.edu.vn",
        role_id: 2,
        khoa_phong: "Phòng Tài chính Kế toán",
        so_dien_thoai: "0902345678",
      },
      {
        ma_so_dinh_danh: "CB001",
        ho_ten: "Lê Văn Cán Bộ",
        email: "canbo@tvu.edu.vn",
        role_id: 3,
        khoa_phong: "Phòng Công tác Sinh viên",
        so_dien_thoai: "0903456789",
      },
    ];

    let createdCount = 0;
    let updatedCount = 0;

    for (const user of staffUsers) {
      // Kiểm tra email đã tồn tại chưa
      const [existing] = await connection.query(
        "SELECT user_id, email FROM nguoidung WHERE email = ?",
        [user.email]
      );

      if (existing.length > 0) {
        // Update user hiện có (reset mật khẩu và thông tin)
        await connection.query(
          `UPDATE nguoidung 
          SET ho_ten = ?, mat_khau = ?, role_id = ?, khoa_phong = ?, 
              so_dien_thoai = ?, trang_thai = 'HOAT_DONG'
          WHERE email = ?`,
          [
            user.ho_ten,
            hashedPassword,
            user.role_id,
            user.khoa_phong,
            user.so_dien_thoai,
            user.email
          ]
        );
        console.log(`🔄 Cập nhật: ${user.ho_ten} (${user.email}) - Role ${user.role_id}`);
        updatedCount++;
      } else {
        // Insert user mới
        await connection.query(
          `INSERT INTO nguoidung 
          (ma_so_dinh_danh, ho_ten, email, mat_khau, role_id, khoa_phong, so_dien_thoai, trang_thai, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, 'HOAT_DONG', NOW())`,
          [
            user.ma_so_dinh_danh,
            user.ho_ten,
            user.email,
            hashedPassword,
            user.role_id,
            user.khoa_phong,
            user.so_dien_thoai,
          ]
        );
        console.log(`✅ Tạo mới: ${user.ho_ten} (${user.email}) - Role ${user.role_id}`);
        createdCount++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 KẾT QUẢ:");
    console.log(`   ✅ Tạo mới: ${createdCount} tài khoản`);
    console.log(`   🔄 Cập nhật: ${updatedCount} tài khoản`);
    console.log("=".repeat(60));

    console.log("\n🎉 HOÀN TẤT! Thông tin đăng nhập:");
    console.log("\n┌─────────────────────────────────────────────────────┐");
    console.log("│  ADMIN                                              │");
    console.log("│  Email: admin@tvu.edu.vn                            │");
    console.log("│  Mật khẩu: 123456                                   │");
    console.log("│  Route: /admin/dashboard                            │");
    console.log("├─────────────────────────────────────────────────────┤");
    console.log("│  KẾ TOÁN                                            │");
    console.log("│  Email: ketoan@tvu.edu.vn                           │");
    console.log("│  Mật khẩu: 123456                                   │");
    console.log("│  Route: /ke-toan/dashboard                          │");
    console.log("├─────────────────────────────────────────────────────┤");
    console.log("│  CÁN BỘ QUỸ                                         │");
    console.log("│  Email: canbo@tvu.edu.vn                            │");
    console.log("│  Mật khẩu: 123456                                   │");
    console.log("│  Route: /can-bo/dashboard                           │");
    console.log("└─────────────────────────────────────────────────────┘\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi seed staff users:", error.message);
    console.error("   Chi tiết:", error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

seedStaffUsers();

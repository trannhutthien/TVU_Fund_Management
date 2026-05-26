import pool from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Script kiểm tra xem database có user nào với role 1, 2, 3 không
 */
const checkStaffUsers = async () => {
  try {
    console.log("🔍 Đang kiểm tra staff users trong database...\n");

    const [users] = await pool.execute(
      `SELECT user_id, ma_so_dinh_danh, ho_ten, email, role_id, loai_tai_khoan, trang_thai
       FROM nguoidung 
       WHERE role_id IN (1, 2, 3)
       ORDER BY role_id`
    );

    if (users.length === 0) {
      console.log("❌ Không tìm thấy user nào với role 1, 2, 3");
      console.log("\n💡 Bạn cần cập nhật role_id cho một user hiện có:");
      console.log("   UPDATE nguoidung SET role_id = 1 WHERE email = 'your-email@tvu.edu.vn';");
    } else {
      console.log(`✅ Tìm thấy ${users.length} staff user(s):\n`);
      
      const roleNames = {
        1: "Admin",
        2: "Cán bộ Quỹ",
        3: "Kế toán"
      };

      users.forEach((user, index) => {
        console.log(`${index + 1}. ${roleNames[user.role_id]}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Họ tên: ${user.ho_ten}`);
        console.log(`   MSSV: ${user.ma_so_dinh_danh}`);
        console.log(`   Trạng thái: ${user.trang_thai}`);
        console.log("");
      });

      console.log("📝 Để test StaffSidebar:");
      console.log("1. Đăng nhập với một trong các email trên");
      console.log("2. Navigate đến:");
      console.log("   - Admin: /admin/dashboard");
      console.log("   - Cán bộ: /can-bo/dashboard");
      console.log("   - Kế toán: /ke-toan/dashboard");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
};

checkStaffUsers();

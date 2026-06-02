import bcrypt from "bcryptjs";
import pool from "../../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const getOrCreateDonViHocId = async (connection, tenKhoa) => {
  if (!tenKhoa) return null;
  const [rows] = await connection.query(
    "SELECT donvihoc_id FROM donvihoc WHERE tenkhoa = ? LIMIT 1",
    [tenKhoa]
  );
  if (rows.length > 0) {
    return rows[0].donvihoc_id;
  }
  const madonvi = `DV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const [result] = await connection.query(
    "INSERT INTO donvihoc (madonvi, tenkhoa, trangthai) VALUES (?, ?, 'Hoat dong')",
    [madonvi, tenKhoa]
  );
  return result.insertId;
};

const seed = async () => {
  let connection;
  try {
    console.log("🚀 Bắt đầu quá trình seed dữ liệu cho vaitro và nguoidung...\n");
    connection = await pool.getConnection();

    // 1. Kiểm tra và bổ sung cột 'trangthai' cho bảng 'vaitro' nếu chưa tồn tại
    console.log("🔍 Kiểm tra cấu trúc bảng 'vaitro'...");
    const [columnsVaitro] = await connection.query("DESCRIBE vaitro");
    const hasTrangThai = columnsVaitro.some(col => col.Field === "trangthai");

    if (!hasTrangThai) {
      console.log("⚠️  Bảng 'vaitro' thiếu cột 'trangthai'. Tiến hành thêm cột...");
      await connection.query(
        "ALTER TABLE vaitro ADD COLUMN trangthai ENUM('Hoat dong', 'Tam dung') DEFAULT 'Hoat dong' AFTER mota"
      );
      console.log("✅ Thêm cột 'trangthai' thành công!");
    } else {
      console.log("✅ Bảng 'vaitro' đã có cột 'trangthai'.");
    }

    // 2. Thay đổi cấu trúc bảng 'nguoidung' để cột 'loaitaikhoan' cho phép NULL
    console.log("🔍 Thay đổi cột 'loaitaikhoan' trong bảng 'nguoidung' để cho phép NULL...");
    await connection.query(
      "ALTER TABLE nguoidung MODIFY COLUMN loaitaikhoan ENUM('Sinh vien', 'Nha tai tro') NULL DEFAULT NULL"
    );
    console.log("✅ Thay đổi cấu trúc cột 'loaitaikhoan' thành công!");

    // 3. Chèn dữ liệu vai trò (Admin, Kế toán, Cán bộ Quỹ, Sinh viên/Người dùng)
    console.log("\n🌱 Chèn dữ liệu vào bảng 'vaitro'...");
    const roles = [
      { id: 1, ten: "admin", mota: "Quản trị viên hệ thống", trangthai: "Hoat dong" },
      { id: 2, ten: "ketoan", mota: "Bộ phận tài chính kế toán", trangthai: "Hoat dong" },
      { id: 3, ten: "canboquy", mota: "Cán bộ quản lý Quỹ", trangthai: "Hoat dong" },
      { id: 4, ten: "sinhvien", mota: "Người dùng (Sinh viên, Nhà tài trợ)", trangthai: "Hoat dong" },
    ];

    for (const r of roles) {
      await connection.query(
        `INSERT INTO vaitro (vaitro_id, tenvaitro, mota, trangthai)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE tenvaitro = VALUES(tenvaitro), mota = VALUES(mota), trangthai = VALUES(trangthai)`,
        [r.id, r.ten, r.mota, r.trangthai]
      );
      console.log(`- Vai trò: ${r.ten} (ID: ${r.id})`);
    }
    console.log("✅ Seed bảng 'vaitro' hoàn tất!");

    // 4. Chuẩn bị password hash: 123456
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 5. Chèn dữ liệu người dùng
    console.log("\n🌱 Chèn dữ liệu vào bảng 'nguoidung'...");
    const users = [
      {
        email: "admin@tvu.edu.vn",
        matkhau: hashedPassword,
        hoten: "Nguyễn Văn Admin",
        masodinhdanh: "ADMIN001",
        vaitro_id: 1,
        loaitaikhoan: null, // Admin không cần loại tài khoản
        khoaphong: "Ban Giám Hiệu",
        trangthai: "Hoat dong"
      },
      {
        email: "ketoan@tvu.edu.vn",
        matkhau: hashedPassword,
        hoten: "Trần Thị Kế Toán",
        masodinhdanh: "KT001",
        vaitro_id: 2,
        loaitaikhoan: null, // Kế toán không cần loại tài khoản
        khoaphong: "Phòng Kế Hoạch Tài Chính",
        trangthai: "Hoat dong"
      },
      {
        email: "canboquy@tvu.edu.vn",
        matkhau: hashedPassword,
        hoten: "Lê Văn Cán Bộ",
        masodinhdanh: "CB001",
        vaitro_id: 3,
        loaitaikhoan: null, // Cán bộ quỹ không cần loại tài khoản
        khoaphong: "Văn phòng Quỹ Hỗ trợ",
        trangthai: "Hoat dong"
      },
      {
        email: "sinhvien@tvu.edu.vn",
        matkhau: hashedPassword,
        hoten: "Nguyễn Văn Sinh Viên",
        masodinhdanh: "SV001",
        vaitro_id: 4,
        loaitaikhoan: "Sinh vien",
        khoaphong: "Khoa Công nghệ Thông tin",
        trangthai: "Hoat dong"
      },
      {
        email: "nhataitro@tvu.edu.vn",
        matkhau: hashedPassword,
        hoten: "Công ty Cổ phần Nhà tài trợ TVU",
        masodinhdanh: "NTT001",
        vaitro_id: 4,
        loaitaikhoan: "Nha tai tro",
        khoaphong: null,
        trangthai: "Hoat dong"
      }
    ];

    for (const u of users) {
      // Lấy hoặc tạo đơn vị học tương ứng từ bảng donvihoc
      const donvihoc_id = await getOrCreateDonViHocId(connection, u.khoaphong);

      // Check if email already exists
      const [existing] = await connection.query("SELECT nguoidung_id FROM nguoidung WHERE email = ?", [u.email]);
      
      let userId;
      if (existing.length > 0) {
        userId = existing[0].nguoidung_id;
        // Update user
        await connection.query(
          `UPDATE nguoidung 
           SET matkhau = ?, hoten = ?, masodinhdanh = ?, vaitro_id = ?, loaitaikhoan = ?, donvihoc_id = ?, trangthai = ?
           WHERE nguoidung_id = ?`,
          [u.matkhau, u.hoten, u.masodinhdanh, u.vaitro_id, u.loaitaikhoan, donvihoc_id, u.trangthai, userId]
        );
        console.log(`- Cập nhật user: ${u.email} (Vai trò: ${u.vaitro_id}, Loại: ${u.loaitaikhoan}, Đơn vị ID: ${donvihoc_id})`);
      } else {
        // Insert user
        const [result] = await connection.query(
          `INSERT INTO nguoidung (email, matkhau, hoten, masodinhdanh, vaitro_id, loaitaikhoan, donvihoc_id, trangthai)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [u.email, u.matkhau, u.hoten, u.masodinhdanh, u.vaitro_id, u.loaitaikhoan, donvihoc_id, u.trangthai]
        );
        userId = result.insertId;
        console.log(`- Thêm mới user: ${u.email} (ID: ${userId}, Vai trò: ${u.vaitro_id}, Loại: ${u.loaitaikhoan}, Đơn vị ID: ${donvihoc_id})`);
      }

      // Nếu là Nhà tài trợ, hãy chèn một bản ghi tương ứng vào bảng 'nhataitro' nếu chưa tồn tại
      if (u.loaitaikhoan === "Nha tai tro") {
        const [existingDonor] = await connection.query("SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ?", [userId]);
        if (existingDonor.length === 0) {
          await connection.query(
            `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, email, sodienthoai, trangthai)
             VALUES (?, ?, 'To chuc', ?, '0909999999', 'Hoat dong')`,
            [userId, u.hoten, u.email]
          );
          console.log(`  └─ Tạo bản ghi tương ứng trong bảng 'nhataitro' cho user ID: ${userId}`);
        } else {
          // Cập nhật tên và email nếu đã có
          await connection.query(
            `UPDATE nhataitro SET tennhataitro = ?, email = ? WHERE nguoidung_id = ?`,
            [u.hoten, u.email, userId]
          );
          console.log(`  └─ Cập nhật bản ghi nhà tài trợ cho user ID: ${userId}`);
        }
      }
    }
    console.log("✅ Seed bảng 'nguoidung' hoàn tất!");

    console.log("\n🎉 QUÁ TRÌNH SEED DỮ LIỆU THÀNH CÔNG RỰC RỠ!");
    console.log("=============================================================");
    console.log("Tài khoản đăng nhập (mật khẩu chung: 123456):");
    console.log("1. Admin: admin@tvu.edu.vn (Loại tài khoản: NULL)");
    console.log("2. Kế toán: ketoan@tvu.edu.vn (Loại tài khoản: NULL)");
    console.log("3. Cán bộ Quỹ: canboquy@tvu.edu.vn (Loại tài khoản: NULL)");
    console.log("4. Sinh viên: sinhvien@tvu.edu.vn (Loại tài khoản: Sinh vien)");
    console.log("5. Nhà tài trợ: nhataitro@tvu.edu.vn (Loại tài khoản: Nha tai tro)");
    console.log("=============================================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi trong quá trình seed dữ liệu:", error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

seed();

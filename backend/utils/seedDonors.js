import pool from "../config/db.js";
import bcrypt from "bcryptjs";

/**
 * Script để seed dữ liệu nhà tài trợ mẫu
 * 
 * Chạy: node backend/utils/seedDonors.js
 */

const seedDonors = async () => {
  try {
    console.log("🌱 Bắt đầu seed dữ liệu nhà tài trợ...\n");

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 1: Tạo role "Người dùng" nếu chưa có
    // ─────────────────────────────────────────────────────────────────────────
    console.log("📋 Kiểm tra role 'Người dùng'...");
    const [roles] = await pool.query(
      "SELECT role_id FROM vaitro WHERE role_id = 4"
    );

    if (roles.length === 0) {
      await pool.query(
        `INSERT INTO vaitro (role_id, ten_vai_tro, mo_ta, trang_thai) 
         VALUES (4, 'Người dùng', 'Sinh viên và nhà tài trợ', 'HOAT_DONG')`
      );
      console.log("✅ Đã tạo role 'Người dùng' (role_id = 4)\n");
    } else {
      console.log("✅ Role 'Người dùng' đã tồn tại\n");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: Tạo tài khoản nguoidung cho các nhà tài trợ
    // ─────────────────────────────────────────────────────────────────────────
    console.log("👥 Tạo tài khoản người dùng cho nhà tài trợ...");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("donor123", salt);

    const donors = [
      {
        maSoDinhDanh: "DONOR001",
        hoTen: "Nguyễn Văn A",
        email: "vingroup@example.com",
        soDienThoai: "0901234567",
        diaChi: "Hà Nội",
        avatar: "uploads/avatars/vingroup.jpg",
        tenNhaTaiTro: "Vingroup",
        loai: "To chuc",
        soTien: 100000000, // 100 triệu
      },
      {
        maSoDinhDanh: "DONOR002",
        hoTen: "Trần Thị B",
        email: "vinamilk@example.com",
        soDienThoai: "0902345678",
        diaChi: "TP.HCM",
        avatar: "uploads/avatars/vinamilk.jpg",
        tenNhaTaiTro: "Vinamilk",
        loai: "To chuc",
        soTien: 80000000, // 80 triệu
      },
      {
        maSoDinhDanh: "DONOR003",
        hoTen: "Lê Văn C",
        email: "masan@example.com",
        soDienThoai: "0903456789",
        diaChi: "Đà Nẵng",
        avatar: "uploads/avatars/masangruop.jpg",
        tenNhaTaiTro: "Masan Group",
        loai: "To chuc",
        soTien: 30000000, // 30 triệu
      },
      {
        maSoDinhDanh: "DONOR004",
        hoTen: "Phạm Thị D",
        email: "thtruemilk@example.com",
        soDienThoai: "0904567890",
        diaChi: "Cần Thơ",
        avatar: "uploads/avatars/thtruemilk.jpg",
        tenNhaTaiTro: "TH True Milk",
        loai: "To chuc",
        soTien: 25000000, // 25 triệu
      },
    ];

    for (const donor of donors) {
      // Kiểm tra email đã tồn tại chưa
      const [existingUser] = await pool.query(
        "SELECT user_id FROM nguoidung WHERE email = ?",
        [donor.email]
      );

      let userId;

      if (existingUser.length > 0) {
        userId = existingUser[0].user_id;
        console.log(`  ⏭️  User ${donor.email} đã tồn tại (user_id: ${userId})`);
      } else {
        // Tạo user mới
        const [userResult] = await pool.query(
          `INSERT INTO nguoidung (
            ma_so_dinh_danh, 
            ho_ten, 
            email, 
            mat_khau, 
            avatar,
            so_dien_thoai,
            dia_chi,
            role_id, 
            loai_tai_khoan,
            trang_thai
          ) VALUES (?, ?, ?, ?, ?, ?, ?, 4, 'NHA_TAI_TRO', 'HOAT_DONG')`,
          [
            donor.maSoDinhDanh,
            donor.hoTen,
            donor.email,
            hashedPassword,
            donor.avatar,
            donor.soDienThoai,
            donor.diaChi,
          ]
        );
        userId = userResult.insertId;
        console.log(`  ✅ Đã tạo user ${donor.email} (user_id: ${userId})`);
      }

      // Kiểm tra nhà tài trợ đã tồn tại chưa
      const [existingDonor] = await pool.query(
        "SELECT nha_tai_tro_id FROM nhataitro WHERE user_id = ?",
        [userId]
      );

      let donorId;

      if (existingDonor.length > 0) {
        donorId = existingDonor[0].nha_tai_tro_id;
        console.log(`  ⏭️  Nhà tài trợ ${donor.tenNhaTaiTro} đã tồn tại (nha_tai_tro_id: ${donorId})`);
      } else {
        // Tạo nhà tài trợ mới
        const [donorResult] = await pool.query(
          `INSERT INTO nhataitro (user_id, ten_nha_tai_tro, loai) 
           VALUES (?, ?, ?)`,
          [userId, donor.tenNhaTaiTro, donor.loai]
        );
        donorId = donorResult.insertId;
        console.log(`  ✅ Đã tạo nhà tài trợ ${donor.tenNhaTaiTro} (nha_tai_tro_id: ${donorId})`);
      }

      // Tạo quỹ mẫu nếu chưa có
      const [existingFund] = await pool.query(
        "SELECT quy_id FROM quy WHERE ten_quy = 'Quỹ Học Bổng' LIMIT 1"
      );

      let fundId;
      if (existingFund.length > 0) {
        fundId = existingFund[0].quy_id;
      } else {
        const [fundResult] = await pool.query(
          `INSERT INTO quy (ten_quy, loai_quy, mo_ta, so_du, trang_thai) 
           VALUES ('Quỹ Học Bổng', 'Hoc bong', 'Quỹ hỗ trợ học bổng sinh viên', 0, 'Dang hoat dong')`
        );
        fundId = fundResult.insertId;
        console.log(`  ✅ Đã tạo quỹ 'Quỹ Học Bổng' (quy_id: ${fundId})`);
      }

      // Tạo khoản tài trợ
      const [existingDonation] = await pool.query(
        "SELECT khoan_tai_tro_id FROM khoantaitro WHERE nha_tai_tro_id = ? AND quy_id = ?",
        [donorId, fundId]
      );

      let donationId;
      if (existingDonation.length > 0) {
        donationId = existingDonation[0].khoan_tai_tro_id;
        console.log(`  ⏭️  Khoản tài trợ đã tồn tại (khoan_tai_tro_id: ${donationId})`);
      } else {
        const [donationResult] = await pool.query(
          `INSERT INTO khoantaitro (nha_tai_tro_id, quy_id, so_tien, trang_thai, ghi_chu) 
           VALUES (?, ?, ?, 'Da nhan', 'Khoản tài trợ mẫu')`,
          [donorId, fundId, donor.soTien]
        );
        donationId = donationResult.insertId;
        console.log(`  ✅ Đã tạo khoản tài trợ ${donor.soTien.toLocaleString('vi-VN')} VNĐ (khoan_tai_tro_id: ${donationId})`);
      }

      // Tạo giao dịch
      const [existingTransaction] = await pool.query(
        "SELECT transaction_id FROM giaodich WHERE khoan_tai_tro_id = ?",
        [donationId]
      );

      if (existingTransaction.length > 0) {
        console.log(`  ⏭️  Giao dịch đã tồn tại (transaction_id: ${existingTransaction[0].transaction_id})`);
      } else {
        const [transactionResult] = await pool.query(
          `INSERT INTO giaodich (quy_id, khoan_tai_tro_id, loai, so_tien, trang_thai, ghi_chu) 
           VALUES (?, ?, 'Thu', ?, 'Thanh cong', 'Giao dịch tài trợ')`,
          [fundId, donationId, donor.soTien]
        );
        console.log(`  ✅ Đã tạo giao dịch (transaction_id: ${transactionResult.insertId})`);
      }

      console.log("");
    }

    console.log("🎉 Seed dữ liệu thành công!\n");
    console.log("📊 Tóm tắt:");
    console.log(`  - Số lượng nhà tài trợ: ${donors.length}`);
    console.log(`  - Tổng số tiền tài trợ: ${donors.reduce((sum, d) => sum + d.soTien, 0).toLocaleString('vi-VN')} VNĐ`);
    console.log("\n✅ Bạn có thể test API tại: http://localhost:5001/api/donors/wall");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi seed dữ liệu:", error);
    process.exit(1);
  }
};

// Chạy seed
seedDonors();

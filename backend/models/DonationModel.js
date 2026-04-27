import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONATION MODEL ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createPublicDonation
// MỤC ĐÍCH: Tạo donation public với DATABASE TRANSACTION
// ─────────────────────────────────────────────────────────────────────────────
// 
// TẠI SAO DÙNG TRANSACTION?
// - Đảm bảo tính toàn vẹn dữ liệu (data integrity)
// - Nếu 1 trong 2 bước thất bại → Rollback toàn bộ
// - Tránh trường hợp: Tạo nhà tài trợ thành công nhưng tạo khoản tài trợ thất bại
//
// LUỒNG XỬ LÝ:
// 1. Lấy connection từ pool
// 2. BEGIN TRANSACTION
// 3. Kiểm tra email trong bảng NhaTaiTro
//    ├─ Nếu ĐÃ TỒN TẠI → Lấy nha_tai_tro_id
//    └─ Nếu CHƯA TỒN TẠI → INSERT mới và lấy insertId
// 4. INSERT vào bảng KhoanTaiTro với trang_thai = "Chờ duyệt"
// 5. COMMIT TRANSACTION
// 6. Release connection
// 7. Trả về nhaTaiTroId và khoanTaiTroId
//
const createPublicDonation = async (donationData) => {
  // ─────────────────────────────────────────────────────────────────────────
  // BƯỚC 1: LẤY CONNECTION TỪ POOL
  // ─────────────────────────────────────────────────────────────────────────
  // LƯU Ý: Phải dùng getConnection() để có thể sử dụng transaction
  // Không thể dùng pool.query() trực tiếp vì mỗi query sẽ dùng connection khác nhau
  const connection = await pool.getConnection();
  
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: BẮT ĐẦU TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    // Từ đây trở đi, tất cả các query sẽ nằm trong 1 transaction
    // Nếu có lỗi → Rollback toàn bộ
    await connection.beginTransaction();

    const { ten, email, soDienThoai, soTien, quyId, ghiChu } = donationData;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: KIỂM TRA EMAIL ĐÃ TỒN TẠI TRONG BẢNG NhaTaiTro CHƯA
    // ─────────────────────────────────────────────────────────────────────────
    // Đây là điểm KHÁC BIỆT chính với API Admin:
    // - API Admin: Không cho phép tạo nhà tài trợ trùng email
    // - API Public: Dùng lại nhà tài trợ cũ nếu email đã tồn tại
    const [existingDonors] = await connection.query(
      `SELECT nha_tai_tro_id FROM NhaTaiTro WHERE email = ? LIMIT 1`,
      [email]
    );

    let nhaTaiTroId;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: XỬ LÝ NHÀ TÀI TRỢ (TẠO MỚI HOẶC DÙNG LẠI)
    // ─────────────────────────────────────────────────────────────────────────
    
    if (existingDonors.length > 0) {
      // ───────────────────────────────────────────────────────────────────────
      // TRƯỜNG HỢP 1: EMAIL ĐÃ TỒN TẠI
      // ───────────────────────────────────────────────────────────────────────
      // → Dùng lại nhà tài trợ cũ (không tạo mới)
      // → Lấy nha_tai_tro_id từ record cũ
      nhaTaiTroId = existingDonors[0].nha_tai_tro_id;
    } else {
      // ───────────────────────────────────────────────────────────────────────
      // TRƯỜNG HỢP 2: EMAIL CHƯA TỒN TẠI
      // ───────────────────────────────────────────────────────────────────────
      // → Tạo mới nhà tài trợ trong bảng NhaTaiTro
      // → Lấy insertId làm nha_tai_tro_id
      const [insertDonorResult] = await connection.query(
        `INSERT INTO NhaTaiTro (
          ten_nha_tai_tro,
          loai,
          email,
          so_dien_thoai
        ) VALUES (?, ?, ?, ?)`,
        [ten, 'Ca nhan', email, soDienThoai]
      );
      
      nhaTaiTroId = insertDonorResult.insertId;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: TẠO KHOẢN TÀI TRỢ TRONG BẢNG KhoanTaiTro
    // ─────────────────────────────────────────────────────────────────────────
    // LƯU Ý:
    // - trang_thai = "Chờ duyệt" (chờ Admin xác nhận đã nhận tiền)
    // - Sau khi người dùng chuyển khoản, Admin sẽ đổi trạng thái thành "Đã nhận"
    const [insertDonationResult] = await connection.query(
      `INSERT INTO KhoanTaiTro (
        nha_tai_tro_id,
        quy_id,
        so_tien,
        trang_thai,
        ghi_chu
      ) VALUES (?, ?, ?, ?, ?)`,
      [nhaTaiTroId, quyId, soTien, 'Cho duyet', ghiChu]
    );

    const khoanTaiTroId = insertDonationResult.insertId;

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 6: COMMIT TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    // Nếu đến đây không có lỗi → Lưu tất cả thay đổi vào database
    await connection.commit();

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 7: TRẢ VỀ KẾT QUẢ
    // ─────────────────────────────────────────────────────────────────────────
    return {
      nhaTaiTroId,
      khoanTaiTroId
    };
  } catch (error) {
    // ─────────────────────────────────────────────────────────────────────────
    // XỬ LÝ LỖI: ROLLBACK TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    // Nếu có bất kỳ lỗi nào xảy ra:
    // - Rollback toàn bộ transaction
    // - Không lưu gì vào database
    // - Ném lỗi ra ngoài để controller xử lý
    await connection.rollback();
    throw error;
  } finally {
    // ─────────────────────────────────────────────────────────────────────────
    // GIẢI PHÓNG CONNECTION
    // ─────────────────────────────────────────────────────────────────────────
    // LƯU Ý: Luôn phải release connection về pool
    // Nếu không release → Connection bị leak → Hết connection trong pool
    connection.release();
  }
};

export default {
  createPublicDonation
};

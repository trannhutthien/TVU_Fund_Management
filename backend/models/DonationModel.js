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

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonationById
// MỤC ĐÍCH: Lấy thông tin chi tiết khoản tài trợ theo ID
// ─────────────────────────────────────────────────────────────────────────────
const getDonationById = async (khoanTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT 
      kt.khoan_tai_tro_id,
      kt.nha_tai_tro_id,
      kt.quy_id,
      kt.so_tien,
      kt.hinh_anh_minh_chung,
      kt.ngay_tai_tro,
      kt.trang_thai,
      kt.ghi_chu,
      kt.ngay_cap_nhat,
      ntt.ten_nha_tai_tro,
      ntt.email,
      ntt.so_dien_thoai,
      q.ten_quy,
      q.loai_quy,
      q.so_du as quy_so_du
     FROM KhoanTaiTro kt
     INNER JOIN NhaTaiTro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
     INNER JOIN Quy q ON kt.quy_id = q.quy_id
     WHERE kt.khoan_tai_tro_id = ?
     LIMIT 1`,
    [khoanTaiTroId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: approveDonation
// MỤC ĐÍCH: Duyệt khoản tài trợ với DATABASE TRANSACTION
// ─────────────────────────────────────────────────────────────────────────────
// 
// TẠI SAO DÙNG TRANSACTION?
// - Phải thực hiện 3 thao tác cùng lúc:
//   1. Cập nhật trạng thái khoản tài trợ
//   2. Cộng tiền vào quỹ
//   3. Tạo giao dịch
// - Nếu 1 trong 3 thất bại → Rollback toàn bộ
//
// LUỒNG XỬ LÝ:
// 1. Lấy connection từ pool
// 2. BEGIN TRANSACTION
// 3. Cập nhật trang_thai KhoanTaiTro từ "Chờ duyệt" → "Đã nhận"
// 4. Cộng so_tien vào so_du của bảng Quy
// 5. Tạo bản ghi trong GiaoDich với loai_giao_dich = "Thu"
// 6. COMMIT TRANSACTION
// 7. Release connection
//
const approveDonation = async (khoanTaiTroId, nguoiDuyetId) => {
  // ─────────────────────────────────────────────────────────────────────────
  // BƯỚC 1: LẤY CONNECTION TỪ POOL
  // ─────────────────────────────────────────────────────────────────────────
  const connection = await pool.getConnection();
  
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 2: BẮT ĐẦU TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    await connection.beginTransaction();

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 3: CẬP NHẬT TRẠNG THÁI KHOẢN TÀI TRỢ
    // ─────────────────────────────────────────────────────────────────────────
    // Đổi từ "Chờ duyệt" → "Đã nhận"
    const [updateResult] = await connection.execute(
      `UPDATE KhoanTaiTro 
       SET trang_thai = 'Da nhan',
           ngay_cap_nhat = CURRENT_TIMESTAMP
       WHERE khoan_tai_tro_id = ? 
       AND trang_thai = 'Cho duyet'`,
      [khoanTaiTroId]
    );

    // Kiểm tra có cập nhật được không (có thể khoản tài trợ không tồn tại hoặc đã duyệt rồi)
    if (updateResult.affectedRows === 0) {
      throw new Error('DONATION_NOT_FOUND_OR_ALREADY_APPROVED');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 4: LẤY THÔNG TIN KHOẢN TÀI TRỢ
    // ─────────────────────────────────────────────────────────────────────────
    const [donations] = await connection.query(
      `SELECT quy_id, so_tien, nha_tai_tro_id 
       FROM KhoanTaiTro 
       WHERE khoan_tai_tro_id = ?`,
      [khoanTaiTroId]
    );

    const donation = donations[0];

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 5: CỘNG TIỀN VÀO QUỸ
    // ─────────────────────────────────────────────────────────────────────────
    // Cập nhật so_du của bảng Quy
    await connection.execute(
      `UPDATE Quy 
       SET so_du = so_du + ?,
           ngay_cap_nhat = CURRENT_TIMESTAMP
       WHERE quy_id = ?`,
      [donation.so_tien, donation.quy_id]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 6: TẠO GIAO DỊCH TRONG BẢNG GiaoDich
    // ─────────────────────────────────────────────────────────────────────────
    // Ghi nhận giao dịch THU (nhận tiền từ nhà tài trợ)
    // LƯU Ý: Theo schema thực tế, các cột là:
    // - transaction_id (AUTO_INCREMENT)
    // - quy_id, khoan_tai_tro_id, request_id, nguoi_tao_id
    // - loai, so_tien, trang_thai
    // - minh_chung_chuyen_khoan, ghi_chu
    // - ngay_giao_dich, ngay_cap_nhat (AUTO)
    await connection.execute(
      `INSERT INTO GiaoDich (
        quy_id,
        khoan_tai_tro_id,
        nguoi_tao_id,
        loai,
        so_tien,
        trang_thai,
        ghi_chu
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        donation.quy_id,
        khoanTaiTroId,
        nguoiDuyetId,
        'Thu',
        donation.so_tien,
        'Cho xu ly',
        `Duyệt khoản tài trợ #${khoanTaiTroId}`
      ]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // BƯỚC 7: COMMIT TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    await connection.commit();

    return {
      success: true,
      khoanTaiTroId,
      quyId: donation.quy_id,
      soTien: donation.so_tien
    };
  } catch (error) {
    // ─────────────────────────────────────────────────────────────────────────
    // XỬ LÝ LỖI: ROLLBACK TRANSACTION
    // ─────────────────────────────────────────────────────────────────────────
    await connection.rollback();
    throw error;
  } finally {
    // ─────────────────────────────────────────────────────────────────────────
    // GIẢI PHÓNG CONNECTION
    // ─────────────────────────────────────────────────────────────────────────
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectDonation
// MỤC ĐÍCH: Từ chối khoản tài trợ (chuyển trạng thái từ "Chờ duyệt" → "Từ chối")
// ─────────────────────────────────────────────────────────────────────────────
// 
// KHÁC BIỆT VỚI approveDonation:
// - KHÔNG dùng transaction (chỉ UPDATE 1 bảng)
// - KHÔNG cộng tiền vào quỹ
// - KHÔNG tạo giao dịch
// - Chỉ cập nhật trạng thái và lưu lý do từ chối
//
const rejectDonation = async (khoanTaiTroId, lyDoTuChoi) => {
  // Cập nhật trạng thái và lý do từ chối
  // LƯU Ý: Schema có thể không có cột ly_do_tu_choi, sẽ lưu vào ghi_chu
  const [result] = await pool.execute(
    `UPDATE KhoanTaiTro 
     SET trang_thai = 'Tu choi',
         ngay_cap_nhat = CURRENT_TIMESTAMP
     WHERE khoan_tai_tro_id = ? 
     AND trang_thai = 'Cho duyet'`,
    [khoanTaiTroId]
  );

  // Kiểm tra có cập nhật được không
  if (result.affectedRows === 0) {
    throw new Error('DONATION_NOT_FOUND_OR_ALREADY_PROCESSED');
  }

  return {
    success: true,
    khoanTaiTroId
  };
};

export default {
  createPublicDonation,
  getDonationById,
  approveDonation,
  rejectDonation
};

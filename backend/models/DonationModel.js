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
// HÀM: createStaffDonation
// MỤC ĐÍCH: Cán bộ Quỹ ghi nhận 1 khoản tài trợ mới (đã biết nhà tài trợ)
//   - Khác với createPublicDonation: không tự tạo nhà tài trợ, dùng id có sẵn
//   - Khoản tạo với trạng thái 'Da duyet' (Cán bộ đã duyệt cấp 1)
//   - TẠO PHÊ DUYỆT 2 CẤP:
//     • Cấp 1: Cán bộ Quỹ → ket_qua = 'Da duyet' (đã ghi nhận)
//     • Cấp 2: Kế toán/Admin → ket_qua = 'Cho duyet' (chờ duyệt)
// ─────────────────────────────────────────────────────────────────────────────
const createStaffDonation = async ({ nhaTaiTroId, quyId, soTien, ghiChu, hinhAnhMinhChung, nguoiDuyetId }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [insertRes] = await connection.execute(
      `INSERT INTO khoantaitro (
         nha_tai_tro_id, quy_id, so_tien, trang_thai, ghi_chu, hinh_anh_minh_chung
       ) VALUES (?, ?, ?, 'Da duyet', ?, ?)`,
      [nhaTaiTroId, quyId, soTien, ghiChu || null, hinhAnhMinhChung || null]
    );
    const khoanTaiTroId = insertRes.insertId;

    // Pheduyet cấp 1: Cán bộ Quỹ đã ghi nhận
    await connection.execute(
      `INSERT INTO pheduyet (
         khoan_tai_tro_id, nguoi_duyet_id, cap_do_duyet, ket_qua, ghi_chu, ngay_duyet
       ) VALUES (?, ?, 1, 'Da duyet', ?, CURRENT_TIMESTAMP)`,
      [khoanTaiTroId, nguoiDuyetId || null, 'Cán bộ Quỹ ghi nhận khoản tài trợ']
    );

    // Pheduyet cấp 2: chờ Kế toán/Admin duyệt
    await connection.execute(
      `INSERT INTO pheduyet (
         khoan_tai_tro_id, cap_do_duyet, ket_qua
       ) VALUES (?, 2, 'Cho duyet')`,
      [khoanTaiTroId]
    );

    await connection.commit();
    return { khoanTaiTroId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
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
      ntt.loai as loai_ntt,
      nd.ho_ten,
      nd.email,
      nd.so_dien_thoai,
      nd.avatar,
      q.ten_quy,
      q.loai_quy,
      q.so_du as quy_so_du
     FROM KhoanTaiTro kt
     INNER JOIN NhaTaiTro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
     INNER JOIN nguoidung nd ON ntt.user_id = nd.user_id
     INNER JOIN Quy q ON kt.quy_id = q.quy_id
     WHERE kt.khoan_tai_tro_id = ?
     LIMIT 1`,
    [khoanTaiTroId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: listDonations
// MỤC ĐÍCH: List khoản tài trợ với filter + phân trang (cho Kế toán)
//   - keyword: tìm theo tên NTT, tên quỹ, ghi chú
//   - quy_id, loai_ntt, trang_thai: lọc
//   - tu_ngay, den_ngay: lọc theo ngay_tai_tro
// ─────────────────────────────────────────────────────────────────────────────
const listDonations = async ({
  keyword = '',
  quy_id = '',
  loai_ntt = '',
  trang_thai = '',
  tu_ngay = '',
  den_ngay = '',
  page = 1,
  page_size = 15,
}) => {
  const conds = [];
  const params = [];

  if (keyword) {
    conds.push(`(ntt.ten_nha_tai_tro LIKE ? OR q.ten_quy LIKE ? OR kt.ghi_chu LIKE ?)`);
    const like = `%${keyword}%`;
    params.push(like, like, like);
  }
  if (quy_id) { conds.push(`kt.quy_id = ?`); params.push(quy_id); }
  if (loai_ntt) { conds.push(`ntt.loai = ?`); params.push(loai_ntt); }
  if (trang_thai) { conds.push(`kt.trang_thai = ?`); params.push(trang_thai); }
  if (tu_ngay) { conds.push(`kt.ngay_tai_tro >= ?`); params.push(`${tu_ngay} 00:00:00`); }
  if (den_ngay) { conds.push(`kt.ngay_tai_tro <= ?`); params.push(`${den_ngay} 23:59:59`); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const offset = (page - 1) * page_size;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM khoantaitro kt
     INNER JOIN nhataitro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
     INNER JOIN nguoidung nd ON ntt.user_id = nd.user_id
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     ${where}`,
    params
  );

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
        ntt.loai as loai_ntt,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.avatar,
        q.ten_quy,
        q.loai_quy
     FROM khoantaitro kt
     INNER JOIN nhataitro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
     INNER JOIN nguoidung nd ON ntt.user_id = nd.user_id
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     ${where}
     ORDER BY
        CASE kt.trang_thai
          WHEN 'Da duyet' THEN 1
          WHEN 'Cho duyet' THEN 2
          WHEN 'Da nhan' THEN 3
          WHEN 'Tu choi' THEN 4
        END,
        kt.ngay_tai_tro DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(page_size), offset]
  );

  return { rows, total: Number(total) || 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonationStatsForKeToan
// MỤC ĐÍCH: 4 thẻ stats cho trang Khoản tài trợ (Kế toán)
// ─────────────────────────────────────────────────────────────────────────────
const getDonationStatsForKeToan = async () => {
  const [[{ canXacNhan }]] = await pool.query(
    `SELECT COUNT(*) AS canXacNhan FROM khoantaitro WHERE trang_thai = 'Da duyet'`
  );
  const [[{ daXacNhanHomNay }]] = await pool.query(
    `SELECT COUNT(*) AS daXacNhanHomNay FROM khoantaitro
     WHERE trang_thai = 'Da nhan' AND DATE(ngay_cap_nhat) = CURDATE()`
  );
  const [[{ tongThangNay }]] = await pool.query(
    `SELECT COALESCE(SUM(so_tien),0) AS tongThangNay FROM khoantaitro
     WHERE trang_thai = 'Da nhan'
       AND MONTH(ngay_cap_nhat) = MONTH(CURRENT_DATE())
       AND YEAR(ngay_cap_nhat) = YEAR(CURRENT_DATE())`
  );
  const [[{ choCanBo }]] = await pool.query(
    `SELECT COUNT(*) AS choCanBo FROM khoantaitro WHERE trang_thai = 'Cho duyet'`
  );
  return {
    canXacNhan: Number(canXacNhan) || 0,
    daXacNhanHomNay: Number(daXacNhanHomNay) || 0,
    tongThangNay: Number(tongThangNay) || 0,
    choCanBo: Number(choCanBo) || 0,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getPheDuyetByKhoanTaiTro
// MỤC ĐÍCH: Lịch sử phê duyệt 1 khoản tài trợ (timeline)
// ─────────────────────────────────────────────────────────────────────────────
const getPheDuyetByKhoanTaiTro = async (khoanTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT
        pd.phe_duyet_id,
        pd.cap_do_duyet,
        pd.ket_qua,
        pd.ghi_chu,
        pd.ly_do_tu_choi,
        pd.ngay_tao,
        pd.ngay_duyet,
        pd.nguoi_duyet_id,
        nd.ho_ten AS nguoi_duyet_ten,
        nd.avatar AS nguoi_duyet_avatar,
        vt.ten_vai_tro AS nguoi_duyet_vai_tro
     FROM pheduyet pd
     LEFT JOIN nguoidung nd ON pd.nguoi_duyet_id = nd.user_id
     LEFT JOIN vaitro vt ON nd.role_id = vt.role_id
     WHERE pd.khoan_tai_tro_id = ?
     ORDER BY pd.cap_do_duyet ASC`,
    [khoanTaiTroId]
  );
  return rows;
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
const approveDonation = async (khoanTaiTroId, nguoiDuyetId, { ghiChu, minhChungKeToan } = {}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1) Đổi trạng thái khoản tài trợ: 'Cho duyet'/'Da duyet' → 'Da nhan'
    const [updateResult] = await connection.execute(
      `UPDATE KhoanTaiTro
       SET trang_thai = 'Da nhan',
           ngay_cap_nhat = CURRENT_TIMESTAMP
       WHERE khoan_tai_tro_id = ?
       AND trang_thai IN ('Cho duyet','Da duyet')`,
      [khoanTaiTroId]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('DONATION_NOT_FOUND_OR_ALREADY_APPROVED');
    }

    // 2) Lấy thông tin khoản tài trợ
    const [donations] = await connection.query(
      `SELECT quy_id, so_tien, nha_tai_tro_id
       FROM KhoanTaiTro
       WHERE khoan_tai_tro_id = ?`,
      [khoanTaiTroId]
    );
    const donation = donations[0];

    // 3) Cộng tiền vào quỹ
    await connection.execute(
      `UPDATE Quy
       SET so_du = so_du + ?,
           ngay_cap_nhat = CURRENT_TIMESTAMP
       WHERE quy_id = ?`,
      [donation.so_tien, donation.quy_id]
    );

    // 4) Tạo giao dịch Thu (kèm minh chứng Kế toán nếu có)
    await connection.execute(
      `INSERT INTO GiaoDich (
        quy_id, khoan_tai_tro_id, nguoi_tao_id, loai, so_tien, trang_thai,
        minh_chung_chuyen_khoan, ghi_chu
      ) VALUES (?, ?, ?, 'Thu', ?, 'Thanh cong', ?, ?)`,
      [
        donation.quy_id,
        khoanTaiTroId,
        nguoiDuyetId,
        donation.so_tien,
        minhChungKeToan || null,
        ghiChu || `Duyệt khoản tài trợ #${khoanTaiTroId}`
      ]
    );

    // 5) Cập nhật pheduyet cấp 2 → 'Da duyet'
    const [pheUpdate] = await connection.execute(
      `UPDATE pheduyet
         SET ket_qua = 'Da duyet',
             nguoi_duyet_id = ?,
             ghi_chu = COALESCE(?, ghi_chu),
             ngay_duyet = CURRENT_TIMESTAMP
       WHERE khoan_tai_tro_id = ?
         AND cap_do_duyet = 2
         AND ket_qua = 'Cho duyet'`,
      [nguoiDuyetId, ghiChu || null, khoanTaiTroId]
    );
    if (pheUpdate.affectedRows === 0) {
      await connection.execute(
        `INSERT INTO pheduyet (
           khoan_tai_tro_id, nguoi_duyet_id, cap_do_duyet, ket_qua, ghi_chu, ngay_duyet
         ) VALUES (?, ?, 2, 'Da duyet', ?, CURRENT_TIMESTAMP)`,
        [khoanTaiTroId, nguoiDuyetId, ghiChu || null]
      );
    }

    // 6) Re-calc 4 cột stats trên nhataitro (idempotent, chỉ tính 'Da nhan')
    await connection.execute(
      `UPDATE nhataitro ntt
         SET tong_so_tien_da_tai_tro = (
                SELECT COALESCE(SUM(so_tien), 0) FROM khoantaitro
                 WHERE nha_tai_tro_id = ntt.nha_tai_tro_id AND trang_thai = 'Da nhan'),
             so_lan_tai_tro = (
                SELECT COUNT(*) FROM khoantaitro
                 WHERE nha_tai_tro_id = ntt.nha_tai_tro_id AND trang_thai = 'Da nhan'),
             so_quy_da_ho_tro = (
                SELECT COUNT(DISTINCT quy_id) FROM khoantaitro
                 WHERE nha_tai_tro_id = ntt.nha_tai_tro_id AND trang_thai = 'Da nhan'),
             lan_tai_tro_gan_nhat = (
                SELECT MAX(ngay_tai_tro) FROM khoantaitro
                 WHERE nha_tai_tro_id = ntt.nha_tai_tro_id AND trang_thai = 'Da nhan')
       WHERE ntt.nha_tai_tro_id = ?`,
      [donation.nha_tai_tro_id]
    );

    await connection.commit();

    return {
      success: true,
      khoanTaiTroId,
      quyId: donation.quy_id,
      soTien: donation.so_tien
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectDonation
// MỤC ĐÍCH: Từ chối khoản tài trợ (chuyển trạng thái từ "Chờ duyệt" → "Từ chối")
//   - KHÔNG cộng tiền vào quỹ, KHÔNG tạo giao dịch
//   - Cập nhật pheduyet cấp 2 thành 'Tu choi' + lý do
// ─────────────────────────────────────────────────────────────────────────────
const rejectDonation = async (khoanTaiTroId, lyDoTuChoi, nguoiDuyetId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE KhoanTaiTro
       SET trang_thai = 'Tu choi',
           ngay_cap_nhat = CURRENT_TIMESTAMP
       WHERE khoan_tai_tro_id = ?
       AND trang_thai IN ('Cho duyet','Da duyet')`,
      [khoanTaiTroId]
    );

    if (result.affectedRows === 0) {
      throw new Error('DONATION_NOT_FOUND_OR_ALREADY_PROCESSED');
    }

    // Cập nhật pheduyet cấp 2 → 'Tu choi'
    const [pheUpdate] = await connection.execute(
      `UPDATE pheduyet
         SET ket_qua = 'Tu choi',
             nguoi_duyet_id = ?,
             ly_do_tu_choi = ?,
             ngay_duyet = CURRENT_TIMESTAMP
       WHERE khoan_tai_tro_id = ?
         AND cap_do_duyet = 2
         AND ket_qua = 'Cho duyet'`,
      [nguoiDuyetId || null, lyDoTuChoi, khoanTaiTroId]
    );
    if (pheUpdate.affectedRows === 0) {
      await connection.execute(
        `INSERT INTO pheduyet (
           khoan_tai_tro_id, nguoi_duyet_id, cap_do_duyet, ket_qua, ly_do_tu_choi, ngay_duyet
         ) VALUES (?, ?, 2, 'Tu choi', ?, CURRENT_TIMESTAMP)`,
        [khoanTaiTroId, nguoiDuyetId || null, lyDoTuChoi]
      );
    }

    await connection.commit();
    return { success: true, khoanTaiTroId };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export default {
  createPublicDonation,
  createStaffDonation,
  getDonationById,
  listDonations,
  getDonationStatsForKeToan,
  getPheDuyetByKhoanTaiTro,
  approveDonation,
  rejectDonation,
};

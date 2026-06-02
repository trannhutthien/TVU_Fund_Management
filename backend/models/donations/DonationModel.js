import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONATION MODEL ────────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// LƯU Ý: Schema mới không còn bảng pheduyet riêng cho khoản tài trợ
// Khoản tài trợ chỉ có các trạng thái: Cho duyet, Da duyet, Da nhan, Tu choi

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createPublicDonation
// MỤC ĐÍCH: Tạo donation public với DATABASE TRANSACTION
// ─────────────────────────────────────────────────────────────────────────────
const createPublicDonation = async (donationData) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { ten, email, soDienThoai, soTien, quyId, ghiChu, hinhThuc, maGiaoDich } = donationData;

    // Kiểm tra email đã tồn tại trong nguoidung chưa
    const [existingUsers] = await connection.query(
      `SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1`,
      [email]
    );

    let nhaTaiTroId;

    if (existingUsers.length > 0) {
      const nguoiDungId = existingUsers[0].nguoidung_id;

      // Kiểm tra xem đã có record nhataitro tương ứng chưa
      const [existingDonors] = await connection.query(
        `SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ? LIMIT 1`,
        [nguoiDungId]
      );

      if (existingDonors.length > 0) {
        nhaTaiTroId = existingDonors[0].nhataitro_id;
      } else {
        // Tự động tạo record nhataitro nếu chưa có
        const [insertDonorResult] = await connection.query(
          `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, email, sodienthoai, trangthai) 
           VALUES (?, ?, 'Ca nhan', ?, ?, 'Hoat dong')`,
          [nguoiDungId, ten, email, soDienThoai]
        );
        nhaTaiTroId = insertDonorResult.insertId;
      }
    } else {
      // Tạo user mới trong nguoidung
      const maSoDinhDanh = `PUB_${Date.now()}`;
      const defaultHash = "$2a$10$wK1Gv5vM2.H4xN.9dZc.4O1.Ule12Lg0eL2iU3aE8cO8dGz1vN3j.";

      const [insertUserResult] = await connection.query(
        `INSERT INTO nguoidung (
          masodinhdanh, 
          hoten, 
          email, 
          matkhau, 
          sodienthoai,
          vaitro_id, 
          trangthai
        ) VALUES (?, ?, ?, ?, ?, 4, 'Hoat dong')`,
        [maSoDinhDanh, ten, email, defaultHash, soDienThoai]
      );

      const newNguoiDungId = insertUserResult.insertId;

      // Tạo record nhataitro tương ứng
      const [insertDonorResult] = await connection.query(
        `INSERT INTO nhataitro (nguoidung_id, tennhataitro, loainhataitro, email, sodienthoai, trangthai) 
         VALUES (?, ?, 'Ca nhan', ?, ?, 'Hoat dong')`,
        [newNguoiDungId, ten, email, soDienThoai]
      );

      nhaTaiTroId = insertDonorResult.insertId;
    }

    // Tạo khoản tài trợ trong bảng khoantaitro
    const [insertDonationResult] = await connection.query(
      `INSERT INTO khoantaitro (
        nhataitro_id,
        quy_id,
        sotien,
        hinhthuc,
        magiaodich,
        ngaytaitro,
        trangthai,
        ghichu
      ) VALUES (?, ?, ?, ?, ?, CURRENT_DATE, 'Cho duyet', ?)`,
      [nhaTaiTroId, quyId, soTien, hinhThuc || 'Chuyen khoan', maGiaoDich, ghiChu]
    );

    const khoanTaiTroId = insertDonationResult.insertId;

    await connection.commit();

    return {
      nhaTaiTroId,
      khoanTaiTroId
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createStaffDonation
// MỤC ĐÍCH: Cán bộ Quỹ ghi nhận 1 khoản tài trợ mới (đã biết nhà tài trợ)
// ─────────────────────────────────────────────────────────────────────────────
const createStaffDonation = async ({ nhaTaiTroId, quyId, soTien, hinhThuc, ghiChu, chungTu }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [insertRes] = await connection.execute(
      `INSERT INTO khoantaitro (
         nhataitro_id, quy_id, sotien, hinhthuc, ngaytaitro, trangthai, ghichu, chungtu
       ) VALUES (?, ?, ?, ?, CURRENT_DATE, 'Cho duyet', ?, ?)`,
      [nhaTaiTroId, quyId, soTien, hinhThuc || 'Tien mat', ghiChu || null, chungTu || null]
    );
    const khoanTaiTroId = insertRes.insertId;

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
      kt.khoantaitro_id,
      kt.nhataitro_id,
      kt.quy_id,
      kt.sotien,
      kt.hinhthuc,
      kt.magiaodich,
      kt.ngaytaitro,
      kt.chungtu,
      kt.trangthai,
      kt.ghichu,
      kt.nguoixacnhan_id,
      kt.ngayxacnhan,
      kt.ngaytao,
      kt.ngaycapnhat,
      ntt.tennhataitro,
      ntt.loainhataitro,
      ntt.email as ntt_email,
      ntt.sodienthoai as ntt_sodienthoai,
      ntt.logo,
      q.tenquy,
      q.loaiquy_id,
      q.sodu as quy_so_du
     FROM khoantaitro kt
     INNER JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     WHERE kt.khoantaitro_id = ?
     LIMIT 1`,
    [khoanTaiTroId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: listDonations
// MỤC ĐÍCH: List khoản tài trợ với filter + phân trang
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
    conds.push(`(ntt.tennhataitro LIKE ? OR q.tenquy LIKE ? OR kt.ghichu LIKE ?)`);
    const like = `%${keyword}%`;
    params.push(like, like, like);
  }
  if (quy_id) { conds.push(`kt.quy_id = ?`); params.push(quy_id); }
  if (loai_ntt) { conds.push(`ntt.loainhataitro = ?`); params.push(loai_ntt); }
  if (trang_thai) { conds.push(`kt.trangthai = ?`); params.push(trang_thai); }
  if (tu_ngay) { conds.push(`kt.ngaytaitro >= ?`); params.push(tu_ngay); }
  if (den_ngay) { conds.push(`kt.ngaytaitro <= ?`); params.push(den_ngay); }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const offset = (page - 1) * page_size;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM khoantaitro kt
     INNER JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT
        kt.khoantaitro_id,
        kt.nhataitro_id,
        kt.quy_id,
        kt.sotien,
        kt.hinhthuc,
        kt.ngaytaitro,
        kt.trangthai,
        kt.ghichu,
        ntt.tennhataitro,
        ntt.loainhataitro,
        ntt.logo,
        ntt.email,
        ntt.sodienthoai,
        q.tenquy,
        q.loaiquy_id
     FROM khoantaitro kt
     INNER JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     ${where}
     ORDER BY
        CASE kt.trangthai
          WHEN 'Cho duyet' THEN 1
          WHEN 'Da duyet' THEN 2
          WHEN 'Da nhan' THEN 3
          WHEN 'Tu choi' THEN 4
        END,
        kt.ngaytaitro DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(page_size), offset]
  );

  return { rows, total: Number(total) || 0 };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonationStatsForKeToan
// MỤC ĐÍCH: Stats cho trang Khoản tài trợ (Kế toán)
// ─────────────────────────────────────────────────────────────────────────────
const getDonationStatsForKeToan = async () => {
  const [[{ canXacNhan }]] = await pool.query(
    `SELECT COUNT(*) AS canXacNhan FROM khoantaitro WHERE trangthai = 'Da duyet'`
  );
  const [[{ daXacNhanHomNay }]] = await pool.query(
    `SELECT COUNT(*) AS daXacNhanHomNay FROM khoantaitro
     WHERE trangthai = 'Da nhan' AND DATE(ngaycapnhat) = CURDATE()`
  );
  const [[{ tongThangNay }]] = await pool.query(
    `SELECT COALESCE(SUM(sotien),0) AS tongThangNay FROM khoantaitro
     WHERE trangthai = 'Da nhan'
       AND MONTH(ngaycapnhat) = MONTH(CURRENT_DATE())
       AND YEAR(ngaycapnhat) = YEAR(CURRENT_DATE())`
  );
  const [[{ choCanBo }]] = await pool.query(
    `SELECT COUNT(*) AS choCanBo FROM khoantaitro WHERE trangthai = 'Cho duyet'`
  );
  const [[{ tongKhoanTaiTro }]] = await pool.query(
    `SELECT COUNT(*) AS tongKhoanTaiTro FROM khoantaitro WHERE trangthai = 'Da nhan'`
  );
  return {
    canXacNhan: Number(canXacNhan) || 0,
    daXacNhanHomNay: Number(daXacNhanHomNay) || 0,
    tongThangNay: Number(tongThangNay) || 0,
    choCanBo: Number(choCanBo) || 0,
    tongKhoanTaiTro: Number(tongKhoanTaiTro) || 0,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: approveDonation
// MỤC ĐÍCH: Kế toán duyệt khoản tài trợ (Cho duyet → Da duyet)
// ─────────────────────────────────────────────────────────────────────────────
const approveDonation = async (khoanTaiTroId, nguoiDuyetId, { ghiChu, chungTu } = {}) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Đổi trạng thái: 'Cho duyet' → 'Da duyet'
    const [updateResult] = await connection.execute(
      `UPDATE khoantaitro
       SET trangthai = 'Da duyet',
           ghichu = COALESCE(?, ghichu),
           chungtu = COALESCE(?, chungtu),
           ngaycapnhat = CURRENT_TIMESTAMP
       WHERE khoantaitro_id = ?
       AND trangthai = 'Cho duyet'`,
      [ghiChu, chungTu, khoanTaiTroId]
    );

    if (updateResult.affectedRows === 0) {
      throw new Error('DONATION_NOT_FOUND_OR_ALREADY_APPROVED');
    }

    // Lấy thông tin khoản tài trợ
    const [donations] = await connection.query(
      `SELECT quy_id, sotien, nhataitro_id
       FROM khoantaitro
       WHERE khoantaitro_id = ?`,
      [khoanTaiTroId]
    );
    const donation = donations[0];

    // Cộng tiền vào quỹ
    await connection.execute(
      `UPDATE quy
       SET sodu = sodu + ?,
           ngaycapnhat = CURRENT_TIMESTAMP
       WHERE quy_id = ?`,
      [donation.sotien, donation.quy_id]
    );

    // Tạo giao dịch THU (từ khoản tài trợ vào quỹ)
    // LƯU Ý: yeucauhotro_id = NULL (không phải giải ngân cho sinh viên)
    //        nguoinhan_id = NULL (không có người nhận cụ thể)
    await connection.execute(
      `INSERT INTO giaodich (
        yeucauhotro_id, quy_id, nguoinhan_id, sotien, hinhthuc, trangthai, 
        chungtu, ghichu, nguoithuchien_id, ngaygiaodich
      ) VALUES (NULL, ?, NULL, ?, 'Chuyen khoan', 'Thanh cong', ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        donation.quy_id,
        donation.sotien,
        chungTu || null,
        ghiChu || `Duyệt khoản tài trợ #${khoanTaiTroId}`,
        nguoiDuyetId
      ]
    );

    await connection.commit();

    return {
      success: true,
      khoanTaiTroId,
      quyId: donation.quy_id,
      soTien: donation.sotien
    };
  } catch (error) {
    await connection.rollback();
    console.error('Error in approveDonation:', error);
    console.error('Stack:', error.stack);
    throw error;
  } finally {
    connection.release();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectDonation
// MỤC ĐÍCH: Từ chối khoản tài trợ (Cho duyet → Tu choi)
// ─────────────────────────────────────────────────────────────────────────────
const rejectDonation = async (khoanTaiTroId, lyDo, nguoiDuyetId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE khoantaitro
       SET trangthai = 'Tu choi',
           ghichu = ?,
           ngaycapnhat = CURRENT_TIMESTAMP
       WHERE khoantaitro_id = ?
       AND trangthai = 'Cho duyet'`,
      [lyDo, khoanTaiTroId]
    );

    if (result.affectedRows === 0) {
      throw new Error('DONATION_NOT_FOUND_OR_ALREADY_PROCESSED');
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

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: confirmDonation
// MỤC ĐÍCH: Admin xác nhận cuối cùng (Da duyet → Da nhan)
// ─────────────────────────────────────────────────────────────────────────────
const confirmDonation = async (khoanTaiTroId, nguoiXacNhanId, { ghiChu } = {}) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Đổi trạng thái: 'Da duyet' → 'Da nhan'
    const [result] = await connection.execute(
      `UPDATE khoantaitro
       SET trangthai = 'Da nhan',
           nguoixacnhan_id = ?,
           ngayxacnhan = CURRENT_TIMESTAMP,
           ghichu = COALESCE(?, ghichu),
           ngaycapnhat = CURRENT_TIMESTAMP
       WHERE khoantaitro_id = ?
       AND trangthai = 'Da duyet'`,
      [nguoiXacNhanId, ghiChu, khoanTaiTroId]
    );

    if (result.affectedRows === 0) {
      throw new Error('DONATION_NOT_FOUND_OR_ALREADY_CONFIRMED');
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

const getPheDuyetByKhoanTaiTro = async (khoanTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT 
      kt.khoantaitro_id AS phe_duyet_id,
      1 AS cap_do_duyet,
      kt.trangthai AS ket_qua,
      kt.ghichu AS ghi_chu,
      CASE WHEN kt.trangthai = 'Tu choi' THEN kt.ghichu ELSE NULL END AS ly_do_tu_choi,
      kt.ngaytao AS ngay_tao,
      kt.ngayxacnhan AS ngay_duyet,
      kt.nguoixacnhan_id AS nguoi_duyet_id,
      nd.hoten AS nguoi_duyet_ten,
      nd.avatar AS nguoi_duyet_avatar,
      vt.tenvaitro AS nguoi_duyet_vai_tro
     FROM khoantaitro kt
     LEFT JOIN nguoidung nd ON kt.nguoixacnhan_id = nd.nguoidung_id
     LEFT JOIN vaitro vt ON nd.vaitro_id = vt.vaitro_id
     WHERE kt.khoantaitro_id = ? AND kt.nguoixacnhan_id IS NOT NULL`,
    [khoanTaiTroId]
  );
  return rows;
};

export default {
  createPublicDonation,
  createStaffDonation,
  getDonationById,
  listDonations,
  getDonationStatsForKeToan,
  approveDonation,
  rejectDonation,
  confirmDonation,
  getPheDuyetByKhoanTaiTro,
};

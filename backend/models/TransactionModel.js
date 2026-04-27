import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── TRANSACTION MODEL ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createTransaction
// MỤC ĐÍCH: Tạo giao dịch mới trong bảng GiaoDich
// ─────────────────────────────────────────────────────────────────────────────
const createTransaction = async (transactionData, connection = null) => {
  const {
    quyId,
    khoanTaiTroId,
    requestId,
    nguoiTaoId,
    loai,
    soTien,
    trangThai,
    minhChungChuyenKhoan,
    ghiChu
  } = transactionData;

  // Nếu có connection được truyền vào (từ transaction) → Dùng connection đó
  // Nếu không → Dùng pool.execute (query độc lập)
  const executor = connection || pool;

  const [result] = await executor.execute(
    `INSERT INTO GiaoDich (
      quy_id,
      khoan_tai_tro_id,
      request_id,
      nguoi_tao_id,
      loai,
      so_tien,
      trang_thai,
      minh_chung_chuyen_khoan,
      ghi_chu
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      quyId,
      khoanTaiTroId || null,
      requestId || null,
      nguoiTaoId || null,
      loai,
      soTien,
      trangThai || 'Cho xu ly',
      minhChungChuyenKhoan || null,
      ghiChu || null
    ]
  );

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionById
// MỤC ĐÍCH: Lấy thông tin giao dịch theo ID
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionById = async (transactionId) => {
  const [rows] = await pool.query(
    `SELECT 
      gd.transaction_id,
      gd.quy_id,
      gd.khoan_tai_tro_id,
      gd.request_id,
      gd.nguoi_tao_id,
      gd.loai,
      gd.so_tien,
      gd.trang_thai,
      gd.minh_chung_chuyen_khoan,
      gd.ghi_chu,
      gd.ngay_giao_dich,
      gd.ngay_cap_nhat,
      q.ten_quy,
      q.loai_quy
     FROM GiaoDich gd
     INNER JOIN Quy q ON gd.quy_id = q.quy_id
     WHERE gd.transaction_id = ?
     LIMIT 1`,
    [transactionId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionsByFund
// MỤC ĐÍCH: Lấy danh sách giao dịch theo quỹ
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionsByFund = async (quyId, limit = 50, offset = 0) => {
  const [rows] = await pool.query(
    `SELECT 
      gd.transaction_id,
      gd.quy_id,
      gd.khoan_tai_tro_id,
      gd.request_id,
      gd.nguoi_tao_id,
      gd.loai,
      gd.so_tien,
      gd.trang_thai,
      gd.minh_chung_chuyen_khoan,
      gd.ghi_chu,
      gd.ngay_giao_dich,
      gd.ngay_cap_nhat
     FROM GiaoDich gd
     WHERE gd.quy_id = ?
     ORDER BY gd.ngay_giao_dich DESC
     LIMIT ? OFFSET ?`,
    [quyId, limit, offset]
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionsByDonation
// MỤC ĐÍCH: Lấy giao dịch theo khoản tài trợ
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionsByDonation = async (khoanTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT 
      gd.transaction_id,
      gd.quy_id,
      gd.khoan_tai_tro_id,
      gd.nguoi_tao_id,
      gd.loai,
      gd.so_tien,
      gd.trang_thai,
      gd.minh_chung_chuyen_khoan,
      gd.ghi_chu,
      gd.ngay_giao_dich,
      gd.ngay_cap_nhat,
      q.ten_quy
     FROM GiaoDich gd
     INNER JOIN Quy q ON gd.quy_id = q.quy_id
     WHERE gd.khoan_tai_tro_id = ?
     ORDER BY gd.ngay_giao_dich DESC`,
    [khoanTaiTroId]
  );
  return rows;
};

export default {
  createTransaction,
  getTransactionById,
  getTransactionsByFund,
  getTransactionsByDonation
};

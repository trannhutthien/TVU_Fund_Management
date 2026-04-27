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

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAllTransactions
// MỤC ĐÍCH: Lấy tất cả giao dịch với filters và pagination
// ─────────────────────────────────────────────────────────────────────────────
const getAllTransactions = async (filters, limit, offset) => {
  // ─────────────────────────────────────────────────────────────────────────
  // BƯỚC 1: XÂY DỰNG ĐIỀU KIỆN WHERE
  // ─────────────────────────────────────────────────────────────────────────
  let whereConditions = [];
  let queryParams = [];

  // Filter theo loại (Thu/Chi)
  if (filters.loai) {
    whereConditions.push('gd.loai = ?');
    queryParams.push(filters.loai);
  }

  // Filter theo quỹ
  if (filters.quyId) {
    whereConditions.push('gd.quy_id = ?');
    queryParams.push(filters.quyId);
  }

  // Filter theo trạng thái
  if (filters.trangThai) {
    whereConditions.push('gd.trang_thai = ?');
    queryParams.push(filters.trangThai);
  }

  // Filter theo khoảng thời gian
  if (filters.tuNgay) {
    whereConditions.push('DATE(gd.ngay_giao_dich) >= ?');
    queryParams.push(filters.tuNgay);
  }

  if (filters.denNgay) {
    whereConditions.push('DATE(gd.ngay_giao_dich) <= ?');
    queryParams.push(filters.denNgay);
  }

  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';

  // ─────────────────────────────────────────────────────────────────────────
  // BƯỚC 2: ĐẾM TỔNG SỐ BẢN GHI
  // ─────────────────────────────────────────────────────────────────────────
  const countQuery = `
    SELECT COUNT(*) as total
    FROM GiaoDich gd
    ${whereClause}
  `;

  const [countResult] = await pool.query(countQuery, queryParams);
  const total = countResult[0].total;

  // ─────────────────────────────────────────────────────────────────────────
  // BƯỚC 3: LẤY DANH SÁCH GIAO DỊCH VỚI JOIN
  // ─────────────────────────────────────────────────────────────────────────
  // JOIN với:
  // - Quy: Lấy tên quỹ
  // - KhoanTaiTro + NhaTaiTro: Nếu là Thu, lấy thông tin nhà tài trợ
  // - NguoiDung: Lấy tên người tạo giao dịch (người duyệt)
  const dataQuery = `
    SELECT 
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
      q.loai_quy,
      kt.so_tien as khoan_tai_tro_so_tien,
      ntt.ten_nha_tai_tro,
      ntt.email as nha_tai_tro_email,
      nd.ho_ten as nguoi_tao_ho_ten,
      nd.email as nguoi_tao_email
    FROM GiaoDich gd
    INNER JOIN Quy q ON gd.quy_id = q.quy_id
    LEFT JOIN KhoanTaiTro kt ON gd.khoan_tai_tro_id = kt.khoan_tai_tro_id
    LEFT JOIN NhaTaiTro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
    LEFT JOIN NguoiDung nd ON gd.nguoi_tao_id = nd.user_id
    ${whereClause}
    ORDER BY gd.ngay_giao_dich DESC
    LIMIT ? OFFSET ?
  `;

  const [transactions] = await pool.query(
    dataQuery, 
    [...queryParams, limit, offset]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // BƯỚC 4: FORMAT DỮ LIỆU TRẢ VỀ
  // ─────────────────────────────────────────────────────────────────────────
  const formattedTransactions = transactions.map(tx => ({
    transactionId: tx.transaction_id,
    loai: tx.loai,
    soTien: parseFloat(tx.so_tien),
    trangThai: tx.trang_thai,
    quy: {
      id: tx.quy_id,
      tenQuy: tx.ten_quy,
      loaiQuy: tx.loai_quy
    },
    // Thông tin khoản tài trợ (nếu là Thu)
    khoanTaiTro: tx.khoan_tai_tro_id ? {
      id: tx.khoan_tai_tro_id,
      soTien: parseFloat(tx.khoan_tai_tro_so_tien),
      nhaTaiTro: {
        ten: tx.ten_nha_tai_tro,
        email: tx.nha_tai_tro_email
      }
    } : null,
    // Thông tin yêu cầu hỗ trợ (nếu là Chi)
    requestId: tx.request_id,
    // Người tạo giao dịch (người duyệt)
    nguoiTao: tx.nguoi_tao_id ? {
      id: tx.nguoi_tao_id,
      hoTen: tx.nguoi_tao_ho_ten,
      email: tx.nguoi_tao_email
    } : null,
    minhChung: tx.minh_chung_chuyen_khoan,
    ghiChu: tx.ghi_chu,
    ngayGiaoDich: tx.ngay_giao_dich,
    ngayCapNhat: tx.ngay_cap_nhat
  }));

  return {
    transactions: formattedTransactions,
    total
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getTransactionByIdDetailed
// MỤC ĐÍCH: Lấy chi tiết 1 giao dịch với đầy đủ thông tin
// ─────────────────────────────────────────────────────────────────────────────
const getTransactionByIdDetailed = async (transactionId) => {
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
      q.loai_quy,
      q.so_du as quy_so_du,
      kt.so_tien as khoan_tai_tro_so_tien,
      kt.trang_thai as khoan_tai_tro_trang_thai,
      kt.ngay_tai_tro,
      ntt.nha_tai_tro_id,
      ntt.ten_nha_tai_tro,
      ntt.email as nha_tai_tro_email,
      ntt.so_dien_thoai as nha_tai_tro_sdt,
      nd.user_id,
      nd.ho_ten as nguoi_tao_ho_ten,
      nd.email as nguoi_tao_email,
      r.ten_vai_tro as nguoi_tao_vai_tro
    FROM GiaoDich gd
    INNER JOIN Quy q ON gd.quy_id = q.quy_id
    LEFT JOIN KhoanTaiTro kt ON gd.khoan_tai_tro_id = kt.khoan_tai_tro_id
    LEFT JOIN NhaTaiTro ntt ON kt.nha_tai_tro_id = ntt.nha_tai_tro_id
    LEFT JOIN NguoiDung nd ON gd.nguoi_tao_id = nd.user_id
    LEFT JOIN VaiTro r ON nd.role_id = r.role_id
    WHERE gd.transaction_id = ?
    LIMIT 1`,
    [transactionId]
  );

  if (rows.length === 0) {
    return null;
  }

  const tx = rows[0];

  return {
    transactionId: tx.transaction_id,
    loai: tx.loai,
    soTien: parseFloat(tx.so_tien),
    trangThai: tx.trang_thai,
    quy: {
      id: tx.quy_id,
      tenQuy: tx.ten_quy,
      loaiQuy: tx.loai_quy,
      soDu: parseFloat(tx.quy_so_du)
    },
    khoanTaiTro: tx.khoan_tai_tro_id ? {
      id: tx.khoan_tai_tro_id,
      soTien: parseFloat(tx.khoan_tai_tro_so_tien),
      trangThai: tx.khoan_tai_tro_trang_thai,
      ngayTaiTro: tx.ngay_tai_tro,
      nhaTaiTro: {
        id: tx.nha_tai_tro_id,
        ten: tx.ten_nha_tai_tro,
        email: tx.nha_tai_tro_email,
        soDienThoai: tx.nha_tai_tro_sdt
      }
    } : null,
    requestId: tx.request_id,
    nguoiTao: tx.nguoi_tao_id ? {
      id: tx.nguoi_tao_id,
      hoTen: tx.nguoi_tao_ho_ten,
      email: tx.nguoi_tao_email,
      vaiTro: tx.nguoi_tao_vai_tro
    } : null,
    minhChung: tx.minh_chung_chuyen_khoan,
    ghiChu: tx.ghi_chu,
    ngayGiaoDich: tx.ngay_giao_dich,
    ngayCapNhat: tx.ngay_cap_nhat
  };
};

export default {
  createTransaction,
  getTransactionById,
  getTransactionsByFund,
  getTransactionsByDonation,
  getAllTransactions,
  getTransactionByIdDetailed
};

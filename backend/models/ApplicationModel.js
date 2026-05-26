import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── APPLICATION MODEL (YÊU CẦU HỖ TRỢ) ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createApplication
// CÔNG DỤNG: Sinh viên tạo đơn xin hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const createApplication = async (applicationData) => {
  const {
    userId,
    quyId,
    tieuDe,
    moTa,
    soTienYeuCau,
    fileDinhKem
  } = applicationData;

  const [result] = await pool.execute(
    `INSERT INTO yeucauhotro (
      user_id,
      quy_id,
      tieu_de,
      mo_ta,
      so_tien_yeu_cau,
      file_dinh_kem,
      trang_thai
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      quyId,
      tieuDe,
      moTa,
      soTienYeuCau,
      fileDinhKem || null,
      'Cho duyet' // Trạng thái mặc định: Chờ duyệt
    ]
  );

  return {
    requestId: result.insertId,
    userId,
    quyId,
    tieuDe,
    soTienYeuCau,
    trangThai: 'Cho duyet'
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getApplicationById
// CÔNG DỤNG: Lấy thông tin chi tiết 1 đơn xin hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationById = async (requestId) => {
  const [rows] = await pool.query(
    `SELECT 
      yc.request_id,
      yc.user_id,
      yc.quy_id,
      yc.tieu_de,
      yc.mo_ta,
      yc.so_tien_yeu_cau,
      yc.file_dinh_kem,
      yc.trang_thai,
      yc.ly_do_tu_choi,
      yc.ngay_tao,
      yc.ngay_cap_nhat,
      nd.ho_ten as nguoi_nop_ho_ten,
      nd.email as nguoi_nop_email,
      nd.ma_so_dinh_danh,
      q.ten_quy,
      q.loai_quy
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.user_id = nd.user_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     WHERE yc.request_id = ?
     LIMIT 1`,
    [requestId]
  );

  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getApplicationsByUser
// CÔNG DỤNG: Lấy danh sách đơn của 1 sinh viên
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationsByUser = async (userId, limit = 20, offset = 0) => {
  const [rows] = await pool.query(
    `SELECT 
      yc.request_id,
      yc.quy_id,
      yc.tieu_de,
      yc.so_tien_yeu_cau,
      yc.trang_thai,
      yc.ngay_tao,
      q.ten_quy
     FROM yeucauhotro yc
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     WHERE yc.user_id = ?
     ORDER BY yc.ngay_tao DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset]
  );

  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAllApplications
// CÔNG DỤNG: Lấy tất cả đơn xin hỗ trợ (cho Admin/Giáo vụ)
// ─────────────────────────────────────────────────────────────────────────────
const getAllApplications = async (filters, limit, offset) => {
  let whereConditions = [];
  let queryParams = [];

  // Filter theo trạng thái (single value hoặc array)
  if (filters.trangThai) {
    if (Array.isArray(filters.trangThai) && filters.trangThai.length > 0) {
      const placeholders = filters.trangThai.map(() => '?').join(',');
      whereConditions.push(`yc.trang_thai IN (${placeholders})`);
      queryParams.push(...filters.trangThai);
    } else if (typeof filters.trangThai === 'string') {
      whereConditions.push('yc.trang_thai = ?');
      queryParams.push(filters.trangThai);
    }
  }

  // Filter theo quỹ
  if (filters.quyId) {
    whereConditions.push('yc.quy_id = ?');
    queryParams.push(filters.quyId);
  }

  // Filter theo user
  if (filters.userId) {
    whereConditions.push('yc.user_id = ?');
    queryParams.push(filters.userId);
  }

  const whereClause = whereConditions.length > 0 
    ? 'WHERE ' + whereConditions.join(' AND ')
    : '';

  // Đếm tổng số bản ghi
  const countQuery = `
    SELECT COUNT(*) as total
    FROM yeucauhotro yc
    ${whereClause}
  `;
  const [countResult] = await pool.query(countQuery, queryParams);
  const total = countResult[0].total;

  // Lấy danh sách
  const dataQuery = `
    SELECT 
      yc.request_id,
      yc.user_id,
      yc.quy_id,
      yc.tieu_de,
      yc.so_tien_yeu_cau,
      yc.trang_thai,
      yc.ngay_tao,
      yc.ngay_cap_nhat,
      nd.ho_ten as nguoi_nop_ho_ten,
      nd.email as nguoi_nop_email,
      nd.ma_so_dinh_danh,
      q.ten_quy,
      q.loai_quy
    FROM yeucauhotro yc
    INNER JOIN nguoidung nd ON yc.user_id = nd.user_id
    INNER JOIN quy q ON yc.quy_id = q.quy_id
    ${whereClause}
    ORDER BY yc.ngay_tao DESC
    LIMIT ? OFFSET ?
  `;

  const [applications] = await pool.query(
    dataQuery,
    [...queryParams, limit, offset]
  );

  return {
    applications,
    total
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateApplicationStatus
// CÔNG DỤNG: Cập nhật trạng thái đơn xin hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const updateApplicationStatus = async (requestId, trangThai, connection = null) => {
  const executor = connection || pool;

  await executor.execute(
    `UPDATE yeucauhotro 
     SET trang_thai = ?,
         ngay_cap_nhat = NOW()
     WHERE request_id = ?`,
    [trangThai, requestId]
  );

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateTuChoi
// CÔNG DỤNG: Cập nhật trạng thái từ chối
// ─────────────────────────────────────────────────────────────────────────────
const updateTuChoi = async (requestId, lyDoTuChoi, connection = null) => {
  const executor = connection || pool;

  await executor.execute(
    `UPDATE yeucauhotro 
     SET trang_thai = 'Tu choi',
         ly_do_tu_choi = ?,
         ngay_cap_nhat = NOW()
     WHERE request_id = ?`,
    [lyDoTuChoi, requestId]
  );

  return true;
};

export default {
  createApplication,
  getApplicationById,
  getApplicationsByUser,
  getAllApplications,
  updateApplicationStatus,
  updateTuChoi
};

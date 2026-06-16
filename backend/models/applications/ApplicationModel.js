import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── APPLICATION MODEL (YÊU CẦU HỖ TRỢ) ───────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createApplication
// CÔNG DỤNG: Sinh viên tạo đơn xin hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const createApplication = async (applicationData) => {
  const {
    nguoiDungId,
    quyId,
    lyDo,
    soTienDeNghi,
    taiLieuDinhKem
  } = applicationData;

  const [result] = await pool.execute(
    `INSERT INTO yeucauhotro (
      nguoidung_id,
      quy_id,
      lydo,
      sotiendenghi,
      tailieudinhkem,
      trangthai
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      nguoiDungId,
      quyId,
      lyDo,
      soTienDeNghi,
      taiLieuDinhKem || null,
      'Cho duyet cap 1' // Trạng thái mặc định: Chờ duyệt cấp 1
    ]
  );

  return {
    yeucauhotroId: result.insertId,
    nguoiDungId,
    quyId,
    soTienDeNghi,
    trangThai: 'Cho duyet cap 1'
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getApplicationById
// CÔNG DỤNG: Lấy thông tin chi tiết 1 đơn xin hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationById = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT 
      yc.yeucauhotro_id,
      yc.nguoidung_id,
      yc.quy_id,
      yc.lydo,
      yc.sotiendenghi,
      yc.tailieudinhkem,
      yc.trangthai,
      yc.ghichu,
      yc.ngaynop,
      yc.ngaycapnhat,
      nd.hoten as nguoi_nop_ho_ten,
      nd.email as nguoi_nop_email,
      nd.masodinhdanh,
      q.tenquy,
      q.loaiquy_id,
      q.sodu as quy_so_du
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     WHERE yc.yeucauhotro_id = ?
     LIMIT 1`,
    [yeucauhotroId]
  );

  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getApplicationsByUser
// CÔNG DỤNG: Lấy danh sách đơn của 1 sinh viên
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationsByUser = async (nguoiDungId, limit = 20, offset = 0) => {
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM yeucauhotro
     WHERE nguoidung_id = ?`,
    [nguoiDungId]
  );

  const [rows] = await pool.query(
    `SELECT 
      yc.yeucauhotro_id,
      yc.quy_id,
      yc.lydo,
      yc.sotiendenghi,
      yc.trangthai,
      yc.ngaynop,
      q.tenquy
     FROM yeucauhotro yc
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     WHERE yc.nguoidung_id = ?
     ORDER BY yc.ngaynop DESC
     LIMIT ? OFFSET ?`,
    [nguoiDungId, limit, offset]
  );

  return {
    applications: rows,
    total: Number(total) || 0
  };
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
      whereConditions.push(`yc.trangthai IN (${placeholders})`);
      queryParams.push(...filters.trangThai);
    } else if (typeof filters.trangThai === 'string') {
      whereConditions.push('yc.trangthai = ?');
      queryParams.push(filters.trangThai);
    }
  }

  // Filter theo quỹ
  if (filters.quyId) {
    whereConditions.push('yc.quy_id = ?');
    queryParams.push(filters.quyId);
  }

  // Filter theo user
  if (filters.nguoiDungId) {
    whereConditions.push('yc.nguoidung_id = ?');
    queryParams.push(filters.nguoiDungId);
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
      yc.yeucauhotro_id,
      yc.nguoidung_id,
      yc.quy_id,
      yc.lydo,
      yc.sotiendenghi,
      yc.trangthai,
      yc.ngaynop,
      yc.ngaycapnhat,
      nd.hoten as nguoi_nop_ho_ten,
      nd.email as nguoi_nop_email,
      nd.masodinhdanh,
      q.tenquy,
      q.loaiquy_id,
      q.sodu as quy_so_du
    FROM yeucauhotro yc
    INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
    INNER JOIN quy q ON yc.quy_id = q.quy_id
    ${whereClause}
    ORDER BY yc.ngaynop DESC
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
const updateApplicationStatus = async (yeucauhotroId, trangThai, connection = null) => {
  const executor = connection || pool;

  await executor.execute(
    `UPDATE yeucauhotro 
     SET trangthai = ?,
         ngaycapnhat = NOW()
     WHERE yeucauhotro_id = ?`,
    [trangThai, yeucauhotroId]
  );

  // TỰ ĐỘNG THÊM SINH VIÊN NỔI BẬT KHI ĐÃ GIẢI NGÂN THÀNH CÔNG
  if (trangThai === 'Da giai ngan') {
    try {
      // 1. Lấy thông tin nguoidung_id và ngành học/khoa từ yeucauhotro và nguoidung
      const [appRows] = await executor.execute(
        `SELECT yc.nguoidung_id, nd.hoten, dv.tenkhoa AS khoaphong 
         FROM yeucauhotro yc
         INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
         LEFT JOIN donvihoc dv ON nd.donvihoc_id = dv.donvihoc_id
         WHERE yc.yeucauhotro_id = ?`,
        [yeucauhotroId]
      );

      if (appRows.length > 0) {
        const { nguoidung_id, hoten, khoaphong } = appRows[0];

        // 2. Kiểm tra xem sinh viên này đã có trong sinhviennoibat chưa
        const [existing] = await executor.execute(
          `SELECT sinhviennoibat_id FROM sinhviennoibat WHERE nguoidung_id = ? LIMIT 1`,
          [nguoidung_id]
        );

        if (existing.length === 0) {
          // 3. Tự động thêm vào sinhviennoibat
          const namHocHienTai = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
          await executor.execute(
            `INSERT INTO sinhviennoibat (
              nguoidung_id,
              hoten,
              khoaphong,
              namhoc,
              thanhtich,
              trangthai
            ) VALUES (?, ?, ?, ?, ?, 'Hien thi')`,
            [
              nguoidung_id,
              hoten,
              khoaphong || 'Sinh viên được hỗ trợ',
              namHocHienTai,
              'Nhận hỗ trợ từ TVU Fund và đạt thành tích tốt trong học tập.'
            ]
          );
          console.log(`[Auto-Showcase] Đã tự động thêm sinh viên nổi bật: ${hoten} (User ID ${nguoidung_id})`);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tự động thêm sinh viên nổi bật:", err);
      // Bắt lỗi để không phá vỡ transaction chính của việc giải ngân đơn
    }
  }

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateTuChoi
// CÔNG DỤNG: Cập nhật trạng thái từ chối
// ─────────────────────────────────────────────────────────────────────────────
const updateTuChoi = async (yeucauhotroId, status, ghiChu, connection = null) => {
  const executor = connection || pool;

  await executor.execute(
    `UPDATE yeucauhotro 
     SET trangthai = ?,
         ghichu = ?,
         ngaycapnhat = NOW()
     WHERE yeucauhotro_id = ?`,
    [status, ghiChu, yeucauhotroId]
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

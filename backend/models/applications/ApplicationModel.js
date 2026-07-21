import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── HELPER: Xác định cần nghiệm thu theo Điều 15 Điều lệ ───────────────────
// ═══════════════════════════════════════════════════════════════════════════════
const determineCangNghiemThu = (loaiHoTro, laDeTai) => {
  // Mục b,c Điều 15: Đề tài/dự án nghiên cứu → luôn cần nghiệm thu
  if (laDeTai === 1) return 1;
  // Mục d,e Điều 15: Cho vay hoặc Tài trợ có thu hồi → luôn cần nghiệm thu
  if (loaiHoTro === 'Cho vay' || loaiHoTro === 'Tai tro co thu hoi') return 1;
  // Mục a: Hỗ trợ thường (học bổng, CSVC, sự kiện) → không cần nghiệm thu
  return 0;
};

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
    taiLieuDinhKem,
    dotId,
    loaiHoTro,
    tongKinhPhiDuAn,
    danhNghia,
    tenDaiDien,
    laDeTai
  } = applicationData;

  const [result] = await pool.execute(
    `INSERT INTO yeucauhotro (
      nguoidung_id,
      quy_id,
      dot_id,
      lydo,
      sotiendenghi,
      tailieudinhkem,
      trangthai,
      loaihotro,
      canghiemthu,
      laidetac,
      tongkinhphidudan,
      danhnghia,
      tendaidien
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nguoiDungId,
      quyId,
      dotId || null,
      lyDo,
      soTienDeNghi,
      taiLieuDinhKem || null,
      'Cho duyet cap 1',
      loaiHoTro || 'Tai tro khong hoan lai',
      determineCangNghiemThu(loaiHoTro, laDeTai),
      laDeTai || 0,
      tongKinhPhiDuAn || null,
      danhNghia || null,
      tenDaiDien || null
    ]
  );

  return {
    yeucauhotroId: result.insertId,
    nguoiDungId,
    quyId,
    dotId: dotId || null,
    soTienDeNghi,
    loaiHoTro: loaiHoTro || 'Tai tro khong hoan lai',
    canghiemthu: determineCangNghiemThu(loaiHoTro, laDeTai),
    laDeTai: laDeTai || 0,
    tongKinhPhiDuAn: tongKinhPhiDuAn || null,
    danhNghia: danhNghia || null,
    tenDaiDien: tenDaiDien || null,
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
      yc.loaihotro,
      yc.canghiemthu,
      yc.tongkinhphidudan,
      yc.danhnghia,
      yc.tendaidien,
      yc.laidetac,
      yc.ghichu,
      yc.ngaynop,
      yc.ngaycapnhat,
      nd.hoten as nguoi_nop_ho_ten,
      nd.email as nguoi_nop_email,
      nd.masodinhdanh,
      q.tenquy,
      q.loaiquy_id,
      q.sodu as quy_so_du,
      dkh.dieukhoanthuhoi_id,
      dkh.mucthuhoi as dkh_mucthuhoi,
      dkh.laisuat as dkh_laisuat,
      dkh.thoihanhoantra_thang as dkh_thoihanhoantra_thang,
      dkh.soquyetdinh_hopdong as dkh_soquyetdinh_hopdong,
      dkh.filehopdong as dkh_filehopdong,
      hd.hopdongvayvon_id,
      hd.sotienvon as hd_sotienvon,
      hd.laisuatphantram as hd_laisuatphantram,
      hd.ngaykyhopdong as hd_ngaykyhopdong,
      hd.kyhandothang as hd_kyhandothang,
      hd.ngaydaohan as hd_ngaydaohan,
      hd.trangthai as hd_trangthai,
      hd.filehopdong as hd_filehopdong,
      hd.nguoiduyet_id as hd_nguoiduyet_id,
      hd.ghichu as hd_ghichu
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     LEFT JOIN dieukhoanthuhoi dkh ON yc.yeucauhotro_id = dkh.yeucauhotro_id
     LEFT JOIN hopdongvayvon hd ON yc.yeucauhotro_id = hd.yeucauhotro_id
     WHERE yc.yeucauhotro_id = ?
     LIMIT 1`,
    [yeucauhotroId]
  );

  if (!rows[0]) return null;

  const row = rows[0];
  // Gộp dieukhoanthuhoi thành object con (null nếu không có)
  row.dieukhoanthuhoi = row.dieukhoanthuhoi_id ? {
    dieukhoanthuhoi_id: row.dieukhoanthuhoi_id,
    mucthuhoi: row.dkh_mucthuhoi,
    laisuat: row.dkh_laisuat,
    thoihanhoantra_thang: row.dkh_thoihanhoantra_thang,
    soquyetdinh_hopdong: row.dkh_soquyetdinh_hopdong,
    filehopdong: row.dkh_filehopdong
  } : null;

  // Gộp hopdongvayvon thành object con (null nếu không có)
  row.hopdongvayvon = row.hopdongvayvon_id ? {
    hopdongvayvon_id: row.hopdongvayvon_id,
    sotienvon: row.hd_sotienvon,
    laisuatphantram: row.hd_laisuatphantram,
    ngaykyhopdong: row.hd_ngaykyhopdong,
    kyhandothang: row.hd_kyhandothang,
    ngaydaohan: row.hd_ngaydaohan,
    trangthai: row.hd_trangthai,
    filehopdong: row.hd_filehopdong,
    nguoiduyet_id: row.hd_nguoiduyet_id,
    ghichu: row.hd_ghichu
  } : null;

  // Xóa các field prefix thừa
  for (const key of Object.keys(row)) {
    if (key.startsWith('dkh_') || key.startsWith('hd_')) {
      delete row[key];
    }
  }

  return row;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getApplicationsByUser
// CÔNG DỤNG: Lấy danh sách đơn của 1 sinh viên
// ─────────────────────────────────────────────────────────────────────────────
const getApplicationsByUser = async (nguoiDungId, limit = 20, offset = 0) => {
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

  return rows;
};

const countApplicationsByUser = async (nguoiDungId) => {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM yeucauhotro
     WHERE nguoidung_id = ?`,
    [nguoiDungId]
  );

  return Number(rows[0]?.total || 0);
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
      yc.loaihotro,
      yc.canghiemthu,
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
      // 1. Lấy thông tin nguoidung_id từ yeucauhotro và nguoidung
      const [appRows] = await executor.execute(
        `SELECT yc.nguoidung_id 
         FROM yeucauhotro yc
         WHERE yc.yeucauhotro_id = ?`,
        [yeucauhotroId]
      );

      if (appRows.length > 0) {
        const { nguoidung_id } = appRows[0];

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
              namhoc,
              thanhtich,
              trangthai
            ) VALUES (?, ?, ?, 'Hien thi')`,
            [
              nguoidung_id,
              namHocHienTai,
              'Nhận hỗ trợ từ TVU Fund và đạt thành tích tốt trong học tập.'
            ]
          );
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
  countApplicationsByUser,
  getAllApplications,
  updateApplicationStatus,
  updateTuChoi,
  determineCangNghiemThu
};

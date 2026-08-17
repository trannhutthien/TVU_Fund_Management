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
    tieuDe,
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
      tieu_de,
      dot_id,
      lydo,
      sotiendenghi,
      tailieudinhkem,
      trangthai,
      loaihotro,
      canghiemthu,
      tongkinhphidudan,
      danhnghia,
      tendaidien
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nguoiDungId,
      quyId,
      tieuDe || null,
      dotId || null,
      lyDo,
      soTienDeNghi,
      taiLieuDinhKem || null,
      'Cho duyet cap 1',
      loaiHoTro || 'Tai tro khong hoan lai',
      determineCangNghiemThu(loaiHoTro, laDeTai),
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
      yc.dot_id,
      yc.tieu_de,
      yc.lydo,
      yc.sotiendenghi,
      yc.tailieudinhkem,
      yc.trangthai,
      yc.loaihotro,
      yc.canghiemthu,
      yc.tongkinhphidudan,
      yc.danhnghia,
      yc.tendaidien,
      yc.ghichu,
      yc.ngaynop,
      yc.ngaycapnhat,
      nd.hoten as nguoi_nop_ho_ten,
      nd.email as nguoi_nop_email,
      nd.masodinhdanh,
      nd.sodienthoai as nguoi_nop_sodienthoai,
      nd.donvicongtac,
      nd.tinhtrangcongtac,
      v.tenvaitro as nguoi_nop_vaitro,
      nd.loaitaikhoan as nguoi_nop_loaitaikhoan,
      dh.tenkhoa as nguoi_nop_khoa,
      nd.lop as nguoi_nop_lop,
      q.tenquy,
      q.loaiquy_id,
      q.sodu as quy_so_du,
      dg.tendot as dot_duyet_ten,
      dkh.dieukhoanthuhoi_id,
      dkh.mucthuhoi as dkh_mucthuhoi,
      dkh.laisuat as dkh_laisuat,
      dkh.thoihanhoantra_thang as dkh_thoihanhoantra_thang,
      dkh.soquyetdinh_hopdong as dkh_soquyetdinh_hopdong,
      dkh.filehopdong as dkh_filehopdong,
      hd.hopdongvayvon_id,
      hd.sotienvon as hd_sotienvon,
      hd.sotien_dot1 as hd_sotien_dot1,
      hd.sotien_dot2 as hd_sotien_dot2,
      hd.ngay_giai_ngan_dot1 as hd_ngay_giai_ngan_dot1,
      hd.ngay_giai_ngan_dot2 as hd_ngay_giai_ngan_dot2,
      hd.lan_nghiem_thu_dat as hd_lan_nghiem_thu_dat,
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
     LEFT JOIN vaitro v ON nd.vaitro_id = v.vaitro_id
     LEFT JOIN donvihoc dh ON nd.donvihoc_id = dh.donvihoc_id
     INNER JOIN quy q ON yc.quy_id = q.quy_id
     LEFT JOIN dotgiaingan dg ON yc.dot_id = dg.dot_id
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
    sotien_dot1: row.hd_sotien_dot1,
    sotien_dot2: row.hd_sotien_dot2,
    ngay_giai_ngan_dot1: row.hd_ngay_giai_ngan_dot1,
    ngay_giai_ngan_dot2: row.hd_ngay_giai_ngan_dot2,
    lan_nghiem_thu_dat: row.hd_lan_nghiem_thu_dat,
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
      yc.tieu_de,
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
      yc.dot_id,
      yc.tieu_de,
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
      nd.sodienthoai as nguoi_nop_sodienthoai,
      nd.donvicongtac,
      nd.tinhtrangcongtac,
      v.tenvaitro as nguoi_nop_vaitro,
      nd.loaitaikhoan as nguoi_nop_loaitaikhoan,
      dh.tenkhoa as nguoi_nop_khoa,
      nd.lop as nguoi_nop_lop,
      q.tenquy,
      q.loaiquy_id,
      q.sodu as quy_so_du,
      dg.tendot as dot_duyet_ten
    FROM yeucauhotro yc
    INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
    LEFT JOIN vaitro v ON nd.vaitro_id = v.vaitro_id
    LEFT JOIN donvihoc dh ON nd.donvihoc_id = dh.donvihoc_id
    INNER JOIN quy q ON yc.quy_id = q.quy_id
    LEFT JOIN dotgiaingan dg ON yc.dot_id = dg.dot_id
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
  // REMOVED: Tự động thêm sinh viên nổi bật - Feature không còn sử dụng
  // if (trangThai === 'Da giai ngan') {
  //   try {
  //     const [appRows] = await executor.execute(...);
  //     // Code đã bị xóa
  //   } catch (err) {
  //     console.error("Lỗi khi tự động thêm sinh viên nổi bật:", err);
  //   }
  // }

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

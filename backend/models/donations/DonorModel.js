import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONOR MODEL (CHO API ADMIN/GIÁO VỤ) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: checkNguoiDungIdExists
// MỤC ĐÍCH: Kiểm tra nguoidung_id đã tồn tại trong bảng nhataitro chưa
// ─────────────────────────────────────────────────────────────────────────────
const checkNguoiDungIdExists = async (nguoiDungId) => {
  if (!nguoiDungId) return false;
  
  const [rows] = await pool.query(
    `SELECT nhataitro_id FROM nhataitro WHERE nguoidung_id = ? LIMIT 1`,
    [nguoiDungId]
  );
  return rows.length > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createDonor
// MỤC ĐÍCH: Tạo nhà tài trợ mới trong bảng nhataitro (CHO API ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
const createDonor = async (donorData) => {
  const {
    nguoiDungId,
    tenNhaTaiTro,
    loaiNhaTaiTro,
    email,
    soDienThoai,
    diaChi,
    website,
    moTa,
    logo
  } = donorData;

  const [result] = await pool.execute(
    `INSERT INTO nhataitro (
      nguoidung_id,
      tennhataitro,
      loainhataitro,
      email,
      sodienthoai,
      diachi,
      website,
      mota,
      logo,
      trangthai
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Hoat dong')`,
    [
      nguoiDungId || null,
      tenNhaTaiTro,
      loaiNhaTaiTro || 'Ca nhan',
      email || null,
      soDienThoai || null,
      diaChi || null,
      website || null,
      moTa || null,
      logo || null
    ]
  );

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonorById
// MỤC ĐÍCH: Lấy thông tin chi tiết nhà tài trợ theo ID
// ─────────────────────────────────────────────────────────────────────────────
const getDonorById = async (nhaTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT 
      nt.nhataitro_id,
      nt.nguoidung_id,
      nt.tennhataitro,
      nt.loainhataitro,
      COALESCE(nt.email, nd.email) AS email,
      COALESCE(nt.sodienthoai, nd.sodienthoai) AS sodienthoai,
      COALESCE(nt.diachi, nd.diachi) AS diachi,
      nt.website,
      nt.mota,
      nt.logo,
      nt.trangthai,
      nt.ngaytao,
      nt.ngaycapnhat,
      nd.hoten,
      nd.email as nd_email,
      nd.sodienthoai as nd_sodienthoai,
      nd.diachi as nd_diachi,
      COALESCE(nt.logo, nd.avatar) AS avatar
     FROM nhataitro nt
     LEFT JOIN nguoidung nd ON nt.nguoidung_id = nd.nguoidung_id
     WHERE nt.nhataitro_id = ?
     LIMIT 1`,
    [nhaTaiTroId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAllDonors
// MỤC ĐÍCH: Lấy danh sách tất cả nhà tài trợ
// ─────────────────────────────────────────────────────────────────────────────
const getAllDonors = async () => {
  const [rows] = await pool.query(
    `SELECT
      nt.nhataitro_id,
      nt.nguoidung_id,
      nt.tennhataitro,
      nt.loainhataitro,
      COALESCE(nt.email, nd.email) AS email,
      COALESCE(nt.sodienthoai, nd.sodienthoai) AS sodienthoai,
      COALESCE(nt.diachi, nd.diachi) AS diachi,
      nt.website,
      nt.mota,
      nt.logo,
      nt.trangthai,
      nt.ngaytao,
      nd.hoten,
      COALESCE(nt.logo, nd.avatar) AS avatar
     FROM nhataitro nt
     LEFT JOIN nguoidung nd ON nt.nguoidung_id = nd.nguoidung_id
     WHERE nt.trangthai = 'Hoat dong'
     ORDER BY nt.ngaytao DESC`
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getStaffList
// MỤC ĐÍCH: Lấy danh sách nhà tài trợ cho trang Quản lý (Cán bộ Quỹ)
// ─────────────────────────────────────────────────────────────────────────────
const getStaffList = async ({ keyword = '', loai = '', sortBy = 'tong_tai_tro_desc', page = 1, pageSize = 12 }) => {
  const conditions = [];
  const params = [];

  if (keyword) {
    conditions.push(
      `(nt.tennhataitro LIKE ? OR COALESCE(nt.email, nd.email) LIKE ? OR COALESCE(nt.sodienthoai, nd.sodienthoai) LIKE ? OR nd.hoten LIKE ?)`
    );
    const like = `%${keyword}%`;
    params.push(like, like, like, like);
  }
  if (loai) {
    conditions.push(`nt.loainhataitro = ?`);
    params.push(loai);
  }
  
  // Chỉ lấy nhà tài trợ đang hoạt động
  conditions.push(`nt.trangthai = 'Hoat dong'`);

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy;
  switch (sortBy) {
    case 'ngay_tao_desc':
      orderBy = 'nt.ngaytao DESC';
      break;
    case 'gan_nhat_desc':
      orderBy = 'lan_cuoi DESC';
      break;
    case 'ten_asc':
      orderBy = 'nt.tennhataitro ASC';
      break;
    case 'tong_tai_tro_desc':
    default:
      orderBy = 'tong_da_dong_gop DESC';
  }

  // Đếm tổng
  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total
     FROM nhataitro nt
     LEFT JOIN nguoidung nd ON nt.nguoidung_id = nd.nguoidung_id
     ${whereClause}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(
    `SELECT
        nt.nhataitro_id,
        nt.tennhataitro,
        nt.loainhataitro,
        COALESCE(nt.email, nd.email) AS email,
        COALESCE(nt.sodienthoai, nd.sodienthoai) AS sodienthoai,
        COALESCE(nt.diachi, nd.diachi) AS diachi,
        nt.website,
        nt.mota,
        nt.trangthai,
        nt.nguoidung_id,
        nt.logo,
        nt.ngaytao,
        nd.hoten,
        COALESCE(nt.logo, nd.avatar) AS avatar,
        COALESCE(SUM(CASE WHEN kt.trangthai = 'Da nhan' THEN kt.sotien ELSE 0 END), 0) AS tong_da_dong_gop,
        COUNT(kt.khoantaitro_id) AS so_khoan,
        MAX(kt.ngaytaitro) AS lan_cuoi
     FROM nhataitro nt
     LEFT JOIN nguoidung nd ON nt.nguoidung_id = nd.nguoidung_id
     LEFT JOIN khoantaitro kt ON nt.nhataitro_id = kt.nhataitro_id
     ${whereClause}
     GROUP BY nt.nhataitro_id
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return { rows, total };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonorWithStats
// MỤC ĐÍCH: Lấy chi tiết 1 nhà tài trợ + stats
// ─────────────────────────────────────────────────────────────────────────────
const getDonorWithStats = async (nhaTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT
        nt.nhataitro_id,
        nt.nguoidung_id,
        nt.tennhataitro,
        nt.loainhataitro,
        COALESCE(nt.email, nd.email) AS email,
        COALESCE(nt.sodienthoai, nd.sodienthoai) AS sodienthoai,
        COALESCE(nt.diachi, nd.diachi) AS diachi,
        nt.website,
        nt.mota,
        nt.logo,
        nt.trangthai,
        nt.ngaytao,
        nd.hoten,
        COALESCE(nt.logo, nd.avatar) AS avatar,
        COALESCE(SUM(CASE WHEN kt.trangthai = 'Da nhan' THEN kt.sotien ELSE 0 END), 0) AS tong_da_dong_gop,
        COUNT(kt.khoantaitro_id) AS so_khoan,
        MAX(kt.ngaytaitro) AS lan_cuoi
     FROM nhataitro nt
     LEFT JOIN nguoidung nd ON nt.nguoidung_id = nd.nguoidung_id
     LEFT JOIN khoantaitro kt ON nt.nhataitro_id = kt.nhataitro_id
     WHERE nt.nhataitro_id = ?
     GROUP BY nt.nhataitro_id
     LIMIT 1`,
    [nhaTaiTroId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonationHistory
// MỤC ĐÍCH: Lịch sử các khoản tài trợ của 1 nhà tài trợ
// ─────────────────────────────────────────────────────────────────────────────
const getDonationHistory = async (nhaTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT
        kt.khoantaitro_id,
        kt.sotien,
        kt.hinhthuc,
        kt.trangthai,
        kt.ngaytaitro,
        kt.ghichu,
        kt.chungtu,
        q.quy_id,
        q.tenquy
     FROM khoantaitro kt
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     WHERE kt.nhataitro_id = ?
     ORDER BY kt.ngaytaitro DESC`,
    [nhaTaiTroId]
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getStats
// MỤC ĐÍCH: 4 thẻ thống kê trên trang Quản lý Nhà tài trợ
// ─────────────────────────────────────────────────────────────────────────────
const getStats = async () => {
  const [[{ tongNhaTaiTro }]] = await pool.query(
    `SELECT COUNT(*) AS tongNhaTaiTro FROM nhataitro WHERE trangthai = 'Hoat dong'`
  );

  const [[{ tongDaDongGop }]] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS tongDaDongGop
     FROM khoantaitro WHERE trangthai = 'Da nhan'`
  );

  const [[{ thangNay }]] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS thangNay
     FROM khoantaitro
     WHERE trangthai = 'Da nhan'
       AND MONTH(ngaytaitro) = MONTH(CURRENT_DATE())
       AND YEAR(ngaytaitro) = YEAR(CURRENT_DATE())`
  );

  const [[{ choDuyet }]] = await pool.query(
    `SELECT COUNT(*) AS choDuyet FROM khoantaitro
     WHERE trangthai IN ('Cho duyet','Da duyet')`
  );

  return {
    tongNhaTaiTro: Number(tongNhaTaiTro) || 0,
    tongDaDongGop: Number(tongDaDongGop) || 0,
    thangNay: Number(thangNay) || 0,
    choDuyet: Number(choDuyet) || 0,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateDonor
// MỤC ĐÍCH: Cập nhật thông tin nhà tài trợ
// ─────────────────────────────────────────────────────────────────────────────
const updateDonor = async (nhaTaiTroId, donorData) => {
  const {
    tenNhaTaiTro,
    loaiNhaTaiTro,
    email,
    soDienThoai,
    diaChi,
    website,
    moTa,
    logo,
    trangThai
  } = donorData;

  const [result] = await pool.execute(
    `UPDATE nhataitro 
     SET tennhataitro = ?, 
         loainhataitro = ?, 
         email = ?, 
         sodienthoai = ?, 
         diachi = ?, 
         website = ?, 
         mota = ?, 
         logo = ?, 
         trangthai = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE nhataitro_id = ?`,
    [
      tenNhaTaiTro,
      loaiNhaTaiTro,
      email || null,
      soDienThoai || null,
      diaChi || null,
      website || null,
      moTa || null,
      logo || null,
      trangThai || 'Hoat dong',
      nhaTaiTroId
    ]
  );
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateDonorStatus
// MỤC ĐÍCH: Cập nhật trạng thái nhà tài trợ
// ─────────────────────────────────────────────────────────────────────────────
const updateDonorStatus = async (nhaTaiTroId, trangThai) => {
  const [result] = await pool.execute(
    `UPDATE nhataitro 
     SET trangthai = ?, 
         ngaycapnhat = CURRENT_TIMESTAMP 
     WHERE nhataitro_id = ?`,
    [trangThai, nhaTaiTroId]
  );
  return result;
};

// ═══════════════════════════════════════════════════════════════════════════════
// ─── CHO API USER DONOR (Nhà tài trợ xem profile của mình) ────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonorByNguoiDungId
// MỤC ĐÍCH: Lấy thông tin nhà tài trợ theo nguoidung_id
// ─────────────────────────────────────────────────────────────────────────────
const getDonorByNguoiDungId = async (nguoiDungId) => {
  const [rows] = await pool.query(
    `SELECT 
      nt.nhataitro_id,
      nt.nguoidung_id,
      nt.tennhataitro,
      nt.loainhataitro,
      COALESCE(nt.email, nd.email) AS email,
      COALESCE(nt.sodienthoai, nd.sodienthoai) AS sodienthoai,
      COALESCE(nt.diachi, nd.diachi) AS diachi,
      nt.website,
      nt.mota,
      nt.logo,
      nt.trangthai,
      nt.ngaytao,
      nt.ngaycapnhat,
      nd.hoten,
      COALESCE(nt.logo, nd.avatar) AS avatar
     FROM nhataitro nt
     INNER JOIN nguoidung nd ON nt.nguoidung_id = nd.nguoidung_id
     WHERE nt.nguoidung_id = ?
     LIMIT 1`,
    [nguoiDungId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getMyStats
// MỤC ĐÍCH: Thống kê cho nhà tài trợ (tổng đóng góp, số lần, số quỹ, khoản gần nhất)
// ─────────────────────────────────────────────────────────────────────────────
const getMyStats = async (nhaTaiTroId) => {
  // Tổng số tiền đã quyên góp (chỉ tính các khoản đã nhận)
  const [[{ tongSoTien }]] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS tongSoTien
     FROM khoantaitro
     WHERE nhataitro_id = ? AND trangthai = 'Da nhan'`,
    [nhaTaiTroId]
  );

  // Số lần quyên góp (tính cả chờ duyệt, đã duyệt, đã nhận)
  const [[{ soLanQuyenGop }]] = await pool.query(
    `SELECT COUNT(*) AS soLanQuyenGop
     FROM khoantaitro
     WHERE nhataitro_id = ?`,
    [nhaTaiTroId]
  );

  // Số quỹ đã hỗ trợ (distinct quy_id)
  const [[{ soQuyDaHoTro }]] = await pool.query(
    `SELECT COUNT(DISTINCT quy_id) AS soQuyDaHoTro
     FROM khoantaitro
     WHERE nhataitro_id = ? AND trangthai = 'Da nhan'`,
    [nhaTaiTroId]
  );

  // Khoản tài trợ gần nhất
  const [khoanGanNhat] = await pool.query(
    `SELECT 
      kt.khoantaitro_id,
      kt.sotien,
      kt.ngaytaitro,
      kt.trangthai,
      q.quy_id,
      q.tenquy
     FROM khoantaitro kt
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     WHERE kt.nhataitro_id = ?
     ORDER BY kt.ngaytaitro DESC
     LIMIT 1`,
    [nhaTaiTroId]
  );

  return {
    tongSoTien: Number(tongSoTien) || 0,
    soLanQuyenGop: Number(soLanQuyenGop) || 0,
    soQuyDaHoTro: Number(soQuyDaHoTro) || 0,
    khoanTaiTroGanNhat: khoanGanNhat[0] || null
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getMyDonations
// MỤC ĐÍCH: Lấy danh sách các khoản quyên góp của nhà tài trợ (có phân trang)
// ─────────────────────────────────────────────────────────────────────────────
const getMyDonations = async (nhaTaiTroId, { page = 1, pageSize = 10 }) => {
  const offset = (page - 1) * pageSize;

  // Đếm tổng
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total
     FROM khoantaitro
     WHERE nhataitro_id = ?`,
    [nhaTaiTroId]
  );

  // Lấy danh sách
  const [rows] = await pool.query(
    `SELECT 
      kt.khoantaitro_id,
      kt.sotien,
      kt.hinhthuc,
      kt.trangthai,
      kt.ngaytaitro,
      kt.ghichu,
      kt.chungtu,
      kt.nguoixacnhan_id,
      q.quy_id,
      q.tenquy,
      lq.tenloai as loai_quy
     FROM khoantaitro kt
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
     WHERE kt.nhataitro_id = ?
     ORDER BY kt.ngaytaitro DESC
     LIMIT ? OFFSET ?`,
    [nhaTaiTroId, pageSize, offset]
  );

  return {
    rows,
    total: Number(total) || 0
  };
};

export default {
  checkNguoiDungIdExists,
  createDonor,
  getDonorById,
  getAllDonors,
  getStaffList,
  getDonorWithStats,
  getDonationHistory,
  getStats,
  updateDonor,
  updateDonorStatus,
  // Thêm functions mới cho donor user
  getDonorByNguoiDungId,
  getMyStats,
  getMyDonations,
};

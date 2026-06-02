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
      nt.email,
      nt.sodienthoai,
      nt.diachi,
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
      nd.avatar
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
      nt.email,
      nt.sodienthoai,
      nt.diachi,
      nt.website,
      nt.logo,
      nt.trangthai,
      nt.ngaytao,
      nd.hoten,
      nd.avatar
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
      `(nt.tennhataitro LIKE ? OR nt.email LIKE ? OR nt.sodienthoai LIKE ? OR nd.hoten LIKE ?)`
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
        nt.email,
        nt.sodienthoai,
        nt.diachi,
        nt.logo,
        nt.ngaytao,
        nd.hoten,
        nd.avatar,
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
        nt.email,
        nt.sodienthoai,
        nt.diachi,
        nt.website,
        nt.mota,
        nt.logo,
        nt.trangthai,
        nt.ngaytao,
        nd.hoten,
        nd.avatar,
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
};

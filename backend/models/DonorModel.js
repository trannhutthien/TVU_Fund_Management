import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONOR MODEL (CHO API ADMIN/GIÁO VỤ) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Model này phục vụ cho API POST /api/donors (yêu cầu token + quyền)
// Khác với DonationModel phục vụ cho API public

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: checkUserIdExists
// MỤC ĐÍCH: Kiểm tra user_id đã tồn tại trong bảng NhaTaiTro chưa
// ─────────────────────────────────────────────────────────────────────────────
const checkUserIdExists = async (userId) => {
  if (!userId) return false;
  
  const [rows] = await pool.query(
    `SELECT nha_tai_tro_id FROM nhataitro WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows.length > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createDonor
// MỤC ĐÍCH: Tạo nhà tài trợ mới trong bảng NhaTaiTro (CHO API ADMIN)
// ─────────────────────────────────────────────────────────────────────────────
// LƯU Ý:
// - Hàm này KHÔNG SỬ DỤNG TRANSACTION (khác với createPublicDonation)
// - Chỉ INSERT vào bảng NhaTaiTro, không tạo khoản tài trợ
// - user_id phải tồn tại trong bảng nguoidung (FK constraint)
// - Email, SĐT, địa chỉ lấy từ bảng nguoidung qua user_id
const createDonor = async (donorData) => {
  const {
    userId,
    tenNhaTaiTro,
    loai
  } = donorData;

  const [result] = await pool.execute(
    `INSERT INTO nhataitro (
      user_id,
      ten_nha_tai_tro,
      loai
    ) VALUES (?, ?, ?)`,
    [
      userId,
      tenNhaTaiTro,
      loai || 'Ca nhan'
    ]
  );

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonorById
// MỤC ĐÍCH: Lấy thông tin chi tiết nhà tài trợ theo ID (JOIN với nguoidung)
// ─────────────────────────────────────────────────────────────────────────────
const getDonorById = async (nhaTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT 
      nt.nha_tai_tro_id,
      nt.user_id,
      nt.ten_nha_tai_tro,
      nt.loai,
      nt.created_at,
      nd.ho_ten,
      nd.email,
      nd.so_dien_thoai,
      nd.dia_chi,
      nd.avatar
     FROM nhataitro nt
     INNER JOIN nguoidung nd ON nt.user_id = nd.user_id
     WHERE nt.nha_tai_tro_id = ?
     LIMIT 1`,
    [nhaTaiTroId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAllDonors
// MỤC ĐÍCH: Lấy danh sách tất cả nhà tài trợ (JOIN với nguoidung)
// ─────────────────────────────────────────────────────────────────────────────
const getAllDonors = async () => {
  const [rows] = await pool.query(
    `SELECT
      nt.nha_tai_tro_id,
      nt.user_id,
      nt.ten_nha_tai_tro,
      nt.loai,
      nt.created_at,
      nd.ho_ten,
      nd.email,
      nd.so_dien_thoai,
      nd.dia_chi,
      nd.avatar
     FROM nhataitro nt
     INNER JOIN nguoidung nd ON nt.user_id = nd.user_id
     ORDER BY nt.created_at DESC`
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getStaffList
// MỤC ĐÍCH: Lấy danh sách nhà tài trợ cho trang Quản lý (Cán bộ Quỹ)
//   - Hỗ trợ: keyword search, lọc theo loại, sort, phân trang
//   - Trả về tổng đóng góp (chỉ tính khoản 'Da nhan'), số khoản, ngày gần nhất
// ─────────────────────────────────────────────────────────────────────────────
const getStaffList = async ({ keyword = '', loai = '', sortBy = 'tong_tai_tro_desc', page = 1, pageSize = 12 }) => {
  const conditions = [];
  const params = [];

  if (keyword) {
    conditions.push(
      `(nt.ten_nha_tai_tro LIKE ? OR nd.email LIKE ? OR nd.so_dien_thoai LIKE ? OR nd.ho_ten LIKE ?)`
    );
    const like = `%${keyword}%`;
    params.push(like, like, like, like);
  }
  if (loai) {
    conditions.push(`nt.loai = ?`);
    params.push(loai);
  }
  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  let orderBy;
  switch (sortBy) {
    case 'ngay_tao_desc':
      orderBy = 'nt.created_at DESC';
      break;
    case 'gan_nhat_desc':
      orderBy = 'lan_cuoi DESC';
      break;
    case 'ten_asc':
      orderBy = 'nt.ten_nha_tai_tro ASC';
      break;
    case 'tong_tai_tro_desc':
    default:
      orderBy = 'tong_da_dong_gop DESC';
  }

  // Đếm tổng để phân trang
  const [countRows] = await pool.query(
    `SELECT COUNT(*) as total
     FROM nhataitro nt
     INNER JOIN nguoidung nd ON nt.user_id = nd.user_id
     ${whereClause}`,
    params
  );
  const total = countRows[0]?.total || 0;

  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(
    `SELECT
        nt.nha_tai_tro_id,
        nt.ten_nha_tai_tro,
        nt.loai,
        nt.created_at,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.dia_chi,
        nd.avatar,
        COALESCE(SUM(CASE WHEN kt.trang_thai = 'Da nhan' THEN kt.so_tien ELSE 0 END), 0) AS tong_da_dong_gop,
        COUNT(kt.khoan_tai_tro_id) AS so_khoan,
        MAX(kt.ngay_tai_tro) AS lan_cuoi
     FROM nhataitro nt
     INNER JOIN nguoidung nd ON nt.user_id = nd.user_id
     LEFT JOIN khoantaitro kt ON nt.nha_tai_tro_id = kt.nha_tai_tro_id
     ${whereClause}
     GROUP BY nt.nha_tai_tro_id
     ORDER BY ${orderBy}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return { rows, total };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonorWithStats
// MỤC ĐÍCH: Lấy chi tiết 1 nhà tài trợ + tổng đóng góp / số khoản / lần cuối
// ─────────────────────────────────────────────────────────────────────────────
const getDonorWithStats = async (nhaTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT
        nt.nha_tai_tro_id,
        nt.user_id,
        nt.ten_nha_tai_tro,
        nt.loai,
        nt.created_at,
        nd.ho_ten,
        nd.email,
        nd.so_dien_thoai,
        nd.dia_chi,
        nd.avatar,
        COALESCE(SUM(CASE WHEN kt.trang_thai = 'Da nhan' THEN kt.so_tien ELSE 0 END), 0) AS tong_da_dong_gop,
        COUNT(kt.khoan_tai_tro_id) AS so_khoan,
        MAX(kt.ngay_tai_tro) AS lan_cuoi
     FROM nhataitro nt
     INNER JOIN nguoidung nd ON nt.user_id = nd.user_id
     LEFT JOIN khoantaitro kt ON nt.nha_tai_tro_id = kt.nha_tai_tro_id
     WHERE nt.nha_tai_tro_id = ?
     GROUP BY nt.nha_tai_tro_id
     LIMIT 1`,
    [nhaTaiTroId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getDonationHistory
// MỤC ĐÍCH: Lịch sử các khoản tài trợ của 1 nhà tài trợ (JOIN với quy)
// ─────────────────────────────────────────────────────────────────────────────
const getDonationHistory = async (nhaTaiTroId) => {
  const [rows] = await pool.query(
    `SELECT
        kt.khoan_tai_tro_id,
        kt.so_tien,
        kt.trang_thai,
        kt.ngay_tai_tro,
        kt.ghi_chu,
        kt.hinh_anh_minh_chung,
        q.quy_id,
        q.ten_quy
     FROM khoantaitro kt
     INNER JOIN quy q ON kt.quy_id = q.quy_id
     WHERE kt.nha_tai_tro_id = ?
     ORDER BY kt.ngay_tai_tro DESC`,
    [nhaTaiTroId]
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getStats
// MỤC ĐÍCH: 4 thẻ thống kê trên trang Quản lý Nhà tài trợ
//   - tongNhaTaiTro: tổng số nhà tài trợ
//   - tongDaDongGop: tổng tiền đã nhận (Da nhan)
//   - thangNay: tiền đã nhận trong tháng hiện tại
//   - choDuyet: số khoản đang chờ duyệt
// ─────────────────────────────────────────────────────────────────────────────
const getStats = async () => {
  const [[{ tongNhaTaiTro }]] = await pool.query(
    `SELECT COUNT(*) AS tongNhaTaiTro FROM nhataitro`
  );

  const [[{ tongDaDongGop }]] = await pool.query(
    `SELECT COALESCE(SUM(so_tien), 0) AS tongDaDongGop
     FROM khoantaitro WHERE trang_thai = 'Da nhan'`
  );

  const [[{ thangNay }]] = await pool.query(
    `SELECT COALESCE(SUM(so_tien), 0) AS thangNay
     FROM khoantaitro
     WHERE trang_thai = 'Da nhan'
       AND MONTH(ngay_tai_tro) = MONTH(CURRENT_DATE())
       AND YEAR(ngay_tai_tro) = YEAR(CURRENT_DATE())`
  );

  const [[{ choDuyet }]] = await pool.query(
    `SELECT COUNT(*) AS choDuyet FROM khoantaitro
     WHERE trang_thai IN ('Cho duyet','Da duyet')`
  );

  return {
    tongNhaTaiTro: Number(tongNhaTaiTro) || 0,
    tongDaDongGop: Number(tongDaDongGop) || 0,
    thangNay: Number(thangNay) || 0,
    choDuyet: Number(choDuyet) || 0,
  };
};

export default {
  checkUserIdExists,
  createDonor,
  getDonorById,
  getAllDonors,
  getStaffList,
  getDonorWithStats,
  getDonationHistory,
  getStats,
};

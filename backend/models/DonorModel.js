import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── DONOR MODEL (CHO API ADMIN/GIÁO VỤ) ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// Model này phục vụ cho API POST /api/donors (yêu cầu token + quyền)
// Khác với DonationModel phục vụ cho API public

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: checkEmailExists
// MỤC ĐÍCH: Kiểm tra email đã tồn tại trong bảng NhaTaiTro chưa
// ─────────────────────────────────────────────────────────────────────────────
const checkEmailExists = async (email) => {
  if (!email) return false;
  
  const [rows] = await pool.query(
    `SELECT nha_tai_tro_id FROM NhaTaiTro WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows.length > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: checkPhoneExists
// MỤC ĐÍCH: Kiểm tra số điện thoại đã tồn tại trong bảng NhaTaiTro chưa
// ─────────────────────────────────────────────────────────────────────────────
const checkPhoneExists = async (soDienThoai) => {
  if (!soDienThoai) return false;
  
  const [rows] = await pool.query(
    `SELECT nha_tai_tro_id FROM NhaTaiTro WHERE so_dien_thoai = ? LIMIT 1`,
    [soDienThoai]
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
// - Email và SĐT phải unique (đã validate ở controller)
const createDonor = async (donorData) => {
  const {
    tenNhaTaiTro,
    loai,
    email,
    soDienThoai,
    diaChi
  } = donorData;

  const [result] = await pool.execute(
    `INSERT INTO NhaTaiTro (
      ten_nha_tai_tro,
      loai,
      email,
      so_dien_thoai,
      dia_chi
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      tenNhaTaiTro,
      loai || 'Ca nhan',
      email || null,
      soDienThoai || null,
      diaChi || null
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
      nha_tai_tro_id,
      ten_nha_tai_tro,
      loai,
      email,
      so_dien_thoai,
      dia_chi,
      created_at
     FROM NhaTaiTro
     WHERE nha_tai_tro_id = ?
     LIMIT 1`,
    [nhaTaiTroId]
  );
  return rows[0] || null;
};

export default {
  checkEmailExists,
  checkPhoneExists,
  createDonor,
  getDonorById
};

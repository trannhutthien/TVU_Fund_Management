import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NGUOI DUNG MODEL ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// LƯU Ý: Schema database dùng "user_id" là PRIMARY KEY, không phải "id"

// Kiểm tra email đã tồn tại chưa
const checkEmailExists = async (email) => {
  const [rows] = await pool.query(
    "SELECT user_id FROM nguoidung WHERE email = ? LIMIT 1",
    [email]
  );
  return rows.length > 0;
};

// Tạo người dùng mới
const createUser = async (userData) => {
  const {
    hoTen,
    maSoDinhDanh,
    email,
    matKhau,
    roleId,
    loaiTaiKhoan,
    khoaPhong,
    soDienThoai,
    trangThai,
    avatar,
    diaChi
  } = userData;

  const [result] = await pool.query(
    `INSERT INTO nguoidung 
    (ho_ten, ma_so_dinh_danh, email, mat_khau, role_id, loai_tai_khoan, khoa_phong, so_dien_thoai, trang_thai, avatar, dia_chi) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [hoTen, maSoDinhDanh, email, matKhau, roleId, loaiTaiKhoan, khoaPhong, soDienThoai, trangThai, avatar, diaChi]
  );
  return result.insertId;
};

// Tìm người dùng theo email (dùng khi đăng nhập)
// JOIN với bảng vaitro để lấy tên vai trò
const getUserForLogin = async (email) => {
  const [rows] = await pool.query(
    `SELECT 
      nd.user_id, 
      nd.ma_so_dinh_danh, 
      nd.ho_ten, 
      nd.mat_khau, 
      nd.role_id, 
      nd.loai_tai_khoan, 
      nd.trang_thai,
      nd.created_at,
      vt.ten_vai_tro
     FROM nguoidung nd
     LEFT JOIN vaitro vt ON nd.role_id = vt.role_id
     WHERE nd.email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

// Tìm người dùng theo user_id (dùng cho GET /api/auth/me)
// Không SELECT mat_khau vì không cần thiết và bảo mật hơn
// JOIN với bảng vaitro để lấy tên vai trò
const getUserForProfile = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
      nd.user_id, 
      nd.ma_so_dinh_danh, 
      nd.ho_ten, 
      nd.email, 
      nd.avatar, 
      nd.so_dien_thoai, 
      nd.dia_chi, 
      nd.role_id, 
      nd.loai_tai_khoan, 
      nd.khoa_phong, 
      nd.trang_thai,
      nd.created_at,
      vt.ten_vai_tro
     FROM nguoidung nd
     LEFT JOIN vaitro vt ON nd.role_id = vt.role_id
     WHERE nd.user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Lấy mật khẩu hiện tại của user (dùng để verify old password)
const getUserPassword = async (userId) => {
  const [rows] = await pool.query(
    `SELECT mat_khau FROM nguoidung WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Cập nhật mật khẩu người dùng
const updatePassword = async (userId, hashedPassword) => {
  const [result] = await pool.query(
    "UPDATE nguoidung SET mat_khau = ? WHERE user_id = ?",
    [hashedPassword, userId]
  );
  return result;
};

export default { 
  checkEmailExists,
  createUser,
  getUserForLogin, 
  getUserForProfile, 
  getUserPassword, 
  updatePassword 
};

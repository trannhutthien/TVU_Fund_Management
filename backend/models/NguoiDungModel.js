import pool from "../config/db.js";

// Tìm người dùng theo email (dùng khi đăng nhập)
const getUserForLogin = async (email) => {
  const [rows] = await pool.query(
    `SELECT ma_so_dinh_danh, ho_ten, mat_khau, role_id, trang_thai
     FROM nguoidung
     WHERE email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

// Tìm người dùng theo ID (dùng cho GET /api/auth/me)
// Không SELECT mat_khau vì không cần thiết và bảo mật hơn
const getUserForProfile = async (id) => {
  const [rows] = await pool.query(
    `SELECT ma_so_dinh_danh, ho_ten, email, role_id, trang_thai
     FROM nguoidung
     WHERE ma_so_dinh_danh = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// Lấy mật khẩu hiện tại của user (dùng để verify old password)
const getUserPassword = async (id) => {
  const [rows] = await pool.query(
    `SELECT mat_khau FROM nguoidung WHERE ma_so_dinh_danh = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// Cập nhật mật khẩu người dùng
const updatePassword = async (id, hashedPassword) => {
  const [result] = await pool.query(
    "UPDATE nguoidung SET mat_khau = ? WHERE ma_so_dinh_danh = ?",
    [hashedPassword, id]
  );
  return result;
};

export default { getUserForLogin, getUserForProfile, getUserPassword, updatePassword };

import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NGUOI DUNG MODEL ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// LƯU Ý: Schema database dùng "user_id" là PRIMARY KEY, không phải "id"

// Tìm người dùng theo email (dùng khi đăng nhập)
const getUserForLogin = async (email) => {
  const [rows] = await pool.query(
    `SELECT user_id, ma_so_dinh_danh, ho_ten, mat_khau, role_id, trang_thai
     FROM NguoiDung
     WHERE email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] || null;
};

// Tìm người dùng theo user_id (dùng cho GET /api/auth/me)
// Không SELECT mat_khau vì không cần thiết và bảo mật hơn
const getUserForProfile = async (userId) => {
  const [rows] = await pool.query(
    `SELECT user_id, ma_so_dinh_danh, ho_ten, email, role_id, trang_thai
     FROM NguoiDung
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Lấy mật khẩu hiện tại của user (dùng để verify old password)
const getUserPassword = async (userId) => {
  const [rows] = await pool.query(
    `SELECT mat_khau FROM NguoiDung WHERE user_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Cập nhật mật khẩu người dùng
const updatePassword = async (userId, hashedPassword) => {
  const [result] = await pool.query(
    "UPDATE NguoiDung SET mat_khau = ? WHERE user_id = ?",
    [hashedPassword, userId]
  );
  return result;
};

export default { getUserForLogin, getUserForProfile, getUserPassword, updatePassword };

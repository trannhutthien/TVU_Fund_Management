import pool from "../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── BANK ACCOUNT MODEL ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// Lấy tất cả tài khoản ngân hàng của user
const getBankAccountsByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
      tai_khoan_id,
      user_id,
      so_tai_khoan,
      ten_ngan_hang,
      chu_tai_khoan,
      la_mac_dinh,
      created_at
     FROM taikhoannganhang
     WHERE user_id = ?
     ORDER BY la_mac_dinh DESC, created_at DESC`,
    [userId]
  );
  return rows;
};

// Lấy tài khoản ngân hàng theo ID
const getBankAccountById = async (accountId) => {
  const [rows] = await pool.query(
    `SELECT 
      tai_khoan_id,
      user_id,
      so_tai_khoan,
      ten_ngan_hang,
      chu_tai_khoan,
      la_mac_dinh,
      created_at
     FROM taikhoannganhang
     WHERE tai_khoan_id = ?
     LIMIT 1`,
    [accountId]
  );
  return rows[0] || null;
};

// Tạo tài khoản ngân hàng mới
const createBankAccount = async (accountData) => {
  const {
    userId,
    soTaiKhoan,
    tenNganHang,
    chuTaiKhoan,
    laMacDinh
  } = accountData;

  const [result] = await pool.query(
    `INSERT INTO taikhoannganhang 
    (user_id, so_tai_khoan, ten_ngan_hang, chu_tai_khoan, la_mac_dinh) 
    VALUES (?, ?, ?, ?, ?)`,
    [userId, soTaiKhoan, tenNganHang, chuTaiKhoan, laMacDinh ? 1 : 0]
  );
  
  return result.insertId;
};

// Xóa tài khoản ngân hàng
const deleteBankAccount = async (accountId) => {
  const [result] = await pool.query(
    "DELETE FROM taikhoannganhang WHERE tai_khoan_id = ?",
    [accountId]
  );
  return result.affectedRows > 0;
};

// Đặt tài khoản mặc định (bỏ mặc định các tài khoản khác của user)
const setDefaultBankAccount = async (accountId, userId, connection = null) => {
  const conn = connection || pool;
  
  // Bỏ mặc định tất cả tài khoản của user
  await conn.query(
    "UPDATE taikhoannganhang SET la_mac_dinh = 0 WHERE user_id = ?",
    [userId]
  );
  
  // Đặt tài khoản được chọn làm mặc định
  const [result] = await conn.query(
    "UPDATE taikhoannganhang SET la_mac_dinh = 1 WHERE tai_khoan_id = ? AND user_id = ?",
    [accountId, userId]
  );
  
  return result.affectedRows > 0;
};

// Kiểm tra tài khoản có thuộc về user không
const checkAccountOwnership = async (accountId, userId) => {
  const [rows] = await pool.query(
    "SELECT tai_khoan_id FROM taikhoannganhang WHERE tai_khoan_id = ? AND user_id = ? LIMIT 1",
    [accountId, userId]
  );
  return rows.length > 0;
};

export default {
  getBankAccountsByUserId,
  getBankAccountById,
  createBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
  checkAccountOwnership
};

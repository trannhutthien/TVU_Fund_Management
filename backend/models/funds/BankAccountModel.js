import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── BANK ACCOUNT MODEL (TÀI KHOẢN NGÂN HÀNG CỦA QUỸ) ─────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// Lấy tất cả tài khoản ngân hàng của quỹ
const getBankAccountsByFundId = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT 
      taikhoannganhang_id,
      quy_id,
      sotaikhoan,
      nganhang,
      chinhanh,
      chutaikhoan,
      trangthai,
      ngaytao,
      ngaycapnhat
     FROM taikhoannganhang
     WHERE quy_id = ?
     ORDER BY ngaytao DESC`,
    [quyId]
  );
  return rows;
};

// Lấy tài khoản ngân hàng theo ID
const getBankAccountById = async (accountId) => {
  const [rows] = await pool.query(
    `SELECT 
      taikhoannganhang_id,
      quy_id,
      sotaikhoan,
      nganhang,
      chinhanh,
      chutaikhoan,
      trangthai,
      ngaytao,
      ngaycapnhat
     FROM taikhoannganhang
     WHERE taikhoannganhang_id = ?
     LIMIT 1`,
    [accountId]
  );
  return rows[0] || null;
};

// Tạo tài khoản ngân hàng mới cho quỹ
const createBankAccount = async (accountData) => {
  const {
    quyId,
    soTaiKhoan,
    nganHang,
    chiNhanh,
    chuTaiKhoan,
    trangThai
  } = accountData;

  const [result] = await pool.query(
    `INSERT INTO taikhoannganhang 
    (quy_id, sotaikhoan, nganhang, chinhanh, chutaikhoan, trangthai) 
    VALUES (?, ?, ?, ?, ?, ?)`,
    [quyId, soTaiKhoan, nganHang, chiNhanh || null, chuTaiKhoan, trangThai || 'Hoat dong']
  );
  
  return result.insertId;
};

// Cập nhật tài khoản ngân hàng
const updateBankAccount = async (accountId, accountData) => {
  const {
    soTaiKhoan,
    nganHang,
    chiNhanh,
    chuTaiKhoan,
    trangThai
  } = accountData;

  const [result] = await pool.execute(
    `UPDATE taikhoannganhang 
     SET sotaikhoan = ?, 
         nganhang = ?, 
         chinhanh = ?, 
         chutaikhoan = ?, 
         trangthai = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE taikhoannganhang_id = ?`,
    [soTaiKhoan, nganHang, chiNhanh || null, chuTaiKhoan, trangThai, accountId]
  );
  
  return result;
};

// Xóa tài khoản ngân hàng
const deleteBankAccount = async (accountId) => {
  const [result] = await pool.query(
    "DELETE FROM taikhoannganhang WHERE taikhoannganhang_id = ?",
    [accountId]
  );
  return result.affectedRows > 0;
};

// Cập nhật trạng thái tài khoản ngân hàng
const updateBankAccountStatus = async (accountId, trangThai) => {
  const [result] = await pool.execute(
    `UPDATE taikhoannganhang 
     SET trangthai = ?, 
         ngaycapnhat = CURRENT_TIMESTAMP 
     WHERE taikhoannganhang_id = ?`,
    [trangThai, accountId]
  );
  return result;
};

// Kiểm tra tài khoản có thuộc về quỹ không
const checkAccountOwnership = async (accountId, quyId) => {
  const [rows] = await pool.query(
    "SELECT taikhoannganhang_id FROM taikhoannganhang WHERE taikhoannganhang_id = ? AND quy_id = ? LIMIT 1",
    [accountId, quyId]
  );
  return rows.length > 0;
};

// Lấy tất cả tài khoản ngân hàng đang hoạt động
const getAllActiveBankAccounts = async () => {
  const [rows] = await pool.query(
    `SELECT 
      tk.taikhoannganhang_id,
      tk.quy_id,
      tk.sotaikhoan,
      tk.nganhang,
      tk.chinhanh,
      tk.chutaikhoan,
      tk.trangthai,
      tk.ngaytao,
      tk.ngaycapnhat,
      q.tenquy
     FROM taikhoannganhang tk
     INNER JOIN quy q ON tk.quy_id = q.quy_id
     WHERE tk.trangthai = 'Hoat dong'
     ORDER BY tk.ngaytao DESC`
  );
  return rows;
};

export default {
  getBankAccountsByFundId,
  getBankAccountById,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  updateBankAccountStatus,
  checkAccountOwnership,
  getAllActiveBankAccounts
};

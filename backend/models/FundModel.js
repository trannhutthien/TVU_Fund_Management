import pool from "../config/db.js";

// Kiểm tra tên quỹ đã tồn tại chưa
const checkFundNameExists = async (tenQuy) => {
  const [rows] = await pool.query(
    `SELECT quy_id FROM Quy WHERE ten_quy = ? LIMIT 1`,
    [tenQuy]
  );
  return rows.length > 0;
};

// Tạo quỹ mới
const createFund = async (fundData) => {
  const {
    tenQuy,
    loaiQuy,
    moTa,
    soDu,
    trangThai
  } = fundData;

  const [result] = await pool.execute(
    `INSERT INTO Quy (
      ten_quy, 
      loai_quy, 
      mo_ta, 
      so_du, 
      trang_thai
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      tenQuy,
      loaiQuy,
      moTa || null,
      soDu || 0.00,
      trangThai || 'Dang hoat dong'
    ]
  );

  return result;
};

// Lấy thông tin quỹ theo ID
const getFundById = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT 
      quy_id,
      ten_quy,
      loai_quy,
      mo_ta,
      so_du,
      ngay_tao,
      ngay_cap_nhat,
      trang_thai
     FROM Quy
     WHERE quy_id = ?
     LIMIT 1`,
    [quyId]
  );
  return rows[0] || null;
};

export default {
  checkFundNameExists,
  createFund,
  getFundById
};

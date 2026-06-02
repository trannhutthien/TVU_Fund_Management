import pool from "../../config/db.js";

// Lấy tất cả loại quỹ
const getAllLoaiQuy = async () => {
  const [rows] = await pool.query(
    `SELECT 
      loaiquy_id AS id, 
      maloai AS ma_loai, 
      tenloai AS ten_loai, 
      ngaytao AS ngay_tao 
     FROM loaiquy 
     ORDER BY ngaytao DESC`
  );
  return rows;
};

// Kiểm tra mã loại đã tồn tại chưa
const checkMaLoaiExists = async (maLoai) => {
  const [rows] = await pool.query(
    `SELECT loaiquy_id AS id FROM loaiquy WHERE maloai = ? LIMIT 1`,
    [maLoai]
  );
  return rows.length > 0;
};

// Tạo loại quỹ mới
const createLoaiQuy = async (maLoai, tenLoai) => {
  const [result] = await pool.execute(
    `INSERT INTO loaiquy (maloai, tenloai) VALUES (?, ?)`,
    [maLoai, tenLoai]
  );
  return result;
};

export default {
  getAllLoaiQuy,
  checkMaLoaiExists,
  createLoaiQuy
};

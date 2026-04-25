import pool from "../config/db.js";

// Kiểm tra email đã tồn tại chưa
const checkEmailExists = async (email) => {
  const [rows] = await pool.query(
    `SELECT ma_so_dinh_danh FROM nguoidung WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows.length > 0;
};

// Tạo người dùng mới
const createUser = async (userData) => {
  const { maSoDinhDanh, hoTen, email, matKhau, roleId, trangThai, khoaphong } = userData;
  
  const [result] = await pool.query(
    `INSERT INTO nguoidung (ma_so_dinh_danh, ho_ten, email, mat_khau, role_id, trang_thai, khoa_phong)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [maSoDinhDanh, hoTen, email, matKhau, roleId, trangThai || 'HOAT_DONG', khoaphong]
  );
  
  return result;
};

// Lấy thông tin user theo ID (sau khi tạo)
const getUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ma_so_dinh_danh, ho_ten, email, role_id, trang_thai, khoa_phong, created_at
     FROM nguoidung 
     WHERE ma_so_dinh_danh = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Lấy danh sách tất cả người dùng (JOIN với bảng vai trò)
const getAllUsers = async () => {
  const [rows] = await pool.query(
    `SELECT 
      n.ma_so_dinh_danh,
      n.ho_ten,
      n.email,
      n.role_id,
      n.trang_thai,
      n.khoa_phong,
      n.created_at,
      v.ten_vai_tro
     FROM nguoidung n
     LEFT JOIN vaitro v ON n.role_id = v.role_id
     ORDER BY n.created_at DESC`
  );
  return rows;
};

export default { checkEmailExists, createUser, getUserById, getAllUsers };

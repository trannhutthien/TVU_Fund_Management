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
  const { 
    maSoDinhDanh, hoTen, email, matKhau, roleId, trangThai, 
    khoaphong, soDienThoai, diaChi, loaiTaiKhoan, avatar 
  } = userData;
  
  const [result] = await pool.query(
    `INSERT INTO nguoidung (
      ma_so_dinh_danh, ho_ten, email, mat_khau, role_id, trang_thai, 
      khoa_phong, so_dien_thoai, dia_chi, loai_tai_khoan, avatar
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      maSoDinhDanh, 
      hoTen, 
      email, 
      matKhau, 
      roleId, 
      trangThai || 'HOAT_DONG', 
      khoaphong,
      soDienThoai || null,
      diaChi || null,
      loaiTaiKhoan || null,
      avatar || null
    ]
  );
  
  return result;
};

// Lấy thông tin user theo ID (sau khi tạo)
const getUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT user_id, ma_so_dinh_danh, ho_ten, email, avatar, so_dien_thoai, dia_chi,
            role_id, loai_tai_khoan, khoa_phong, trang_thai, created_at
     FROM nguoidung 
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Lấy thông tin chi tiết user theo ID (JOIN với bảng vai trò)
const getUserByIdWithRole = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
      n.user_id,
      n.ma_so_dinh_danh,
      n.ho_ten,
      n.email,
      n.avatar,
      n.so_dien_thoai,
      n.dia_chi,
      n.role_id,
      n.loai_tai_khoan,
      n.khoa_phong,
      n.trang_thai,
      n.created_at,
      v.ten_vai_tro,
      v.mo_ta as mo_ta_vai_tro
     FROM nguoidung n
     LEFT JOIN vaitro v ON n.role_id = v.role_id
     WHERE n.user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Lấy danh sách tất cả người dùng (JOIN với bảng vai trò)
const getAllUsers = async () => {
  const [rows] = await pool.query(
    `SELECT
      n.user_id,
      n.ma_so_dinh_danh,
      n.ho_ten,
      n.email,
      n.avatar,
      n.so_dien_thoai,
      n.dia_chi,
      n.role_id,
      n.loai_tai_khoan,
      n.khoa_phong,
      n.trang_thai,
      n.created_at,
      v.ten_vai_tro
     FROM nguoidung n
     LEFT JOIN vaitro v ON n.role_id = v.role_id
     ORDER BY n.created_at DESC`
  );
  return rows;
};

// Danh sách có filter + phân trang
//   tab: 'tat_ca' | 'sinh_vien' | 'nha_tai_tro' | 'nhan_vien'
const getUserList = async ({
  keyword = '',
  trang_thai = '',
  khoa_phong = '',
  loai_ntt = '',
  tab = 'tat_ca',
  page = 1,
  page_size = 15,
}) => {
  const conds = [];
  const params = [];

  // Tab filters
  if (tab === 'sinh_vien') {
    conds.push(`n.role_id = 4 AND n.loai_tai_khoan = 'SINH_VIEN'`);
  } else if (tab === 'nha_tai_tro') {
    conds.push(`n.role_id = 4 AND n.loai_tai_khoan = 'NHA_TAI_TRO'`);
  } else if (tab === 'nhan_vien') {
    conds.push(`n.role_id IN (1, 2, 3)`);
  }

  if (keyword) {
    conds.push(
      `(n.ho_ten LIKE ? OR n.email LIKE ? OR n.ma_so_dinh_danh LIKE ? OR n.so_dien_thoai LIKE ?)`
    );
    const like = `%${keyword}%`;
    params.push(like, like, like, like);
  }
  if (trang_thai) { conds.push(`n.trang_thai = ?`); params.push(trang_thai); }
  if (khoa_phong) { conds.push(`n.khoa_phong = ?`); params.push(khoa_phong); }
  if (loai_ntt && tab !== 'sinh_vien' && tab !== 'nhan_vien') {
    conds.push(`n.loai_tai_khoan = ?`);
    params.push(loai_ntt);
  }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const offset = (page - 1) * page_size;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM nguoidung n ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT
      n.user_id,
      n.ma_so_dinh_danh,
      n.ho_ten,
      n.email,
      n.avatar,
      n.so_dien_thoai,
      n.dia_chi,
      n.role_id,
      n.loai_tai_khoan,
      n.khoa_phong,
      n.trang_thai,
      n.created_at,
      v.ten_vai_tro,
      ntt.ten_nha_tai_tro,
      ntt.loai AS loai_nha_tai_tro,
      ntt.tong_so_tien_da_tai_tro,
      ntt.so_lan_tai_tro
     FROM nguoidung n
     LEFT JOIN vaitro v ON n.role_id = v.role_id
     LEFT JOIN nhataitro ntt ON ntt.user_id = n.user_id
     ${where}
     ORDER BY n.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(page_size), offset]
  );

  return { rows, total: Number(total) || 0 };
};

// 4 thẻ stats
const getStats = async () => {
  const [[{ tongNguoiDung }]] = await pool.query(
    `SELECT COUNT(*) AS tongNguoiDung FROM nguoidung`
  );
  const [[{ sinhVien }]] = await pool.query(
    `SELECT COUNT(*) AS sinhVien FROM nguoidung
     WHERE role_id = 4 AND loai_tai_khoan = 'SINH_VIEN'`
  );
  const [[{ nhaTaiTro }]] = await pool.query(
    `SELECT COUNT(*) AS nhaTaiTro FROM nguoidung
     WHERE role_id = 4 AND loai_tai_khoan = 'NHA_TAI_TRO'`
  );
  const [[{ taiKhoanBiKhoa }]] = await pool.query(
    `SELECT COUNT(*) AS taiKhoanBiKhoa FROM nguoidung WHERE trang_thai = 'KHOA'`
  );
  return {
    tongNguoiDung: Number(tongNguoiDung) || 0,
    sinhVien: Number(sinhVien) || 0,
    nhaTaiTro: Number(nhaTaiTro) || 0,
    taiKhoanBiKhoa: Number(taiKhoanBiKhoa) || 0,
  };
};

// Cập nhật thông tin user (chỉ cho phép sửa các field an toàn)
const updateUserInfo = async (userId, data) => {
  const allowed = ['ho_ten', 'so_dien_thoai', 'dia_chi', 'khoa_phong', 'avatar'];
  const sets = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(data[key] || null);
    }
  }
  if (!sets.length) return { affectedRows: 0 };
  params.push(userId);
  const [result] = await pool.execute(
    `UPDATE nguoidung SET ${sets.join(', ')} WHERE user_id = ?`,
    params
  );
  return result;
};

// Cập nhật trạng thái người dùng
const updateUserStatus = async (userId, trangThai) => {
  const [result] = await pool.query(
    `UPDATE nguoidung
     SET trang_thai = ?
     WHERE user_id = ?`,
    [trangThai, userId]
  );
  return result;
};

export default {
  checkEmailExists,
  createUser,
  getUserById,
  getUserByIdWithRole,
  getAllUsers,
  getUserList,
  getStats,
  updateUserInfo,
  updateUserStatus,
};

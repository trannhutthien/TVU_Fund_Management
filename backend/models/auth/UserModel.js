import pool from "../../config/db.js";

// Kiểm tra email đã tồn tại chưa
const checkEmailExists = async (email) => {
  const [rows] = await pool.query(
    `SELECT masodinhdanh FROM nguoidung WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows.length > 0;
};

// Helper to find or create donvihoc_id
const getOrCreateDonViHocId = async (tenKhoa) => {
  if (!tenKhoa) return null;
  const [rows] = await pool.query(
    "SELECT donvihoc_id FROM donvihoc WHERE tenkhoa = ? LIMIT 1",
    [tenKhoa]
  );
  if (rows.length > 0) {
    return rows[0].donvihoc_id;
  }
  const madonvi = `DV${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const [result] = await pool.query(
    "INSERT INTO donvihoc (madonvi, tenkhoa, trangthai) VALUES (?, ?, 'Hoat dong')",
    [madonvi, tenKhoa]
  );
  return result.insertId;
};

// Tạo người dùng mới
const createUser = async (userData) => {
  const { 
    maSoDinhDanh, hoTen, email, matKhau, roleId, trangThai, 
    khoaphong, soDienThoai, diaChi, loaiTaiKhoan, avatar 
  } = userData;

  const donvihoc_id = await getOrCreateDonViHocId(khoaphong);
  
  const dbStatus = trangThai === 'HOAT_DONG' ? 'Hoat dong' : (trangThai === 'KHOA' ? 'Khoa' : (trangThai === 'CHO_DUYET' ? 'Cho duyet' : (trangThai || 'Hoat dong')));
  const dbLoaiTaiKhoan = loaiTaiKhoan === 'SINH_VIEN' ? 'Sinh vien' : (loaiTaiKhoan === 'NHA_TAI_TRO' ? 'Nha tai tro' : loaiTaiKhoan);

  const [result] = await pool.query(
    `INSERT INTO nguoidung (
      masodinhdanh, hoten, email, matkhau, vaitro_id, trangthai, 
      donvihoc_id, sodienthoai, diachi, loaitaikhoan, avatar
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      maSoDinhDanh, 
      hoTen, 
      email, 
      matKhau, 
      roleId, 
      dbStatus, 
      donvihoc_id,
      soDienThoai || null,
      diaChi || null,
      dbLoaiTaiKhoan || null,
      avatar || null
    ]
  );
  
  return result;
};

// Lấy thông tin user theo ID (sau khi tạo)
const getUserById = async (userId) => {
  const [rows] = await pool.query(
    `SELECT n.nguoidung_id, n.masodinhdanh, n.hoten, n.email, n.avatar, n.sodienthoai, n.diachi,
            n.vaitro_id, n.loaitaikhoan, dv.tenkhoa AS khoaphong, n.trangthai, n.ngaytao
     FROM nguoidung n
     LEFT JOIN donvihoc dv ON n.donvihoc_id = dv.donvihoc_id
     WHERE n.nguoidung_id = ?
     LIMIT 1`,
    [userId]
  );
  if (rows[0]) {
    rows[0].trangthai = rows[0].trangthai === 'Hoat dong' ? 'HOAT_DONG' : (rows[0].trangthai === 'Khoa' ? 'KHOA' : (rows[0].trangthai === 'Cho duyet' ? 'CHO_DUYET' : rows[0].trangthai));
    rows[0].loaitaikhoan = rows[0].loaitaikhoan === 'Sinh vien' ? 'SINH_VIEN' : (rows[0].loaitaikhoan === 'Nha tai tro' ? 'NHA_TAI_TRO' : rows[0].loaitaikhoan);
  }
  return rows[0] || null;
};

// Lấy thông tin chi tiết user theo ID (JOIN với bảng vai trò)
const getUserByIdWithRole = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
      n.nguoidung_id,
      n.masodinhdanh,
      n.hoten,
      n.email,
      n.avatar,
      n.sodienthoai,
      n.diachi,
      n.vaitro_id,
      n.loaitaikhoan,
      dv.tenkhoa AS khoaphong,
      n.trangthai,
      n.ngaytao,
      v.tenvaitro,
      v.mota AS mota_vaitro
     FROM nguoidung n
     LEFT JOIN vaitro v ON n.vaitro_id = v.vaitro_id
     LEFT JOIN donvihoc dv ON n.donvihoc_id = dv.donvihoc_id
     WHERE n.nguoidung_id = ?
     LIMIT 1`,
    [userId]
  );
  if (rows[0]) {
    rows[0].trangthai = rows[0].trangthai === 'Hoat dong' ? 'HOAT_DONG' : (rows[0].trangthai === 'Khoa' ? 'KHOA' : (rows[0].trangthai === 'Cho duyet' ? 'CHO_DUYET' : rows[0].trangthai));
    rows[0].loaitaikhoan = rows[0].loaitaikhoan === 'Sinh vien' ? 'SINH_VIEN' : (rows[0].loaitaikhoan === 'Nha tai tro' ? 'NHA_TAI_TRO' : rows[0].loaitaikhoan);
  }
  return rows[0] || null;
};

// Lấy danh sách tất cả người dùng (JOIN với bảng vai trò)
const getAllUsers = async () => {
  const [rows] = await pool.query(
    `SELECT
      n.nguoidung_id,
      n.masodinhdanh,
      n.hoten,
      n.email,
      n.avatar,
      n.sodienthoai,
      n.diachi,
      n.vaitro_id,
      n.loaitaikhoan,
      dv.tenkhoa AS khoaphong,
      n.trangthai,
      n.ngaytao,
      v.tenvaitro
     FROM nguoidung n
     LEFT JOIN vaitro v ON n.vaitro_id = v.vaitro_id
     LEFT JOIN donvihoc dv ON n.donvihoc_id = dv.donvihoc_id
     ORDER BY n.ngaytao DESC`
  );
  return rows.map(r => ({
    ...r,
    trangthai: r.trangthai === 'Hoat dong' ? 'HOAT_DONG' : (r.trangthai === 'Khoa' ? 'KHOA' : (r.trangthai === 'Cho duyet' ? 'CHO_DUYET' : r.trangthai)),
    loaitaikhoan: r.loaitaikhoan === 'Sinh vien' ? 'SINH_VIEN' : (r.loaitaikhoan === 'Nha tai tro' ? 'NHA_TAI_TRO' : r.loaitaikhoan)
  }));
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
    conds.push(`n.vaitro_id = 4 AND n.loaitaikhoan = 'Sinh vien'`);
  } else if (tab === 'nha_tai_tro') {
    conds.push(`n.vaitro_id = 4 AND n.loaitaikhoan = 'Nha tai tro'`);
  } else if (tab === 'nhan_vien') {
    conds.push(`n.vaitro_id IN (1, 2, 3)`);
  }

  if (keyword) {
    conds.push(
      `(n.hoten LIKE ? OR n.email LIKE ? OR n.masodinhdanh LIKE ? OR n.sodienthoai LIKE ?)`
    );
    const like = `%${keyword}%`;
    params.push(like, like, like, like);
  }
  if (trang_thai) { conds.push(`n.trangthai = ?`); params.push(trang_thai); }
  if (khoa_phong) { conds.push(`dv.tenkhoa = ?`); params.push(khoa_phong); }
  if (loai_ntt && tab !== 'sinh_vien' && tab !== 'nhan_vien') {
    conds.push(`n.loaitaikhoan = ?`);
    params.push(loai_ntt);
  }

  const where = conds.length ? `WHERE ${conds.join(' AND ')}` : '';
  const offset = (page - 1) * page_size;

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total FROM nguoidung n 
     LEFT JOIN donvihoc dv ON n.donvihoc_id = dv.donvihoc_id
     ${where}`,
    params
  );

  const [rows] = await pool.query(
    `SELECT
      n.nguoidung_id,
      n.masodinhdanh,
      n.hoten,
      n.email,
      n.avatar,
      n.sodienthoai,
      n.diachi,
      n.vaitro_id,
      n.loaitaikhoan,
      dv.tenkhoa AS khoaphong,
      n.trangthai,
      n.ngaytao,
      v.tenvaitro,
      ntt.tennhataitro,
      ntt.loainhataitro AS loainhataitro,
      (SELECT COALESCE(SUM(sotien), 0) FROM khoantaitro WHERE nhataitro_id = ntt.nhataitro_id AND trangthai = 'Da nhan') AS tongsotiendataitro,
      (SELECT COUNT(*) FROM khoantaitro WHERE nhataitro_id = ntt.nhataitro_id AND trangthai = 'Da nhan') AS solantaitro
     FROM nguoidung n
     LEFT JOIN vaitro v ON n.vaitro_id = v.vaitro_id
     LEFT JOIN donvihoc dv ON n.donvihoc_id = dv.donvihoc_id
     LEFT JOIN nhataitro ntt ON ntt.nguoidung_id = n.nguoidung_id
     ${where}
     ORDER BY n.ngaytao DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(page_size), offset]
  );

  const mapped = rows.map(r => ({
    ...r,
    trangthai: r.trangthai === 'Hoat dong' ? 'HOAT_DONG' : (r.trangthai === 'Khoa' ? 'KHOA' : (r.trangthai === 'Cho duyet' ? 'CHO_DUYET' : r.trangthai)),
    loaitaikhoan: r.loaitaikhoan === 'Sinh vien' ? 'SINH_VIEN' : (r.loaitaikhoan === 'Nha tai tro' ? 'NHA_TAI_TRO' : r.loaitaikhoan)
  }));
  return { rows: mapped, total: Number(total) || 0 };
};

// 4 thẻ stats
const getStats = async () => {
  const [[{ tongNguoiDung }]] = await pool.query(
    `SELECT COUNT(*) AS tongNguoiDung FROM nguoidung`
  );
  const [[{ tongNguoiDungHoatDong }]] = await pool.query(
    `SELECT COUNT(*) AS tongNguoiDungHoatDong FROM nguoidung WHERE trangthai = 'Hoat dong'`
  );
  const [[{ sinhVien }]] = await pool.query(
    `SELECT COUNT(*) AS sinhVien FROM nguoidung
     WHERE vaitro_id = 4 AND loaitaikhoan = 'Sinh vien'`
  );
  const [[{ sinhVienHoatDong }]] = await pool.query(
    `SELECT COUNT(*) AS sinhVienHoatDong FROM nguoidung
     WHERE vaitro_id = 4 AND loaitaikhoan = 'Sinh vien' AND trangthai = 'Hoat dong'`
  );
  const [[{ nhaTaiTro }]] = await pool.query(
    `SELECT COUNT(*) AS nhaTaiTro FROM nguoidung
     WHERE vaitro_id = 4 AND loaitaikhoan = 'Nha tai tro'`
  );
  const [[{ nhaTaiTroHoatDong }]] = await pool.query(
    `SELECT COUNT(*) AS nhaTaiTroHoatDong FROM nguoidung
     WHERE vaitro_id = 4 AND loaitaikhoan = 'Nha tai tro' AND trangthai = 'Hoat dong'`
  );
  const [[{ taiKhoanBiKhoa }]] = await pool.query(
    `SELECT COUNT(*) AS taiKhoanBiKhoa FROM nguoidung WHERE trangthai = 'Khoa'`
  );
  
  // Thêm: Đếm nhân viên hệ thống (Admin, Kế toán, Cán bộ) cho Admin Dashboard
  const [[{ nhanVien }]] = await pool.query(
    `SELECT COUNT(*) AS nhanVien FROM nguoidung WHERE vaitro_id IN (1, 2, 3)`
  );
  const [[{ admin }]] = await pool.query(
    `SELECT COUNT(*) AS admin FROM nguoidung WHERE vaitro_id = 1`
  );
  const [[{ keToan }]] = await pool.query(
    `SELECT COUNT(*) AS keToan FROM nguoidung WHERE vaitro_id = 2`
  );
  const [[{ canBo }]] = await pool.query(
    `SELECT COUNT(*) AS canBo FROM nguoidung WHERE vaitro_id = 3`
  );
  
  // Thêm: Số người dùng mới trong 3 ngày gần đây
  const [[{ newThisMonth }]] = await pool.query(
    `SELECT COUNT(*) AS newThisMonth FROM nguoidung
     WHERE ngaytao >= DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)`
  );
  
  return {
    tongNguoiDung: Number(tongNguoiDung) || 0,
    tongNguoiDungHoatDong: Number(tongNguoiDungHoatDong) || 0,
    sinhVien: Number(sinhVien) || 0,
    sinhVienHoatDong: Number(sinhVienHoatDong) || 0,
    nhaTaiTro: Number(nhaTaiTro) || 0,
    nhaTaiTroHoatDong: Number(nhaTaiTroHoatDong) || 0,
    taiKhoanBiKhoa: Number(taiKhoanBiKhoa) || 0,
    nhanVien: Number(nhanVien) || 0, // Tổng nhân viên (role 1,2,3)
    admin: Number(admin) || 0,
    keToan: Number(keToan) || 0,
    canBo: Number(canBo) || 0,
    newThisMonth: Number(newThisMonth) || 0, // Người dùng mới trong 3 ngày
  };
};

// Cập nhật thông tin user (chỉ cho phép sửa các field an toàn)
const updateUserInfo = async (userId, data) => {
  // Support both camelCase and snake_case inputs
  const hoTenVal = data.hoten !== undefined ? data.hoten : data.ho_ten;
  const emailVal = data.email;
  const soDienThoaiVal = data.sodienthoai !== undefined ? data.sodienthoai : data.so_dien_thoai;
  const diaChiVal = data.diachi !== undefined ? data.diachi : data.dia_chi;
  const khoaPhongVal = data.khoaphong !== undefined ? data.khoaphong : data.khoa_phong;
  const avatarVal = data.avatar;

  const sets = [];
  const params = [];

  if (hoTenVal !== undefined) {
    sets.push("hoten = ?");
    params.push(hoTenVal || null);
  }
  if (emailVal !== undefined) {
    sets.push("email = ?");
    params.push(emailVal || null);
  }
  if (soDienThoaiVal !== undefined) {
    sets.push("sodienthoai = ?");
    params.push(soDienThoaiVal || null);
  }
  if (diaChiVal !== undefined) {
    sets.push("diachi = ?");
    params.push(diaChiVal || null);
  }
  if (khoaPhongVal !== undefined) {
    const donvihoc_id = await getOrCreateDonViHocId(khoaPhongVal);
    sets.push("donvihoc_id = ?");
    params.push(donvihoc_id);
  }
  if (avatarVal !== undefined) {
    sets.push("avatar = ?");
    params.push(avatarVal || null);
  }

  if (!sets.length) return { affectedRows: 0 };
  params.push(userId);
  const [result] = await pool.execute(
    `UPDATE nguoidung SET ${sets.join(', ')} WHERE nguoidung_id = ?`,
    params
  );
  return result;
};

// Cập nhật trạng thái người dùng
const updateUserStatus = async (userId, trangThai) => {
  const dbStatus = trangThai === 'HOAT_DONG' ? 'Hoat dong' : (trangThai === 'KHOA' ? 'Khoa' : (trangThai === 'CHO_DUYET' ? 'Cho duyet' : trangThai));
  const [result] = await pool.query(
    `UPDATE nguoidung
     SET trangthai = ?
     WHERE nguoidung_id = ?`,
    [dbStatus, userId]
  );
  return result;
};

// Thống kê lượng người dùng mới trong N tháng gần nhất
const getUserGrowth = async (months = 6) => {
  const [rows] = await pool.query(
    `SELECT
       DATE_FORMAT(ngaytao, '%Y-%m') AS thang_key,
       MONTH(ngaytao) AS thang,
       YEAR(ngaytao) AS nam,
       COUNT(*) AS count
     FROM nguoidung
     WHERE ngaytao >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
     GROUP BY thang_key, thang, nam
     ORDER BY thang_key ASC`,
    [months]
  );

  const result = [];
  const now = new Date();
  const map = new Map(rows.map((r) => [r.thang_key, r.count]));
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({
      month: `T${d.getMonth() + 1}`,
      monthKey: key,
      count: map.get(key) || 0,
    });
  }
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
  getUserGrowth,
};

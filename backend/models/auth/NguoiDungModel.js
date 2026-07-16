import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NGUOI DUNG MODEL ──────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════
// LƯU Ý: Schema database dùng "nguoidung_id" là PRIMARY KEY, không phải "id"

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

const toDbAccountType = (type) => {
  if (type === 'SINH_VIEN') return 'Sinh vien';
  if (type === 'NHA_TAI_TRO') return 'Nha tai tro';
  if (type === 'CAN_BO') return 'Can bo';
  if (type === 'NHA_KHOA_HOC') return 'Nha khoa hoc';
  return type;
};

const fromDbAccountType = (dbType) => {
  if (dbType === 'Sinh vien') return 'SINH_VIEN';
  if (dbType === 'Nha tai tro') return 'NHA_TAI_TRO';
  if (dbType === 'Can bo') return 'CAN_BO';
  if (dbType === 'Nha khoa hoc') return 'NHA_KHOA_HOC';
  return dbType;
};

// Kiểm tra email đã tồn tại chưa
const checkEmailExists = async (email) => {
  const [rows] = await pool.query(
    "SELECT nguoidung_id FROM nguoidung WHERE email = ? LIMIT 1",
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
    diaChi,
    tinhTrangCongTac,
    donViCongTac
  } = userData;

  const donvihoc_id = await getOrCreateDonViHocId(khoaPhong);

  const dbStatus = trangThai === 'HOAT_DONG' ? 'Hoat dong' : (trangThai === 'KHOA' ? 'Khoa' : (trangThai === 'CHO_DUYET' ? 'Cho duyet' : (trangThai || 'Hoat dong')));
  const dbLoaiTaiKhoan = toDbAccountType(loaiTaiKhoan);

  const [result] = await pool.query(
    `INSERT INTO nguoidung 
    (hoten, masodinhdanh, email, matkhau, vaitro_id, loaitaikhoan, donvihoc_id, sodienthoai, trangthai, avatar, diachi, tinhtrangcongtac, donvicongtac) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [hoTen, maSoDinhDanh, email, matKhau, roleId, dbLoaiTaiKhoan || null, donvihoc_id, soDienThoai, dbStatus, avatar, diaChi, tinhTrangCongTac || null, donViCongTac || null]
  );
  return result.insertId;
};

// Tìm người dùng theo email (dùng khi đăng nhập)
// JOIN với bảng vaitro để lấy tên vai trò
const getUserForLogin = async (email) => {
  const [rows] = await pool.query(
    `SELECT 
      nd.nguoidung_id, 
      nd.masodinhdanh, 
      nd.hoten, 
      nd.matkhau, 
      nd.vaitro_id, 
      nd.loaitaikhoan, 
      nd.tinhtrangcongtac,
      nd.donvicongtac,
      nd.trangthai,
      nd.ngaytao,
      vt.tenvaitro,
      vt.trangthai AS vt_trangthai
     FROM nguoidung nd
     LEFT JOIN vaitro vt ON nd.vaitro_id = vt.vaitro_id
     WHERE nd.email = ?
     LIMIT 1`,
    [email]
  );
  if (rows[0]) {
    rows[0].trangthai = rows[0].trangthai === 'Hoat dong' ? 'HOAT_DONG' : (rows[0].trangthai === 'Khoa' ? 'KHOA' : (rows[0].trangthai === 'Cho duyet' ? 'CHO_DUYET' : rows[0].trangthai));
    rows[0].loaitaikhoan = fromDbAccountType(rows[0].loaitaikhoan);
  }
  return rows[0] || null;
};

// Tìm người dùng theo nguoidung_id (dùng cho GET /api/auth/me)
// Không SELECT matkhau vì không cần thiết và bảo mật hơn
// JOIN với bảng vaitro để lấy tên vai trò
const getUserForProfile = async (userId) => {
  const [rows] = await pool.query(
    `SELECT 
      nd.nguoidung_id, 
      nd.masodinhdanh, 
      nd.hoten, 
      nd.email, 
      nd.avatar, 
      nd.sodienthoai, 
      nd.diachi, 
      nd.vaitro_id, 
      nd.loaitaikhoan, 
      dv.tenkhoa AS khoaphong, 
      nd.tinhtrangcongtac,
      nd.donvicongtac,
      nd.trangthai,
      nd.ngaytao,
      vt.tenvaitro,
      (nd.matkhau IS NOT NULL) AS hasPassword
     FROM nguoidung nd
     LEFT JOIN vaitro vt ON nd.vaitro_id = vt.vaitro_id
     LEFT JOIN donvihoc dv ON nd.donvihoc_id = dv.donvihoc_id
     WHERE nd.nguoidung_id = ?
     LIMIT 1`,
    [userId]
  );
  if (rows[0]) {
    rows[0].trangthai = rows[0].trangthai === 'Hoat dong' ? 'HOAT_DONG' : (rows[0].trangthai === 'Khoa' ? 'KHOA' : (rows[0].trangthai === 'Cho duyet' ? 'CHO_DUYET' : rows[0].trangthai));
    rows[0].loaitaikhoan = fromDbAccountType(rows[0].loaitaikhoan);
  }
  return rows[0] || null;
};

// Lấy mật khẩu hiện tại của user (dùng để verify old password)
const getUserPassword = async (userId) => {
  const [rows] = await pool.query(
    `SELECT matkhau FROM nguoidung WHERE nguoidung_id = ? LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
};

// Cập nhật mật khẩu người dùng
const updatePassword = async (userId, hashedPassword) => {
  const [result] = await pool.query(
    "UPDATE nguoidung SET matkhau = ? WHERE nguoidung_id = ?",
    [hashedPassword, userId]
  );
  return result;
};

// Tìm user theo email (dùng cho Google OAuth - không cần mật khẩu)
const getUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `SELECT 
      nd.nguoidung_id, 
      nd.masodinhdanh, 
      nd.hoten, 
      nd.email, 
      nd.avatar,
      nd.vaitro_id, 
      nd.loaitaikhoan, 
      nd.trangthai,
      nd.ngaytao,
      vt.tenvaitro,
      vt.trangthai AS vt_trangthai,
      (nd.matkhau IS NOT NULL) AS hasPassword
     FROM nguoidung nd
     LEFT JOIN vaitro vt ON nd.vaitro_id = vt.vaitro_id
     WHERE nd.email = ?
     LIMIT 1`,
    [email]
  );
  if (rows[0]) {
    rows[0].trangthai = rows[0].trangthai === 'Hoat dong' ? 'HOAT_DONG' : (rows[0].trangthai === 'Khoa' ? 'KHOA' : (rows[0].trangthai === 'Cho duyet' ? 'CHO_DUYET' : rows[0].trangthai));
    rows[0].loaitaikhoan = fromDbAccountType(rows[0].loaitaikhoan);
  }
  return rows[0] || null;
};

// Tạo user mới từ Google OAuth (không có mật khẩu, matkhau = NULL)
const createUserFromGoogle = async ({ hoTen, email, avatar }) => {
  const maSoDinhDanh = `GG${Date.now()}`;

  const [result] = await pool.query(
    `INSERT INTO nguoidung 
    (hoten, masodinhdanh, email, matkhau, vaitro_id, loaitaikhoan, trangthai, avatar) 
    VALUES (?, ?, ?, NULL, 4, 'Sinh vien', 'Hoat dong', ?)`,
    [hoTen, maSoDinhDanh, email.toLowerCase(), avatar || null]
  );
  return result.insertId;
};

export default { 
  checkEmailExists,
  createUser,
  getUserForLogin, 
  getUserForProfile, 
  getUserPassword, 
  updatePassword,
  getUserByEmail,
  createUserFromGoogle,
};

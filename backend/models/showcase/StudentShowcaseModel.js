import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── STUDENT SHOWCASE MODEL ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAllStudentShowcase
// MỤC ĐÍCH: Lấy tất cả sinh viên nổi bật (cho admin/cán bộ)
// ─────────────────────────────────────────────────────────────────────────────
const getAllStudentShowcase = async () => {
  const [rows] = await pool.query(
    `SELECT 
      sv.sinhviennoibat_id,
      sv.nguoidung_id,
      sv.hoten,
      sv.khoaphong,
      sv.namhoc,
      sv.hinhanh,
      nd.avatar AS nguoidung_avatar,
      sv.thanhtich,
      sv.thutu,
      sv.trangthai,
      sv.ngaytao,
      sv.ngaycapnhat
     FROM sinhviennoibat sv
     LEFT JOIN nguoidung nd ON sv.nguoidung_id = nd.nguoidung_id
     ORDER BY sv.thutu ASC, sv.ngaytao DESC`
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getPublicStudentShowcase
// MỤC ĐÍCH: Lấy sinh viên nổi bật hiển thị công khai (cho landing page)
// ─────────────────────────────────────────────────────────────────────────────
const getPublicStudentShowcase = async () => {
  const [rows] = await pool.query(
    `SELECT 
      sv.sinhviennoibat_id,
      sv.nguoidung_id,
      sv.hoten,
      sv.khoaphong,
      sv.namhoc,
      sv.hinhanh,
      nd.avatar AS nguoidung_avatar,
      sv.thanhtich,
      sv.thutu,
      COALESCE(yc.so_lan_ho_tro, 0) AS so_lan_ho_tro,
      COALESCE(yc.tong_tien_ho_tro, 0) AS tong_tien_ho_tro
     FROM sinhviennoibat sv
     LEFT JOIN nguoidung nd ON sv.nguoidung_id = nd.nguoidung_id
     LEFT JOIN (
       SELECT 
         nguoidung_id,
         COUNT(*) AS so_lan_ho_tro,
         SUM(sotiendenghi) AS tong_tien_ho_tro
       FROM yeucauhotro
       WHERE trangthai = 'Da giai ngan'
       GROUP BY nguoidung_id
     ) yc ON sv.nguoidung_id = yc.nguoidung_id
     WHERE sv.trangthai = 'Hien thi'
     ORDER BY sv.thutu ASC, sv.ngaytao DESC
     LIMIT 10`
  );
  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getStudentShowcaseById
// MỤC ĐÍCH: Lấy thông tin một sinh viên nổi bật theo ID
// ─────────────────────────────────────────────────────────────────────────────
const getStudentShowcaseById = async (sinhviennoibatId) => {
  const [rows] = await pool.query(
    `SELECT 
      sv.sinhviennoibat_id,
      sv.nguoidung_id,
      sv.hoten,
      sv.khoaphong,
      sv.namhoc,
      sv.hinhanh,
      nd.avatar AS nguoidung_avatar,
      sv.thanhtich,
      sv.thutu,
      sv.trangthai,
      sv.ngaytao,
      sv.ngaycapnhat
     FROM sinhviennoibat sv
     LEFT JOIN nguoidung nd ON sv.nguoidung_id = nd.nguoidung_id
     WHERE sv.sinhviennoibat_id = ?
     LIMIT 1`,
    [sinhviennoibatId]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createStudentShowcase
// MỤC ĐÍCH: Tạo mới sinh viên nổi bật
// ─────────────────────────────────────────────────────────────────────────────
const createStudentShowcase = async (data) => {
  const {
    nguoiDungId,
    hoTen,
    khoaPhong,
    namHoc,
    hinhAnh,
    thanhTich,
    thuTu,
    trangThai
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO sinhviennoibat (
      nguoidung_id,
      hoten,
      khoaphong,
      namhoc,
      hinhanh,
      thanhtich,
      thutu,
      trangthai
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nguoiDungId || null,
      hoTen,
      khoaPhong || null,
      namHoc || null,
      hinhAnh || null,
      thanhTich || null,
      thuTu || 0,
      trangThai || 'Hien thi'
    ]
  );

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateStudentShowcase
// MỤC ĐÍCH: Cập nhật thông tin sinh viên nổi bật
// ─────────────────────────────────────────────────────────────────────────────
const updateStudentShowcase = async (sinhviennoibatId, data) => {
  const {
    nguoiDungId,
    hoTen,
    khoaPhong,
    namHoc,
    hinhAnh,
    thanhTich,
    thuTu,
    trangThai
  } = data;

  const [result] = await pool.execute(
    `UPDATE sinhviennoibat
     SET nguoidung_id = ?,
         hoten = ?,
         khoaphong = ?,
         namhoc = ?,
         hinhanh = ?,
         thanhtich = ?,
         thutu = ?,
         trangthai = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE sinhviennoibat_id = ?`,
    [
      nguoiDungId || null,
      hoTen,
      khoaPhong || null,
      namHoc || null,
      hinhAnh || null,
      thanhTich || null,
      thuTu || 0,
      trangThai || 'Hien thi',
      sinhviennoibatId
    ]
  );

  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: deleteStudentShowcase
// MỤC ĐÍCH: Xóa sinh viên nổi bật
// ─────────────────────────────────────────────────────────────────────────────
const deleteStudentShowcase = async (sinhviennoibatId) => {
  const [result] = await pool.execute(
    `DELETE FROM sinhviennoibat WHERE sinhviennoibat_id = ?`,
    [sinhviennoibatId]
  );
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateStudentShowcaseStatus
// MỤC ĐÍCH: Cập nhật trạng thái hiển thị
// ─────────────────────────────────────────────────────────────────────────────
const updateStudentShowcaseStatus = async (sinhviennoibatId, trangThai) => {
  const [result] = await pool.execute(
    `UPDATE sinhviennoibat
     SET trangthai = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE sinhviennoibat_id = ?`,
    [trangThai, sinhviennoibatId]
  );
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateStudentShowcaseOrder
// MỤC ĐÍCH: Cập nhật thứ tự hiển thị
// ─────────────────────────────────────────────────────────────────────────────
const updateStudentShowcaseOrder = async (sinhviennoibatId, thuTu) => {
  const [result] = await pool.execute(
    `UPDATE sinhviennoibat
     SET thutu = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE sinhviennoibat_id = ?`,
    [thuTu, sinhviennoibatId]
  );
  return result;
};

export default {
  getAllStudentShowcase,
  getPublicStudentShowcase,
  getStudentShowcaseById,
  createStudentShowcase,
  updateStudentShowcase,
  deleteStudentShowcase,
  updateStudentShowcaseStatus,
  updateStudentShowcaseOrder
};

import pool from "../../config/db.js";

// ═══════════════════════════════════════════════════════════════════════════════
// ─── NGHIỆM THU MODEL ────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════════

const VALID_LOAI_KIEM_TRA = ['Kiem tra tien do', 'Nghiem thu cuoi cung'];
const VALID_KET_QUA = ['Cho danh gia', 'Dat', 'Dat co dieu chinh', 'Khong dat'];

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createInspection
// MỤC ĐÍCH: Tạo mới một lượt kiểm tra / nghiệm thu
// ─────────────────────────────────────────────────────────────────────────────
const createInspection = async (data) => {
  const { yeucauhotroId, loaiKiemTra, nguoiNghiemThuId } = data;

  if (!VALID_LOAI_KIEM_TRA.includes(loaiKiemTra)) {
    throw new Error(`Loai kiem tra khong hop le. Chi chap nhan: ${VALID_LOAI_KIEM_TRA.join(', ')}`);
  }

  // Tự tính lần thứ (MAX + 1)
  const [[{ maxLan }]] = await pool.query(
    `SELECT COALESCE(MAX(lanthu), 0) AS maxLan FROM nghiemthu WHERE yeucauhotro_id = ?`,
    [yeucauhotroId]
  );
  const lanthu = maxLan + 1;

  const [result] = await pool.execute(
    `INSERT INTO nghiemthu (
      yeucauhotro_id,
      lanthu,
      loaikiemtra,
      ketqua,
      nguoinghiemthu_id,
      ngaytao
    ) VALUES (?, ?, ?, 'Cho danh gia', ?, NOW())`,
    [yeucauhotroId, lanthu, loaiKiemTra, nguoiNghiemThuId]
  );

  return {
    nghiemthuId: result.insertId,
    yeucauhotroId,
    lanthu,
    loaiKiemTra,
    ketqua: 'Cho danh gia'
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: updateResult
// MỤC ĐÍCH: Cập nhật kết quả nghiệm thu
// ─────────────────────────────────────────────────────────────────────────────
const updateResult = async (nghiemthuId, data, connection = null) => {
  const executor = connection || pool;
  const { ketqua, nhanXet, soQuyetDinh, fileBienBan, ngayNghiemThu } = data;

  if (ketqua && !VALID_KET_QUA.includes(ketqua)) {
    throw new Error(`Ket qua nghiem thu khong hop le. Chi chap nhan: ${VALID_KET_QUA.join(', ')}`);
  }

  await executor.execute(
    `UPDATE nghiemthu 
     SET ketqua = ?,
         nhanxet = ?,
         soquyetdinh = ?,
         filebienban = ?,
         ngaynghiemthu = ?
     WHERE nghiemthu_id = ?`,
    [
      ketqua,
      nhanXet || null,
      soQuyetDinh || null,
      fileBienBan || null,
      ngayNghiemThu || new Date().toISOString().slice(0, 10),
      nghiemthuId
    ]
  );

  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getById
// MỤC ĐÍCH: Lấy chi tiết 1 lượt nghiệm thu
// ─────────────────────────────────────────────────────────────────────────────
const getById = async (nghiemthuId) => {
  const [rows] = await pool.query(
    `SELECT 
      nt.nghiemthu_id,
      nt.yeucauhotro_id,
      nt.lanthu,
      nt.loaikiemtra,
      nt.ketqua,
      nt.soquyetdinh,
      nt.filebienban,
      nt.nguoinghiemthu_id,
      nt.nhanxet,
      nt.ngaynghiemthu,
      nt.ngaytao,
      nd.hoten AS nguoi_nghiem_thu_ten
     FROM nghiemthu nt
     LEFT JOIN nguoidung nd ON nt.nguoinghiemthu_id = nd.nguoidung_id
     WHERE nt.nghiemthu_id = ?
     LIMIT 1`,
    [nghiemthuId]
  );

  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getByApplicationId
// MỤC ĐÍCH: Lấy tất cả lượt nghiệm thu của 1 đơn xin hỗ trợ
// ─────────────────────────────────────────────────────────────────────────────
const getByApplicationId = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT 
      nt.nghiemthu_id,
      nt.yeucauhotro_id,
      nt.lanthu,
      nt.loaikiemtra,
      nt.ketqua,
      nt.soquyetdinh,
      nt.filebienban,
      nt.nguoinghiemthu_id,
      nt.nhanxet,
      nt.ngaynghiemthu,
      nt.ngaytao,
      nd.hoten AS nguoi_nghiem_thu_ten
     FROM nghiemthu nt
     LEFT JOIN nguoidung nd ON nt.nguoinghiemthu_id = nd.nguoidung_id
     WHERE nt.yeucauhotro_id = ?
     ORDER BY nt.lanthu ASC`,
    [yeucauhotroId]
  );

  return rows;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: checkEligibility
// MỤC ĐÍCH: Kiểm tra đơn có đủ điều kiện để nghiệm thu không
// ─────────────────────────────────────────────────────────────────────────────
const checkEligibility = async (yeucauhotroId) => {
  const [rows] = await pool.query(
    `SELECT yc.trangthai, yc.canghiemthu, yc.loaihotro
     FROM yeucauhotro yc
     WHERE yc.yeucauhotro_id = ?
     LIMIT 1`,
    [yeucauhotroId]
  );

  return rows[0] || null;
};

export default {
  createInspection,
  updateResult,
  getById,
  getByApplicationId,
  checkEligibility
};

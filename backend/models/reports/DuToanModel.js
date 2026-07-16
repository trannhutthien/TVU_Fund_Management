import pool from "../../config/db.js";

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: createRequest
// MỤC ĐÍCH: Kế toán đề xuất dự toán chi bộ máy hoạt động cho một năm tài chính
// ─────────────────────────────────────────────────────────────────────────────
const createRequest = async ({ namTaiChinh, soTienDuToan, ghiChu, nguoiDeXuatId }) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO dutoanhangnam (
        namtaichinh,
        sotiendutoan,
        ghichu,
        nguoidexuat_id,
        trangthai
      ) VALUES (?, ?, ?, ?, 'Cho duyet')`,
      [namTaiChinh, soTienDuToan, ghiChu || null, nguoiDeXuatId]
    );
    return result;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new Error('DUPLICATE_YEAR_BUDGET');
    }
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getRequestById
// MỤC ĐÍCH: Lấy chi tiết đề xuất dự toán
// ─────────────────────────────────────────────────────────────────────────────
const getRequestById = async (id) => {
  const [rows] = await pool.query(
    `SELECT 
      dt.dutoanhangnam_id,
      dt.namtaichinh,
      dt.sotiendutoan,
      dt.trangthai,
      dt.lydotuchoi,
      dt.nguoidexuat_id,
      dt.nguoiduyet_id,
      dt.ngaydexuat,
      dt.ngayduyet,
      dt.ghichu,
      nd_dx.hoten AS nguoi_de_xuat_ten,
      nd_dy.hoten AS nguoi_duyet_ten
     FROM dutoanhangnam dt
     INNER JOIN nguoidung nd_dx ON dt.nguoidexuat_id = nd_dx.nguoidung_id
     LEFT JOIN nguoidung nd_dy ON dt.nguoiduyet_id = nd_dy.nguoidung_id
     WHERE dt.dutoanhangnam_id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: approveRequest
// MỤC ĐÍCH: Admin phê duyệt dự toán chi bộ máy hoạt động hàng năm
// ─────────────────────────────────────────────────────────────────────────────
const approveRequest = async (id, nguoiDuyetId) => {
  const [result] = await pool.execute(
    `UPDATE dutoanhangnam 
     SET trangthai = 'Da duyet',
         nguoi_duyet_id = ?,
         ngayduyet = CURRENT_TIMESTAMP
     WHERE dutoanhangnam_id = ? AND trangthai = 'Cho duyet'`,
    [nguoiDuyetId, id]
  );
  return result.affectedRows > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: rejectRequest
// MỤC ĐÍCH: Admin từ chối dự toán chi bộ máy hoạt động hàng năm
// ─────────────────────────────────────────────────────────────────────────────
const rejectRequest = async (id, nguoiDuyetId, lyDoTuChoi) => {
  const [result] = await pool.execute(
    `UPDATE dutoanhangnam 
     SET trangthai = 'Tu choi',
         nguoi_duyet_id = ?,
         lydotuchoi = ?,
         ngayduyet = CURRENT_TIMESTAMP
     WHERE dutoanhangnam_id = ? AND trangthai = 'Cho duyet'`,
    [nguoiDuyetId, lyDoTuChoi || null, id]
  );
  return result.affectedRows > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getByYear
// MỤC ĐÍCH: Lấy dự toán chi bộ máy hoạt động theo năm tài chính
// ─────────────────────────────────────────────────────────────────────────────
const getByYear = async (namTaiChinh) => {
  const [rows] = await pool.query(
    `SELECT 
      dt.dutoanhangnam_id,
      dt.namtaichinh,
      dt.sotiendutoan,
      dt.trangthai,
      dt.lydotuchoi,
      dt.nguoidexuat_id,
      dt.nguoiduyet_id,
      dt.ngaydexuat,
      dt.ngayduyet,
      dt.ghichu,
      nd_dx.hoten AS nguoi_de_xuat_ten,
      nd_dy.hoten AS nguoi_duyet_ten
     FROM dutoanhangnam dt
     LEFT JOIN nguoidung nd_dx ON dt.nguoidexuat_id = nd_dx.nguoidung_id
     LEFT JOIN nguoidung nd_dy ON dt.nguoiduyet_id = nd_dy.nguoidung_id
     WHERE dt.namtaichinh = ?
     LIMIT 1`,
    [namTaiChinh]
  );
  return rows[0] || null;
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: getAccumulatedExpense
// MỤC ĐÍCH: Tính tổng số tiền đã chi lũy kế trong năm cho Bộ máy hoạt động
// ─────────────────────────────────────────────────────────────────────────────
const getAccumulatedExpense = async (namTaiChinh) => {
  const [rows] = await pool.query(
    `SELECT COALESCE(SUM(sotien), 0) AS total
     FROM giaodich
     WHERE loaigiaodich = 'Chi'
       AND hangmucchi = 'Bo_may_hoat_dong'
       AND trangthai = 'Thanh cong'
       AND YEAR(ngaygiaodich) = ?`,
    [namTaiChinh]
  );
  return parseFloat(rows[0]?.total || 0);
};

// ─────────────────────────────────────────────────────────────────────────────
// HÀM: checkLimit
// MỤC ĐÍCH: Kiểm tra hạn mức chi bộ máy còn lại có đủ cho khoản đề xuất chi hay không
// ─────────────────────────────────────────────────────────────────────────────
const checkLimit = async (namTaiChinh, soTienDeXuatChi) => {
  const budget = await getByYear(namTaiChinh);
  if (!budget) {
    return {
      exists: false,
      approved: false,
      conLai: 0,
      luyKeDaChi: 0,
      soTienDuToan: 0,
      vuotDuToan: true
    };
  }

  if (budget.trangthai !== 'Da duyet') {
    return {
      exists: true,
      approved: false,
      conLai: 0,
      luyKeDaChi: 0,
      soTienDuToan: parseFloat(budget.sotiendutoan),
      vuotDuToan: true
    };
  }

  const luyKeDaChi = await getAccumulatedExpense(namTaiChinh);
  const soTienDuToan = parseFloat(budget.sotiendutoan);
  const conLai = Math.max(0, soTienDuToan - luyKeDaChi);
  const vuotDuToan = soTienDeXuatChi > conLai;

  return {
    exists: true,
    approved: true,
    conLai,
    luyKeDaChi,
    soTienDuToan,
    vuotDuToan
  };
};

export default {
  createRequest,
  getRequestById,
  approveRequest,
  rejectRequest,
  getByYear,
  getAccumulatedExpense,
  checkLimit
};

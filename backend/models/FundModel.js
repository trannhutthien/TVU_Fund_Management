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
      trangThai || 'DANG_HOAT_DONG'  // Schema dùng DANG_HOAT_DONG (gạch dưới, chữ hoa)
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

// Lấy danh sách tất cả quỹ
const getAllFunds = async () => {
  const [rows] = await pool.query(
    `SELECT 
      q.quy_id,
      q.ten_quy,
      q.loai_quy,
      q.mo_ta,
      q.hinh_anh,
      q.so_tien_toi_thieu,
      q.so_tien_toi_da,
      q.so_luong_chi_tieu,
      q.han_nop_don,
      q.dieu_kien_tom_tat,
      q.so_du,
      q.ngay_tao,
      q.ngay_cap_nhat,
      q.trang_thai,
      COUNT(CASE WHEN yc.trang_thai = 'Da duyet' THEN 1 END) as so_don_da_nop,
      CASE 
        WHEN q.so_luong_chi_tieu IS NOT NULL AND q.so_luong_chi_tieu > 0 
        THEN ROUND((COUNT(CASE WHEN yc.trang_thai = 'Da duyet' THEN 1 END) / q.so_luong_chi_tieu) * 100, 0)
        ELSE 0
      END as phan_tram_da_nhan
     FROM quy q
     LEFT JOIN yeucauhotro yc ON q.quy_id = yc.quy_id
     GROUP BY q.quy_id, q.ten_quy, q.loai_quy, q.mo_ta, q.hinh_anh, 
              q.so_tien_toi_thieu, q.so_tien_toi_da, q.so_luong_chi_tieu, 
              q.han_nop_don, q.dieu_kien_tom_tat, q.so_du, q.ngay_tao, 
              q.ngay_cap_nhat, q.trang_thai
     ORDER BY q.ngay_tao DESC`
  );
  return rows;
};

// Lấy danh sách quỹ công khai (đang hoạt động)
const getPublicFunds = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        q.quy_id,
        q.ten_quy,
        q.loai_quy,
        q.mo_ta,
        q.hinh_anh,
        q.so_tien_toi_thieu,
        q.so_tien_toi_da,
        q.so_luong_chi_tieu,
        q.han_nop_don,
        q.dieu_kien_tom_tat,
        q.so_du,
        q.ngay_tao,
        q.ngay_cap_nhat,
        q.trang_thai,
        COUNT(CASE WHEN yc.trang_thai = 'Da duyet' THEN 1 END) as so_don_da_nop,
        CASE 
          WHEN q.so_luong_chi_tieu IS NOT NULL AND q.so_luong_chi_tieu > 0 
          THEN ROUND((COUNT(CASE WHEN yc.trang_thai = 'Da duyet' THEN 1 END) / q.so_luong_chi_tieu) * 100, 0)
          ELSE 0
        END as phan_tram_da_nhan
       FROM quy q
       LEFT JOIN yeucauhotro yc ON q.quy_id = yc.quy_id
       WHERE q.trang_thai IN ('Dang hoat dong', 'Tam dung')
       GROUP BY q.quy_id, q.ten_quy, q.loai_quy, q.mo_ta, q.hinh_anh, 
                q.so_tien_toi_thieu, q.so_tien_toi_da, q.so_luong_chi_tieu, 
                q.han_nop_don, q.dieu_kien_tom_tat, q.so_du, q.ngay_tao, 
                q.ngay_cap_nhat, q.trang_thai
       ORDER BY q.ngay_tao DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getPublicFunds:', error);
    throw error;
  }
};

export default {
  checkFundNameExists,
  createFund,
  getFundById,
  getAllFunds,
  getPublicFunds
};

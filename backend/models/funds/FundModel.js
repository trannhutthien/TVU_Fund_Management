import pool from "../../config/db.js";

// Kiểm tra tên quỹ đã tồn tại chưa
const checkFundNameExists = async (tenQuy) => {
  const [rows] = await pool.query(
    `SELECT quy_id FROM quy WHERE tenquy = ? LIMIT 1`,
    [tenQuy]
  );
  return rows.length > 0;
};

// Tạo quỹ mới
const createFund = async (fundData) => {
  const {
    tenQuy,
    loaiQuy, // string 'Tu thien', 'Hoc bong', etc.
    moTa,
    hinhAnh,
    soTienToiThieu, // maps to sotienmuctieu
    soTienToiDa, // maps to sotienhotrotoida
    soLuongChiTieu, // maps to soluonghotrotoida
    dieuKienTomTat, // maps to dieukienhotro
    hanNopDon, // maps to ngayketthuc
    soDu,
    nguoiTaoId,
    trangThai
  } = fundData;

  const [result] = await pool.execute(
    `INSERT INTO quy (
      tenquy, 
      loaiquy_id, 
      mota, 
      hinhanh,
      sotienmuctieu,
      sotienhotrotoida,
      soluonghotrotoida,
      dieukienhotro,
      ngayketthuc,
      sodu, 
      nguoitao_id,
      trangthai
    ) VALUES (?, (SELECT loaiquy_id FROM loaiquy WHERE maloai = ? LIMIT 1), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tenQuy,
      loaiQuy,
      moTa || null,
      hinhAnh || null,
      soTienToiThieu || null,
      soTienToiDa || null,
      soLuongChiTieu || null,
      dieuKienTomTat || null,
      hanNopDon || null,
      soDu || 0.00,
      nguoiTaoId || null,
      trangThai || 'Dang hoat dong'
    ]
  );

  return result;
};

// Lấy thông tin quỹ theo ID
const getFundById = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT 
      q.quy_id,
      q.tenquy AS ten_quy,
      lq.maloai AS loai_quy,
      q.mota AS mo_ta,
      q.hinhanh AS hinh_anh,
      q.sotienmuctieu AS so_tien_toi_thieu,
      q.sotienhotrotoida AS so_tien_toi_da,
      q.soluonghotrotoida AS so_luong_chi_tieu,
      q.dieukienhotro AS dieu_kien_tom_tat,
      q.ngaybatdau,
      q.ngayketthuc AS han_nop_don,
      q.sodu AS so_du,
      q.nguoitao_id,
      q.ngaytao AS ngay_tao,
      q.ngaycapnhat AS ngay_cap_nhat,
      q.trangthai AS trang_thai
     FROM quy q
     LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
     WHERE q.quy_id = ?
     LIMIT 1`,
    [quyId]
  );
  return rows[0] || null;
};

// Kiểm tra tên quỹ đã tồn tại cho quỹ khác chưa
const checkFundNameExistsForOther = async (tenQuy, quyId) => {
  const [rows] = await pool.query(
    `SELECT quy_id FROM quy WHERE tenquy = ? AND quy_id != ? LIMIT 1`,
    [tenQuy, quyId]
  );
  return rows.length > 0;
};

// Cập nhật thông tin quỹ
const updateFund = async (quyId, fundData) => {
  const {
    tenQuy,
    loaiQuy, // string 'Tu thien', 'Hoc bong', etc.
    moTa,
    hinhAnh,
    soTienToiThieu, // maps to sotienmuctieu
    soTienToiDa, // maps to sotienhotrotoida
    soLuongChiTieu, // maps to soluonghotrotoida
    dieuKienTomTat, // maps to dieukienhotro
    hanNopDon, // maps to ngayketthuc
    soDu,
    trangThai
  } = fundData;

  const [result] = await pool.execute(
    `UPDATE quy 
     SET tenquy = ?, 
         loaiquy_id = (SELECT loaiquy_id FROM loaiquy WHERE maloai = ? LIMIT 1), 
         mota = ?, 
         hinhanh = ?, 
         sotienmuctieu = ?, 
         sotienhotrotoida = ?, 
         soluonghotrotoida = ?, 
         dieukienhotro = ?, 
         ngayketthuc = ?, 
         sodu = ?, 
         trangthai = ?,
         ngaycapnhat = CURRENT_TIMESTAMP
     WHERE quy_id = ?`,
    [
      tenQuy,
      loaiQuy,
      moTa || null,
      hinhAnh || null,
      soTienToiThieu || null,
      soTienToiDa || null,
      soLuongChiTieu || null,
      dieuKienTomTat || null,
      hanNopDon || null,
      soDu || 0.00,
      trangThai,
      quyId
    ]
  );
  return result;
};

// Lấy danh sách tất cả quỹ
const getAllFunds = async () => {
  const [rows] = await pool.query(
    `SELECT 
      q.quy_id,
      q.tenquy AS ten_quy,
      lq.maloai AS loai_quy,
      q.mota AS mo_ta,
      q.hinhanh AS hinh_anh,
      q.sotienmuctieu AS so_tien_toi_thieu,
      q.sotienhotrotoida AS so_tien_toi_da,
      q.soluonghotrotoida AS so_luong_chi_tieu,
      q.dieukienhotro AS dieu_kien_tom_tat,
      q.ngaybatdau,
      q.ngayketthuc AS han_nop_don,
      q.sodu AS so_du,
      q.nguoitao_id,
      q.ngaytao AS ngay_tao,
      q.ngaycapnhat AS ngay_cap_nhat,
      q.trangthai AS trang_thai,
      COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) as so_don_da_nop,
      CASE 
        WHEN q.soluonghotrotoida IS NOT NULL AND q.soluonghotrotoida > 0 
        THEN ROUND((COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) / q.soluonghotrotoida) * 100, 0)
        ELSE 0
      END as phan_tram_da_nhan
     FROM quy q
     LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
     LEFT JOIN yeucauhotro yc ON q.quy_id = yc.quy_id
     GROUP BY q.quy_id, lq.maloai, q.ngaytao
     ORDER BY q.ngaytao DESC`
  );
  return rows;
};

// Lấy danh sách quỹ công khai (đang hoạt động)
const getPublicFunds = async () => {
  try {
    const [rows] = await pool.query(
      `SELECT 
        q.quy_id,
        q.tenquy AS ten_quy,
        lq.maloai AS loai_quy,
        q.mota AS mo_ta,
        q.hinhanh AS hinh_anh,
        q.sotienmuctieu AS so_tien_toi_thieu,
        q.sotienhotrotoida AS so_tien_toi_da,
        q.soluonghotrotoida AS so_luong_chi_tieu,
        q.dieukienhotro AS dieu_kien_tom_tat,
        q.ngaybatdau,
        q.ngayketthuc AS han_nop_don,
        q.sodu AS so_du,
        -- Tính số dư thực tế (trừ đi các khoản đang chờ giải ngân)
        (q.sodu - COALESCE(SUM(CASE WHEN yc.trangthai = 'Cho giai ngan' THEN yc.sotiendenghi ELSE 0 END), 0)) as so_du_thuc_te,
        q.nguoitao_id,
        q.ngaytao AS ngay_tao,
        q.ngaycapnhat AS ngay_cap_nhat,
        q.trangthai AS trang_thai,
        -- Đếm số đơn đã được duyệt (bao gồm cả đang chờ giải ngân và đã giải ngân)
        COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) as so_don_da_nop,
        -- Tính phần trăm dựa trên số đơn đã được duyệt
        CASE 
          WHEN q.soluonghotrotoida IS NOT NULL AND q.soluonghotrotoida > 0 
          THEN ROUND((COUNT(CASE WHEN yc.trangthai IN ('Da duyet cap 3', 'Cho giai ngan', 'Da giai ngan') THEN 1 END) / q.soluonghotrotoida) * 100, 0)
          ELSE 0
        END as phan_tram_da_nhan
       FROM quy q
       LEFT JOIN loaiquy lq ON q.loaiquy_id = lq.loaiquy_id
       LEFT JOIN yeucauhotro yc ON q.quy_id = yc.quy_id
       WHERE q.trangthai IN ('Dang hoat dong', 'Tam dung')
       GROUP BY q.quy_id, lq.maloai, q.ngaytao
       ORDER BY q.ngaytao DESC`
    );
    return rows;
  } catch (error) {
    console.error('Error in getPublicFunds:', error);
    throw error;
  }
};

// Cập nhật trạng thái quỹ
const updateFundStatus = async (quyId, trangThai) => {
  const [result] = await pool.execute(
    `UPDATE quy 
     SET trangthai = ?, 
         ngaycapnhat = CURRENT_TIMESTAMP 
     WHERE quy_id = ?`,
    [trangThai, quyId]
  );
  return result;
};

export default {
  checkFundNameExists,
  createFund,
  getFundById,
  getAllFunds,
  getPublicFunds,
  updateFundStatus,
  checkFundNameExistsForOther,
  updateFund
};

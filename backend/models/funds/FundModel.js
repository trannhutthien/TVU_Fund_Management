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
    loaiQuy, // string 'DT', 'NC', etc. (mã loại quỹ)
    moTa,
    hinhAnh,
    soTienMucTieu,
    soTienHoTroToiDa,
    soLuongChiTieu,
    dieuKienTomTat,
    hanNopDon,
    soDu,
    nguoiTao,
    trangThai,
    ngayBatDau
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
      ngaybatdau,
      ngayketthuc,
      sodu, 
      nguoitao_id,
      trangthai
    ) VALUES (
      ?, 
      (SELECT loaiquy_id FROM loaiquy WHERE maloai = ? LIMIT 1),
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )`,
    [
      tenQuy,
      loaiQuy, // mã loại quỹ (DT, NC, ...)
      moTa || null,
      hinhAnh || null,
      soTienMucTieu || null,
      soTienHoTroToiDa || null,
      soLuongChiTieu || null,
      dieuKienTomTat || null,
      ngayBatDau || null,
      hanNopDon || null,
      soDu || 0.00,
      nguoiTao || null,
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
      lq.loaiquy_id,
      lq.maloai AS loai_quy,
      lq.tenloai AS ten_loai_quy,
      q.mota AS mo_ta,
      q.hinhanh AS hinh_anh,
      q.sotienmuctieu AS so_tien_muc_tieu,
      q.sotienmuctieu AS so_tien_toi_thieu,
      q.sotienhotrotoida AS so_tien_ho_tro_toi_da,
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
    loaiQuy, // string 'DT', 'NC', etc.
    moTa,
    hinhAnh,
    soTienMucTieu,
    soTienHoTroToiDa,
    soLuongChiTieu,
    dieuKienTomTat,
    hanNopDon,
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
      soTienMucTieu || null,
      soTienHoTroToiDa || null,
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
      lq.loaiquy_id,
      lq.maloai AS loai_quy,
      lq.tenloai AS ten_loai_quy,
      q.mota AS mo_ta,
      q.hinhanh AS hinh_anh,
      q.sotienmuctieu AS so_tien_muc_tieu,
      q.sotienmuctieu AS so_tien_toi_thieu,
      q.sotienhotrotoida AS so_tien_ho_tro_toi_da,
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
     GROUP BY q.quy_id, lq.loaiquy_id, lq.maloai, lq.tenloai, q.ngaytao
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
        lq.loaiquy_id,
        lq.maloai AS loai_quy,
        lq.tenloai AS ten_loai_quy,
        q.mota AS mo_ta,
        q.hinhanh AS hinh_anh,
        q.sotienmuctieu AS so_tien_muc_tieu,
        q.sotienmuctieu AS so_tien_toi_thieu,
        q.sotienhotrotoida AS so_tien_ho_tro_toi_da,
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
       GROUP BY q.quy_id, lq.loaiquy_id, lq.maloai, lq.tenloai, q.ngaytao
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

// Lấy thống kê của quỹ (số khoản tài trợ + số đơn đã hỗ trợ)
const getFundStats = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT 
      -- Số khoản tài trợ đã được xác nhận nhận tiền
      (SELECT COUNT(*) FROM khoantaitro WHERE quy_id = ? AND trangthai = 'Da nhan') as soKhoanTaiTro,
      -- Số đơn đã hỗ trợ công khai
      (SELECT COUNT(*) FROM yeucauhotro 
       WHERE quy_id = ? 
       AND trangthai = 'Da giai ngan') as soDonDaHoTro
    `,
    [quyId, quyId]
  );
  return rows[0] || { soKhoanTaiTro: 0, soDonDaHoTro: 0 };
};

// Lấy danh sách khoản tài trợ đã nhận của một quỹ để hiển thị công khai
const getReceivedDonationsByFundId = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT
      kt.khoantaitro_id,
      kt.nhataitro_id,
      kt.quy_id,
      kt.sotien,
      kt.hinhthuc,
      kt.ngaytaitro,
      kt.trangthai,
      kt.ghichu,
      ntt.tennhataitro,
      ntt.loainhataitro,
      ntt.logo
     FROM khoantaitro kt
     INNER JOIN nhataitro ntt ON kt.nhataitro_id = ntt.nhataitro_id
     WHERE kt.quy_id = ?
       AND kt.trangthai = 'Da nhan'
     ORDER BY kt.ngaytaitro DESC, kt.ngaytao DESC`,
    [quyId]
  );
  return rows;
};

// Lấy danh sách đơn đã giải ngân của một quỹ để hiển thị công khai
const getDisbursedApplicationsByFundId = async (quyId) => {
  const [rows] = await pool.query(
    `SELECT
      yc.yeucauhotro_id,
      yc.nguoidung_id,
      yc.quy_id,
      yc.sotiendenghi,
      yc.trangthai,
      yc.ngaynop,
      yc.ngaycapnhat,
      nd.hoten AS hoten_sinhvien,
      nd.masodinhdanh
     FROM yeucauhotro yc
     INNER JOIN nguoidung nd ON yc.nguoidung_id = nd.nguoidung_id
     WHERE yc.quy_id = ?
       AND yc.trangthai = 'Da giai ngan'
     ORDER BY yc.ngaycapnhat DESC, yc.ngaynop DESC`,
    [quyId]
  );
  return rows;
};

export default {
  checkFundNameExists,
  createFund,
  getFundById,
  getAllFunds,
  getPublicFunds,
  updateFundStatus,
  checkFundNameExistsForOther,
  updateFund,
  getFundStats,
  getReceivedDonationsByFundId,
  getDisbursedApplicationsByFundId
};
